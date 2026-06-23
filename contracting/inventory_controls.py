from __future__ import annotations

import re

import frappe
from frappe import _
from frappe.utils import cint, flt


def _serial_numbers(value: str | None) -> list[str]:
	return [part.strip() for part in re.split(r"[\n,]+", value or "") if part.strip()]


def _movement_rows(doc):
	if doc.doctype == "Purchase Receipt":
		return [(row, "incoming", row.warehouse, row.qty) for row in doc.items]
	if doc.doctype == "Purchase Invoice" and cint(doc.update_stock):
		return [(row, "incoming", row.warehouse, row.qty) for row in doc.items]
	if doc.doctype == "Delivery Note":
		return [(row, "outgoing", row.warehouse, row.qty) for row in doc.items]
	if doc.doctype == "Sales Invoice" and cint(doc.update_stock):
		return [(row, "outgoing", row.warehouse, row.qty) for row in doc.items]
	if doc.doctype == "Stock Entry":
		rows = []
		for row in doc.items:
			if row.s_warehouse:
				rows.append((row, "outgoing", row.s_warehouse, row.transfer_qty or row.qty))
			elif row.t_warehouse:
				rows.append((row, "incoming", row.t_warehouse, row.transfer_qty or row.qty))
		return rows
	return []


def validate_serial_and_batch(doc, method=None):
	"""Require an explicit batch/serial selection for every tracked stock movement."""
	for row, direction, warehouse, quantity in _movement_rows(doc):
		if not row.item_code:
			continue
		tracked = frappe.db.get_value(
			"Item", row.item_code, ["has_batch_no", "has_serial_no"], as_dict=True
		)
		if not tracked or not (tracked.has_batch_no or tracked.has_serial_no):
			continue

		row.use_serial_batch_fields = 1
		if row.get("serial_and_batch_bundle"):
			continue

		row_number = row.idx or "?"
		if tracked.has_batch_no and not row.get("batch_no"):
			frappe.throw(
				_("Row {0}: Select a Batch Number for item {1} before this stock movement.").format(
					row_number, frappe.bold(row.item_code)
				),
				title=_("Batch Number Required"),
			)

		if tracked.has_serial_no:
			serials = _serial_numbers(row.get("serial_no"))
			if not serials:
				frappe.throw(
					_("Row {0}: Enter or select Serial Numbers for item {1}.").format(
						row_number, frappe.bold(row.item_code)
					),
					title=_("Serial Numbers Required"),
				)
			expected = abs(flt(quantity))
			if expected == int(expected) and len(serials) != int(expected):
				frappe.throw(
					_("Row {0}: Quantity is {1}, but {2} Serial Numbers were supplied for item {3}.").format(
						row_number, int(expected), len(serials), frappe.bold(row.item_code)
					),
					title=_("Serial Number Count Mismatch"),
				)

		if direction == "outgoing" and not warehouse:
			frappe.throw(
				_("Row {0}: A source warehouse is required for tracked item {1}.").format(
					row_number, frappe.bold(row.item_code)
				)
			)


def configure_serial_batch_fields():
	"""Keep legacy batch/serial fields visible; ERPNext converts them to bundles on submit."""
	settings = frappe.get_single("Stock Settings")
	changed = False
	for field, value in {
		"use_serial_batch_fields": 1,
		"disable_serial_no_and_batch_selector": 0,
		"auto_create_serial_and_batch_bundle_for_outward": 0,
	}.items():
		if settings.meta.has_field(field) and cint(settings.get(field)) != value:
			settings.set(field, value)
			changed = True
	if changed:
		settings.save(ignore_permissions=True)

	grid_layouts = {
		"Purchase Receipt Item": {
			"item_code": 2, "qty": 1, "batch_no": 2, "serial_no": 2, "rate": 1, "amount": 2,
			"rejected_qty": 0, "net_amount": 0, "warehouse": 0,
		},
		"Stock Entry Detail": {
			"s_warehouse": 1, "t_warehouse": 1, "item_code": 2, "qty": 1, "batch_no": 2, "serial_no": 3,
			"basic_rate": 0,
		},
	}
	for doctype, layout in grid_layouts.items():
		for fieldname, columns in layout.items():
			frappe.make_property_setter(
				{
					"doctype": doctype,
					"fieldname": fieldname,
					"property": "in_list_view",
					"value": "1" if columns else "0",
					"property_type": "Check",
				},
				validate_fields_for_doctype=False,
			)
			if columns:
				frappe.make_property_setter(
					{
						"doctype": doctype,
						"fieldname": fieldname,
						"property": "columns",
						"value": str(columns),
						"property_type": "Int",
					},
					validate_fields_for_doctype=False,
				)

	for doctype in ("Delivery Note Item", "Sales Invoice Item"):
		for fieldname in ("batch_no", "serial_no"):
			frappe.make_property_setter(
				{"doctype": doctype, "fieldname": fieldname, "property": "in_list_view", "value": "1", "property_type": "Check"},
				validate_fields_for_doctype=False,
			)
	frappe.clear_cache()

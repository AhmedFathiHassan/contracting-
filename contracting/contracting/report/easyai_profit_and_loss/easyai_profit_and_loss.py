from __future__ import annotations

import frappe
from frappe import _
from frappe.utils import flt, get_first_day, get_last_day, getdate, today


VOUCHER_COLUMNS = (
	("sales_invoice", "Sales Invoice"),
	("purchase_invoice", "Purchase Invoice"),
	("journal_entry", "Journal Entry"),
	("expense_claim", "Expense Claim"),
)


def execute(filters=None):
	filters = frappe._dict(filters or {})
	company = filters.company or frappe.defaults.get_user_default("Company")
	if not company:
		frappe.throw(_("Company is required."))

	current = getdate(today())
	from_date = getdate(filters.from_date or get_first_day(current.replace(month=1, day=1)))
	to_date = getdate(filters.to_date or get_last_day(current.replace(month=12, day=1)))
	if from_date > to_date:
		frappe.throw(_("From Date cannot be after To Date."))

	conditions = ["gle.company = %(company)s", "gle.posting_date between %(from_date)s and %(to_date)s", "gle.is_cancelled = 0", "a.root_type in ('Income', 'Expense')"]
	values = {"company": company, "from_date": from_date, "to_date": to_date}
	if filters.cost_center:
		conditions.append("gle.cost_center = %(cost_center)s")
		values["cost_center"] = filters.cost_center

	sign = "case when a.root_type = 'Income' then gle.credit - gle.debit else gle.debit - gle.credit end"
	voucher_sql = ",\n".join(
		f"sum(case when gle.voucher_type = '{voucher}' then {sign} else 0 end) as {fieldname}"
		for fieldname, voucher in VOUCHER_COLUMNS
	)
	known = ", ".join(f"'{voucher}'" for _, voucher in VOUCHER_COLUMNS)
	rows = frappe.db.sql(
		f"""
		select a.root_type, gle.account, a.account_name,
			{voucher_sql},
			sum(case when gle.voucher_type not in ({known}) then {sign} else 0 end) as other,
			sum({sign}) as total
		from `tabGL Entry` gle
		inner join `tabAccount` a on a.name = gle.account
		where {' and '.join(conditions)}
		group by a.root_type, gle.account, a.account_name
		having abs(total) > 0.000001
		order by field(a.root_type, 'Income', 'Expense'), gle.account
		""",
		values,
		as_dict=True,
	)

	data = []
	totals = {"Income": 0.0, "Expense": 0.0}
	for root_type in ("Income", "Expense"):
		group_rows = [row for row in rows if row.root_type == root_type]
		for row in group_rows:
			row.indent = 1
			data.append(row)
			totals[root_type] += flt(row.total)
		data.append({"account": _("Total {0}").format(_(root_type)), "root_type": root_type, "total": totals[root_type], "is_total": 1})

	net_profit = totals["Income"] - totals["Expense"]
	data.append({"account": _("Net Profit / Loss"), "root_type": "Profit", "total": net_profit, "is_total": 1})

	currency = frappe.db.get_value("Company", company, "default_currency")
	columns = [
		{"fieldname": "root_type", "label": _("Type"), "fieldtype": "Data", "width": 90},
		{"fieldname": "account", "label": _("Account"), "fieldtype": "Link", "options": "Account", "width": 230},
		{"fieldname": "account_name", "label": _("Account Name"), "fieldtype": "Data", "width": 180},
	]
	columns.extend(
		{"fieldname": fieldname, "label": _(voucher), "fieldtype": "Currency", "options": currency, "width": 130}
		for fieldname, voucher in VOUCHER_COLUMNS
	)
	columns.extend([
		{"fieldname": "other", "label": _("Other Vouchers"), "fieldtype": "Currency", "options": currency, "width": 125},
		{"fieldname": "total", "label": _("Total"), "fieldtype": "Currency", "options": currency, "width": 140},
	])
	chart = {
		"data": {"labels": [_('Income'), _('Expense'), _('Net Profit / Loss')], "datasets": [{"values": [totals['Income'], totals['Expense'], net_profit]}]},
		"type": "bar",
		"colors": ["#ff6500"],
	}
	report_summary = [
		{"value": totals["Income"], "label": _("Total Income"), "datatype": "Currency", "currency": currency, "indicator": "Green"},
		{"value": totals["Expense"], "label": _("Total Expenses"), "datatype": "Currency", "currency": currency, "indicator": "Red"},
		{"value": net_profit, "label": _("Net Profit / Loss"), "datatype": "Currency", "currency": currency, "indicator": "Green" if net_profit >= 0 else "Red"},
	]
	return columns, data, None, chart, report_summary

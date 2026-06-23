frappe.ui.form.on("Stock Entry", {
	refresh(frm) {
		const grid = frm.fields_dict?.items?.grid;
		if (!grid) return;
		const columns = { s_warehouse: 1, t_warehouse: 1, item_code: 2, qty: 1, batch_no: 2, serial_no: 3 };
		(grid.docfields || []).forEach((field) => {
			if (!field.fieldname) return;
			grid.update_docfield_property(field.fieldname, "in_list_view", columns[field.fieldname] ? 1 : 0);
			if (columns[field.fieldname]) grid.update_docfield_property(field.fieldname, "columns", columns[field.fieldname]);
		});
		["batch_no", "serial_no"].forEach((fieldname) => grid.update_docfield_property(fieldname, "hidden", 0));
		grid.setup_visible_columns();
		grid.refresh();
	},
});

frappe.ui.form.on("Stock Entry Detail", {
	item_code(frm, cdt, cdn) {
		frappe.model.set_value(cdt, cdn, "use_serial_batch_fields", 1);
	},
});

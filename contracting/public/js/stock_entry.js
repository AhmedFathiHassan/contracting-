frappe.ui.form.on("Stock Entry", {
	refresh(frm) {
		const grid = frm.fields_dict?.items?.grid;
		if (!grid) return;
		["batch_no", "serial_no"].forEach((fieldname) => {
			grid.update_docfield_property(fieldname, "in_list_view", 1);
			grid.update_docfield_property(fieldname, "hidden", 0);
		});
	},
});

frappe.ui.form.on("Stock Entry Detail", {
	item_code(frm, cdt, cdn) {
		frappe.model.set_value(cdt, cdn, "use_serial_batch_fields", 1);
	},
});

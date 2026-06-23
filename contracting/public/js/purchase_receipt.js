function easyai_prepare_tracking_grid(frm) {
	const grid = frm.fields_dict?.items?.grid;
	if (!grid) return;
	const columns = { item_code: 2, qty: 1, batch_no: 2, serial_no: 2, rate: 1, amount: 2 };
	(grid.docfields || []).forEach((field) => {
		if (!field.fieldname) return;
		grid.update_docfield_property(field.fieldname, "in_list_view", columns[field.fieldname] ? 1 : 0);
		if (columns[field.fieldname]) grid.update_docfield_property(field.fieldname, "columns", columns[field.fieldname]);
	});
	["batch_no", "serial_no"].forEach((fieldname) => grid.update_docfield_property(fieldname, "hidden", 0));
	grid.setup_visible_columns();
	grid.refresh();
}

frappe.ui.form.on("Purchase Receipt", {
	refresh: easyai_prepare_tracking_grid,
	onload_post_render: easyai_prepare_tracking_grid,
});

frappe.ui.form.on("Purchase Receipt Item", {
	item_code(frm, cdt, cdn) {
		frappe.model.set_value(cdt, cdn, "use_serial_batch_fields", 1);
	},
});

function easyai_prepare_tracking_grid(frm) {
	const grid = frm.fields_dict?.items?.grid;
	if (!grid) return;
	["batch_no", "serial_no"].forEach((fieldname) => {
		grid.update_docfield_property(fieldname, "in_list_view", 1);
		grid.update_docfield_property(fieldname, "hidden", 0);
	});
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

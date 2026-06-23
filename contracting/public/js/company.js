frappe.ui.form.on("Company", {
	refresh(frm) {
		if (frm.is_new() || !["System Manager", "Accounts Manager"].some((role) => frappe.user.has_role(role))) return;
		frm.add_custom_button(__("Add / Repair Default Chart of Accounts"), async () => {
			frappe.confirm(
				__("Create a standard Chart of Accounts when missing and repair empty company defaults?"),
				async () => {
					const response = await frappe.call({
						method: "contracting.accounting_controls.ensure_default_chart_of_accounts",
						args: { company: frm.doc.name },
						freeze: true,
						freeze_message: __("Checking accounting structure..."),
					});
					const result = response.message || {};
					frappe.msgprint({
						title: __("Chart of Accounts Ready"),
						indicator: "green",
						message: result.created
							? __("The default Chart of Accounts was created successfully.")
							: __("The existing Chart of Accounts was checked. {0} company defaults were repaired.", [result.repaired?.length || 0]),
					});
					frm.reload_doc();
				},
			);
		}, __("Accounting Controls"));
	},
});

import frappe


def restore_core_permission_manager_route():
	"""Rename the custom Single DocType so Frappe's core page keeps its route."""
	old_name = "Permission Manager"
	new_name = "Permission Manager Tool"
	if frappe.db.exists("DocType", old_name) and not frappe.db.exists("DocType", new_name):
		original_developer_mode = frappe.conf.get("developer_mode")
		original_patch_flag = frappe.flags.in_patch
		try:
			frappe.conf.developer_mode = 1
			frappe.flags.in_patch = True
			frappe.rename_doc("DocType", old_name, new_name, force=True)
		finally:
			frappe.conf.developer_mode = original_developer_mode
			frappe.flags.in_patch = original_patch_flag

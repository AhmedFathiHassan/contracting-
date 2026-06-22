import frappe


def restore_core_permission_manager_route():
	"""Rename the custom Single DocType so Frappe's core page keeps its route."""
	old_name = "Permission Manager"
	new_name = "Permission Manager Tool"
	if frappe.db.exists("DocType", old_name) and not frappe.db.exists("DocType", new_name):
		frappe.rename_doc("DocType", old_name, new_name, force=True)

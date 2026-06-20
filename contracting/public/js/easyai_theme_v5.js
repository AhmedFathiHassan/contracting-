(() => {
	"use strict";

	const STORAGE_COLOR = "easyai-color";
	const COLORS = ["orange", "ocean", "forest", "violet"];
	const COLOR_LABELS = {
		orange: "Orange",
		ocean: "Ocean",
		forest: "Forest",
		violet: "Violet",
	};

	const translations = {
		en: {
			appearance: "Appearance",
			appearanceHint: "Choose your EasyAi color and language.",
			welcome: "Your work, simplified.",
			description: "A clear view of projects, customers, sales and daily operations.",
			eyebrow: "EASYAI WORKSPACE",
			newProject: "New Project",
			projects: "View Projects",
			newCustomer: "New Customer",
			newQuotation: "New Quotation",
			density: "Display density",
			comfortable: "Comfortable",
			compact: "Compact",
			focus: "Focus mode",
			focusHint: "Hide distractions",
			quickAddItem: "Quick Add Item",
			createItem: "Create a new item",
			itemCreated: "Item created and added to the invoice",
		},
		ar: {
			appearance: "المظهر",
			appearanceHint: "اختر لون EasyAi واللغة المفضلة.",
			welcome: "أعمالك أصبحت أبسط.",
			description: "نظرة واضحة على المشاريع والعملاء والمبيعات والعمليات اليومية.",
			eyebrow: "مساحة عمل EASYAI",
			newProject: "مشروع جديد",
			projects: "عرض المشاريع",
			newCustomer: "عميل جديد",
			newQuotation: "عرض سعر جديد",
			density: "كثافة العرض",
			comfortable: "مريح",
			compact: "مدمج",
			focus: "وضع التركيز",
			focusHint: "إخفاء المشتتات",
			quickAddItem: "إضافة صنف سريعاً",
			createItem: "إنشاء صنف جديد",
			itemCreated: "تم إنشاء الصنف وإضافته إلى الفاتورة",
		},
	};

	function currentLanguage() {
		const bootLanguage = window.frappe?.boot?.lang;
		const documentLanguage = document.documentElement.lang;
		return String(bootLanguage || documentLanguage || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
	}

	function copy() {
		return translations[currentLanguage()];
	}

	function brandMarkup(extraClass = "") {
		return `<span class="easyai-brand ${extraClass}" aria-label="EasyAi"><span>Easy</span><span class="easyai-brand__ai">Ai</span><span class="easyai-brand__dot"></span></span>`;
	}

	function applyColor(color) {
		const safeColor = COLORS.includes(color) ? color : "orange";
		document.documentElement.dataset.easyaiColor = safeColor;
		localStorage.setItem(STORAGE_COLOR, safeColor);
		document.querySelectorAll(".easyai-color-option").forEach((button) => {
			button.classList.toggle("is-active", button.dataset.color === safeColor);
		});
	}

	function applyDensity(density) {
		const safeDensity = density === "compact" ? "compact" : "comfortable";
		document.documentElement.dataset.easyaiDensity = safeDensity;
		localStorage.setItem("easyai-density", safeDensity);
		document.querySelectorAll("[data-density]").forEach((button) => {
			button.classList.toggle("is-active", button.dataset.density === safeDensity);
		});
	}

	function toggleFocus(force) {
		const active = typeof force === "boolean" ? force : !document.documentElement.classList.contains("easyai-focus");
		document.documentElement.classList.toggle("easyai-focus", active);
		localStorage.setItem("easyai-focus", active ? "1" : "0");
		const button = document.querySelector("[data-easyai-focus]");
		button?.classList.toggle("is-active", active);
		button?.setAttribute("aria-pressed", String(active));
	}

	async function changeLanguage(language) {
		const lang = language === "ar" ? "ar" : "en";
		document.cookie = `preferred_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
		localStorage.setItem("easyai-language", lang);
		document.documentElement.lang = lang;
		document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

		try {
			if (window.frappe?.session?.user && frappe.session.user !== "Guest" && frappe.db?.set_value) {
				await frappe.db.set_value("User", frappe.session.user, "language", lang);
			}
		} catch (error) {
			console.info("EasyAi: language saved for this browser only.", error);
		}

		window.location.reload();
	}

	function mountBrand() {
		document.documentElement.classList.add("easyai-theme");
		document.title = document.title.replace(/ERPNext|Frappe/gi, "EasyAi");

		const navbarBrand = document.querySelector(".navbar .navbar-brand, .navbar .navbar-home");
		if (navbarBrand && !navbarBrand.querySelector(".easyai-brand")) {
			navbarBrand.innerHTML = brandMarkup();
		}

		const loginHead = document.querySelector(".login-content .page-card-head, .page-card-head");
		if (loginHead && !loginHead.querySelector(".easyai-login-brand")) {
			loginHead.insertAdjacentHTML(
				"afterbegin",
				`${brandMarkup("easyai-login-brand")}<p class="easyai-login-subtitle">Simple business management, built for your team.</p>`
			);
		}
	}

	function applyWhiteLabel() {
		const blockedParents = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		const nodes = [];
		let node;
		while ((node = walker.nextNode())) nodes.push(node);

		nodes.forEach((textNode) => {
			if (!textNode.parentElement || blockedParents.has(textNode.parentElement.tagName)) return;
			if (/ERPNext|Frappe/i.test(textNode.nodeValue)) {
				textNode.nodeValue = textNode.nodeValue.replace(/ERPNext|Frappe/gi, "EasyAi");
			}
		});

		document.querySelectorAll("[title], [aria-label], [placeholder]").forEach((element) => {
			["title", "aria-label", "placeholder"].forEach((attribute) => {
				const value = element.getAttribute(attribute);
				if (value && /ERPNext|Frappe/i.test(value)) {
					element.setAttribute(attribute, value.replace(/ERPNext|Frappe/gi, "EasyAi"));
				}
			});
		});

		const loginTitle = document.querySelector(".login-content .page-card-head h4, .for-login .page-card-head h4");
		if (loginTitle) loginTitle.textContent = currentLanguage() === "ar" ? "تسجيل الدخول إلى EasyAi" : "Welcome to EasyAi";

		const homeTitle = document.querySelector(".workspace-container .page-title .title-text");
		if (homeTitle && homeTitle.textContent.trim() === "Home") {
			homeTitle.textContent = currentLanguage() === "ar" ? "الرئيسية" : "EasyAi Home";
		}

		document.querySelectorAll(".dropdown-menu li, .dropdown-menu a").forEach((item) => {
			if (/Documentation|Frappe Support|ERPNext Support/i.test(item.textContent)) {
				item.closest("li")?.classList.add("easyai-hidden-vendor-link");
			}
		});

		let favicon = document.querySelector('link[rel="icon"]');
		if (!favicon) {
			favicon = document.createElement("link");
			favicon.rel = "icon";
			document.head.appendChild(favicon);
		}
		favicon.href = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#f97316"/><text x="32" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="white">EA</text></svg>');
	}

	function controlsMarkup() {
		const text = copy();
		const language = currentLanguage();
		const density = localStorage.getItem("easyai-density") || "comfortable";
		const focusActive = localStorage.getItem("easyai-focus") === "1";
		return `
			<div class="easyai-tools">
				<button class="easyai-tool-button" type="button" data-easyai-panel-toggle aria-expanded="false">
					<span class="easyai-tool-dot"></span><span class="easyai-tool-button__label">${text.appearance}</span>
				</button>
				<div class="easyai-theme-panel" hidden>
					<p class="easyai-theme-panel__title">${text.appearance}</p>
					<p class="easyai-theme-panel__hint">${text.appearanceHint}</p>
					<div class="easyai-color-options" aria-label="Color theme">
						${COLORS.map((color) => `<button type="button" class="easyai-color-option" data-color="${color}" title="${COLOR_LABELS[color]}" style="--swatch:${{ orange: "#f97316", ocean: "#0ea5e9", forest: "#10b981", violet: "#8b5cf6" }[color]}"></button>`).join("")}
					</div>
					<div class="easyai-language-options">
						<button type="button" class="easyai-language-option ${language === "en" ? "is-active" : ""}" data-language="en">English</button>
						<button type="button" class="easyai-language-option ${language === "ar" ? "is-active" : ""}" data-language="ar">العربية</button>
					</div>
					<div class="easyai-preference-section">
						<span class="easyai-preference-label">${text.density}</span>
						<div class="easyai-density-options">
							<button type="button" class="easyai-preference-button ${density === "comfortable" ? "is-active" : ""}" data-density="comfortable">${text.comfortable}</button>
							<button type="button" class="easyai-preference-button ${density === "compact" ? "is-active" : ""}" data-density="compact">${text.compact}</button>
						</div>
						<button type="button" class="easyai-focus-button ${focusActive ? "is-active" : ""}" data-easyai-focus aria-pressed="${focusActive}">
							<span><strong>${text.focus}</strong><small>${text.focusHint}</small></span><span class="easyai-switch"></span>
						</button>
					</div>
				</div>
			</div>`;
	}

	function mountControls() {
		if (document.querySelector(".easyai-tools")) return;
		document.body.insertAdjacentHTML("beforeend", controlsMarkup());
		applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");
		applyDensity(localStorage.getItem("easyai-density") || "comfortable");
		toggleFocus(localStorage.getItem("easyai-focus") === "1");

		const tools = document.querySelector(".easyai-tools");
		const panel = tools.querySelector(".easyai-theme-panel");
		const toggle = tools.querySelector("[data-easyai-panel-toggle]");

		toggle.addEventListener("click", () => {
			panel.hidden = !panel.hidden;
			toggle.setAttribute("aria-expanded", String(!panel.hidden));
		});

		tools.addEventListener("click", (event) => {
			const colorButton = event.target.closest("[data-color]");
			const languageButton = event.target.closest("[data-language]");
			const densityButton = event.target.closest("[data-density]");
			const focusButton = event.target.closest("[data-easyai-focus]");
			if (colorButton) applyColor(colorButton.dataset.color);
			if (languageButton) changeLanguage(languageButton.dataset.language);
			if (densityButton) applyDensity(densityButton.dataset.density);
			if (focusButton) toggleFocus();
		});

		document.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
				event.preventDefault();
				toggleFocus();
			}
		});

		document.addEventListener("click", (event) => {
			if (!tools.contains(event.target)) {
				panel.hidden = true;
				toggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	function workspaceHeroMarkup() {
		const text = copy();
		return `
			<section class="easyai-workspace-hero">
				<div class="easyai-workspace-hero__content">
					<div>
						<div class="easyai-workspace-hero__eyebrow"><span class="easyai-tool-dot"></span>${text.eyebrow}</div>
						<h2>${text.welcome}</h2>
						<p>${text.description}</p>
					</div>
					<div class="easyai-quick-actions">
						<button class="easyai-quick-action" data-doctype="Project" data-action="new"><span class="easyai-quick-action__icon">+</span>${text.newProject}</button>
						<button class="easyai-quick-action" data-doctype="Project" data-action="list"><span class="easyai-quick-action__icon">↗</span>${text.projects}</button>
						<button class="easyai-quick-action" data-doctype="Customer" data-action="new"><span class="easyai-quick-action__icon">+</span>${text.newCustomer}</button>
						<button class="easyai-quick-action" data-doctype="Quotation" data-action="new"><span class="easyai-quick-action__icon">+</span>${text.newQuotation}</button>
					</div>
				</div>
			</section>`;
	}

	function mountWorkspaceHero() {
		if (!window.frappe || document.querySelector(".easyai-workspace-hero")) return;
		const workspace = document.querySelector(".layout-main-section .workspace-container, .workspace-container");
		if (!workspace) return;
		workspace.insertAdjacentHTML("afterbegin", workspaceHeroMarkup());

		workspace.querySelector(".easyai-workspace-hero").addEventListener("click", (event) => {
			const actionButton = event.target.closest("[data-doctype]");
			if (!actionButton) return;
			const doctype = actionButton.dataset.doctype;
			if (actionButton.dataset.action === "new" && frappe.new_doc) {
				frappe.new_doc(doctype);
			} else {
				frappe.set_route("List", doctype, "List");
			}
		});
	}

	function openQuickItemDialog(frm) {
		const text = copy();
		const dialog = new frappe.ui.Dialog({
			title: text.createItem,
			size: "small",
			fields: [
				{ fieldname: "item_code", fieldtype: "Data", label: __("Item Code"), reqd: 1 },
				{ fieldname: "item_name", fieldtype: "Data", label: __("Item Name") },
				{ fieldtype: "Column Break" },
				{ fieldname: "item_group", fieldtype: "Link", options: "Item Group", label: __("Item Group"), reqd: 1 },
				{ fieldname: "stock_uom", fieldtype: "Link", options: "UOM", label: __("Stock UOM"), reqd: 1, default: "Nos" },
				{ fieldtype: "Section Break" },
				{ fieldname: "standard_rate", fieldtype: "Currency", label: __("Standard Selling Rate"), default: 0 },
				{ fieldname: "is_stock_item", fieldtype: "Check", label: __("Maintain Stock"), default: 1 },
			],
			primary_action_label: __("Create and Add"),
			primary_action: async (values) => {
				dialog.disable_primary_action();
				try {
					const result = await frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "Item",
								item_code: values.item_code,
								item_name: values.item_name || values.item_code,
								item_group: values.item_group,
								stock_uom: values.stock_uom,
								standard_rate: values.standard_rate || 0,
								is_stock_item: values.is_stock_item ? 1 : 0,
							},
						},
						freeze: true,
						freeze_message: __("Creating item..."),
					});

					const item = result.message;
					const grid = frm.fields_dict.items.grid;
					const targetRow = grid.grid_rows.find((row) => row.grid_form?.wrapper?.is(":visible"))
						|| grid.grid_rows.find((row) => row.doc.__islocal && !row.doc.item_code);

					if (targetRow) {
						await frappe.model.set_value(targetRow.doc.doctype, targetRow.doc.name, "item_code", item.name);
					} else {
						const child = frm.add_child("items");
						await frappe.model.set_value(child.doctype, child.name, "item_code", item.name);
					}

					frm.refresh_field("items");
					dialog.hide();
					frappe.show_alert({ message: text.itemCreated, indicator: "green" });
				} catch (error) {
					dialog.enable_primary_action();
					throw error;
				}
			},
		});

		dialog.show();
		dialog.get_field("item_code")?.set_focus();
	}

	function enhanceInvoiceItems() {
		const frm = window.cur_frm;
		if (!frm || !["Sales Invoice", "Purchase Invoice"].includes(frm.doctype)) return;
		const grid = frm.fields_dict?.items?.grid;
		if (!grid || grid.wrapper.find(".easyai-quick-item-button").length) return;
		if (frappe.model?.can_create && !frappe.model.can_create("Item")) return;

		const button = grid.add_custom_button(copy().quickAddItem, () => openQuickItemDialog(frm));
		button?.addClass("easyai-quick-item-button");
		grid.wrapper.find(".grid-add-row").addClass("easyai-grid-add-row");
	}

	function registerInvoiceEnhancements() {
		if (!window.frappe?.ui?.form || window.__easyaiInvoiceEnhancementsRegistered) {
			enhanceInvoiceItems();
			return;
		}

		window.__easyaiInvoiceEnhancementsRegistered = true;
		["Sales Invoice", "Purchase Invoice"].forEach((doctype) => {
			frappe.ui.form.on(doctype, {
				refresh: enhanceInvoiceItems,
				onload_post_render: enhanceInvoiceItems,
				items_on_form_rendered: enhanceInvoiceItems,
			});
		});
		enhanceInvoiceItems();
	}

	function applyEasyAi() {
		mountBrand();
		applyWhiteLabel();
		mountControls();
		mountWorkspaceHero();
		registerInvoiceEnhancements();
	}

	applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");
	applyDensity(localStorage.getItem("easyai-density") || "comfortable");
	toggleFocus(localStorage.getItem("easyai-focus") === "1");
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", applyEasyAi, { once: true });
	} else {
		applyEasyAi();
	}

	window.addEventListener("load", applyEasyAi, { once: true });
	const observer = new MutationObserver(() => {
		window.clearTimeout(window.__easyaiThemeTimer);
		window.__easyaiThemeTimer = window.setTimeout(applyEasyAi, 100);
	});
	observer.observe(document.documentElement, { childList: true, subtree: true });
})();

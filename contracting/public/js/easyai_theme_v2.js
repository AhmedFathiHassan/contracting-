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
		if (/ERPNext|Frappe/i.test(document.title)) {
			document.title = document.title.replace(/ERPNext|Frappe/gi, "EasyAi");
		}

		const navbarBrand = document.querySelector(".navbar .navbar-brand, .navbar .navbar-home");
		if (navbarBrand && !navbarBrand.querySelector(".easyai-brand")) {
			navbarBrand.insertAdjacentHTML("beforeend", brandMarkup());
		}

		const loginHead = document.querySelector(".login-content .page-card-head, .page-card-head");
		if (loginHead && !loginHead.querySelector(".easyai-login-brand")) {
			loginHead.insertAdjacentHTML(
				"afterbegin",
				`${brandMarkup("easyai-login-brand")}<p class="easyai-login-subtitle">Simple business management, built for your team.</p>`
			);
		}
	}

	function controlsMarkup() {
		const text = copy();
		const language = currentLanguage();
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
				</div>
			</div>`;
	}

	function mountControls() {
		if (document.querySelector(".easyai-tools")) return;
		document.body.insertAdjacentHTML("beforeend", controlsMarkup());
		applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");

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
			if (colorButton) applyColor(colorButton.dataset.color);
			if (languageButton) changeLanguage(languageButton.dataset.language);
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

	function applyEasyAi() {
		mountBrand();
		mountControls();
		mountWorkspaceHero();
	}

	applyColor(localStorage.getItem(STORAGE_COLOR) || "orange");
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

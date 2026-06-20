(() => {
	"use strict";

	const brandMarkup = (extraClass = "") => `
		<span class="easyai-brand ${extraClass}" aria-label="EasyAi">
			<span>Easy</span><span class="easyai-brand__ai">Ai</span><span class="easyai-brand__dot"></span>
		</span>`;

	function applyEasyAiBrand() {
		document.documentElement.classList.add("easyai-theme");

		if (/ERPNext|Frappe|Contracting/i.test(document.title)) {
			document.title = document.title.replace(/ERPNext|Frappe|Contracting/gi, "EasyAi");
		}

		const navbarBrand = document.querySelector(".navbar .navbar-brand, .navbar .navbar-home");
		if (navbarBrand && !navbarBrand.querySelector(".easyai-brand")) {
			navbarBrand.insertAdjacentHTML("beforeend", brandMarkup());
		}

		const loginHead = document.querySelector(".login-content .page-card-head, .page-card-head");
		if (loginHead && !loginHead.querySelector(".easyai-login-brand")) {
			loginHead.insertAdjacentHTML(
				"afterbegin",
				`${brandMarkup("easyai-login-brand")}<p class="easyai-login-subtitle">Simple construction management, built for your team.</p>`
			);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", applyEasyAiBrand, { once: true });
	} else {
		applyEasyAiBrand();
	}

	window.addEventListener("load", applyEasyAiBrand, { once: true });

	const observer = new MutationObserver(() => {
		window.clearTimeout(window.__easyaiThemeTimer);
		window.__easyaiThemeTimer = window.setTimeout(applyEasyAiBrand, 80);
	});

	observer.observe(document.documentElement, { childList: true, subtree: true });
})();

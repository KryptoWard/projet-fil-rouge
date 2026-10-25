(() => {
    "use strict";
    const key = "cookie-notice-shown";
    let attempts = 0;
    const timer = window.setInterval(() => {
        let shown = false;
        try { shown = localStorage.getItem(key) === "1"; } catch {}
        if (shown || ++attempts > 50) {
            window.clearInterval(timer);
            return;
        }
        const ready = document.querySelector('button.iubenda-tp-btn[data-iub-enabled="1"]');
        const api = window._iub?.cs?.api;
        if (ready && api?.showBanner) {
            window.clearInterval(timer);
            api.showBanner();
            try { localStorage.setItem(key, "1"); } catch {}
        }
    }, 300);
})();

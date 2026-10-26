(() => {
    const widgets = new WeakMap();

    // Create a Turnstile widget for each authentication form
    window.initialiserCaptcha = () => {
        document.querySelectorAll(".captcha").forEach(element => {
            widgets.set(element.closest("form"), window.turnstile.render(element, {
                sitekey: "0x4AAAAAAFkxQXar_mHgb9gS",
                language: document.documentElement.lang,
                size: window.matchMedia("(max-width: 420px)").matches ? "compact" : "flexible",
                theme: "light"
            }));
        });
    };

    // Read or reset the widget used by the submitted form
    window.authCaptcha = {
        token(formulaire) {
            const widget = widgets.get(formulaire);
            if (!widget || !window.turnstile || window.turnstile.isExpired(widget)) return "";
            return window.turnstile.getResponse(widget);
        },
        reset(formulaire) {
            const widget = widgets.get(formulaire);
            if (widget && window.turnstile) window.turnstile.reset(widget);
        }
    };
})();

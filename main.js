"use strict";

(() => {
    const root = document.documentElement;
    root.classList.add("js-ok"); // switches off the CSS failsafe
    const body = document.body;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hasWebGL = (() => {
        try {
            const c = document.createElement("canvas");
            return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
        } catch {
            return false;
        }
    })();

    // Shared state read by scene.js (the WebGL sphere field)
    const gravity = (window.gravity = {
        control: { progress: 0, started: false },
        mouse: { x: 99, y: 99, isDown: false },
        ready: false,
        disabled: reduceMotion || !hasWebGL,
        onReady() {
            gravity.ready = true;
        },
    });

    if (gravity.disabled) {
        document.querySelector("[data-scene]")?.remove();
    }

    /* ---------- Reveal page (after loader) ---------- */
    let revealed = false;
    function revealPage() {
        if (revealed) return;
        revealed = true;
        root.classList.add("is-ready");
        gravity.control.started = true;
    }
    // Safety net: never leave the page hidden
    setTimeout(revealPage, 6000);

    /* ---------- Loader ---------- */
    const loader = document.querySelector("[data-loader]");
    if (!loader || gravity.disabled) {
        loader?.remove();
        revealPage();
    } else {
        const fill = loader.querySelector("[data-loader-fill]");
        const count = loader.querySelector("[data-loader-count]");
        const status = loader.querySelector("[data-loader-status]");
        const start = performance.now();
        let last = start;
        let value = 0;

        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            // If the scene never reports ready (offline CDN etc.), finish anyway
            const ready = gravity.ready || now - start > 4000;

            if (!ready) {
                value += (92 - value) * 1.7 * dt;
            } else {
                value += (100 - value) * 6 * dt;
                if (value >= 99.4) value = 100;
            }

            fill.style.width = `${value}%`;
            count.textContent = `${String(Math.round(value)).padStart(3, "0")}%`;
            status.textContent = value >= 100 ? "Ready" : "Loading interface";

            if (value >= 99.9 && ready) {
                setTimeout(() => loader.classList.add("is-leaving"), 140);
                setTimeout(() => {
                    revealPage();
                    loader.remove();
                }, 660);
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ---------- Smooth wheel scroll (Lenis-style) ---------- */
    const smooth = { target: window.scrollY, current: window.scrollY, running: false };
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    function smoothLoop() {
        smooth.current += (smooth.target - smooth.current) * 0.09;
        if (Math.abs(smooth.target - smooth.current) < 0.5) {
            smooth.current = smooth.target;
            smooth.running = false;
        }
        window.scrollTo(0, smooth.current);
        if (smooth.running) requestAnimationFrame(smoothLoop);
    }

    function scrollToY(y) {
        if (reduceMotion) {
            window.scrollTo(0, y);
            return;
        }
        smooth.target = clamp(y, 0, maxScroll());
        if (!smooth.running) {
            smooth.current = window.scrollY;
            smooth.running = true;
            requestAnimationFrame(smoothLoop);
        }
    }

    if (!reduceMotion) {
        window.addEventListener(
            "wheel",
            (event) => {
                if (event.ctrlKey || event.defaultPrevented) return;
                event.preventDefault();
                // The page behind the open mobile menu stays put
                if (sheet?.classList.contains("is-open")) return;
                const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
                if (!smooth.running) smooth.target = window.scrollY;
                scrollToY(smooth.target + delta);
            },
            { passive: false }
        );
    }

    // Keep the target in sync with keyboard, scrollbar and touch scrolling
    window.addEventListener(
        "scroll",
        () => {
            if (!smooth.running) smooth.target = smooth.current = window.scrollY;
        },
        { passive: true }
    );

    // In-page anchors use the same glide
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute("href");
        const target = id === "#top" ? document.body : document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        setSheetOpen(false);
        const y = id === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - (id === "#contact" ? 0 : 20);
        scrollToY(y);
        history.replaceState(null, "", id);
        // Move keyboard focus with the scroll (skip link, nav) so Tab continues from the new section
        const focusTarget = id === "#top" ? document.querySelector("#top") : target;
        if (focusTarget) {
            if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
            focusTarget.focus({ preventScroll: true });
        }
    });

    /* ---------- Scroll progress -> scene, background stage, header ---------- */
    const header = document.querySelector("[data-header]");
    const anchors = ["#top", "#about", "#approach", "#experience"].map((s) => document.querySelector(s));
    let stage = -1;
    let scrollQueued = false;

    function computeProgress() {
        const y = window.scrollY;
        const vh = window.innerHeight || 1;
        const tops = anchors.map((el) => (el ? el.getBoundingClientRect().top + y : 0));
        for (let i = 0; i < tops.length - 1; i++) {
            if (y < tops[i + 1]) {
                const span = Math.max(1, tops[i + 1] - tops[i]);
                return i + (y - tops[i]) / span;
            }
        }
        return tops.length - 1 + (y - tops[tops.length - 1]) / vh;
    }

    function onScroll() {
        scrollQueued = false;
        const progress = computeProgress();
        gravity.control.progress = progress;

        const next = progress > 3.1 ? 3 : progress > 1.55 ? 2 : progress > 0.7 ? 1 : 0;
        if (next !== stage) {
            stage = next;
            body.dataset.stage = String(stage);
        }
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    const queueScroll = () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(onScroll);
    };
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll);
    onScroll();

    /* ---------- Pointer -> scene ---------- */
    const setPointer = (e) => {
        gravity.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        gravity.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const clearPointer = () => {
        gravity.mouse.x = 99;
        gravity.mouse.y = 99;
        gravity.mouse.isDown = false;
    };
    let touchClear = 0;

    window.addEventListener("pointermove", setPointer);
    document.addEventListener("pointerleave", clearPointer);
    window.addEventListener("pointerdown", (e) => {
        clearTimeout(touchClear);
        setPointer(e); // a tap has no hover, so it needs its own position
        gravity.mouse.isDown = true;
    });
    // A finger lifts off (or the browser takes over to scroll): let go shortly after,
    // otherwise the last touch point would keep pushing the spheres forever
    const releasePointer = (e) => {
        gravity.mouse.isDown = false;
        if (e.pointerType !== "mouse") touchClear = setTimeout(clearPointer, 280);
    };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);

    /* ---------- Mobile menu ---------- */
    const toggle = document.querySelector("[data-nav-toggle]");
    const sheet = document.querySelector("[data-nav-sheet]");

    function setSheetOpen(open) {
        if (!toggle || !sheet) return;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
        sheet.classList.toggle("is-open", open);
    }

    toggle?.addEventListener("click", () => setSheetOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setSheetOpen(false);
    });

    /* ---------- Active nav link ---------- */
    const navLinks = [...document.querySelectorAll("[data-nav-link]")];
    const navTargets = navLinks.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
            });
        },
        { rootMargin: "-45% 0px -50% 0px" }
    );
    navTargets.forEach((t) => navObserver.observe(t));

    /* ---------- Scroll reveals ---------- */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    /* ---------- Copy email ---------- */
    document.querySelectorAll("[data-copy]").forEach((button) => {
        const label = button.querySelector("[data-copy-label]");
        const original = label.textContent;
        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                label.textContent = "Copied!";
            } catch {
                window.location.href = `mailto:${button.dataset.copy}`;
                return;
            }
            setTimeout(() => (label.textContent = original), 1800);
        });
    });

    /* ---------- Footer year ---------- */
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = year));
})();

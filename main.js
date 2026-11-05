"use strict";

// Header background once the page is scrolled
const header = document.querySelector("[data-header]");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile navigation
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

function setNavOpen(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navMenu.classList.toggle("is-open", open);
}

navToggle.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNavOpen(false);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
});

// Highlight the nav link for the section in view
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    },
    { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((section) => sectionObserver.observe(section));

// Reveal elements as they scroll into view, staggering siblings
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach((el) => {
    const siblings = [...el.parentElement.children].filter((child) => child.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--delay", `${Math.min(index * 0.07, 0.35)}s`);
    revealObserver.observe(el);
});

// Cursor-following glow on stack cards
document.querySelectorAll(".stack-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
});

// Copy email to clipboard
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

// Footer year
const year = String(new Date().getFullYear());
document.querySelectorAll("[data-year], [data-year-copy]").forEach((el) => {
    el.textContent = year;
});

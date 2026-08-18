/* ==========================================================================
   Unstable Photography - interactions
   Sidebar, section routing, collection drill-down and the lightbox.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const body = document.body;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const menuButton = document.getElementById("menu-button");
    const sidebar = document.querySelector(".sidebar");
    const scrim = document.getElementById("sidebar-scrim");
    const sidebarLinks = document.querySelectorAll(".sidebar a[data-page]");   // includes the brand
    const navLinks = document.querySelectorAll(".nav a[data-page]");

    const galleryContainer = document.getElementById("gallery-container");
    const gallery = document.getElementById("gallery");
    const sortButtons = document.querySelector(".sort-buttons");
    const cameraSection = document.getElementById("camera-section");
    const aboutSection = document.getElementById("about-section");
    const contactSection = document.getElementById("contact-section");

    const sections = {
        home: galleryContainer,
        camera: cameraSection,
        about: aboutSection,
        contact: contactSection
    };

    /* ----------------------------------------------------------------------
       Sidebar
       ---------------------------------------------------------------------- */

    function openSidebar() {
        sidebar.classList.add("sidebar-open");
        body.classList.add("sidebar-is-open");
        menuButton.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
        sidebar.classList.remove("sidebar-open");
        body.classList.remove("sidebar-is-open");
        menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", function (event) {
        event.stopPropagation();
        sidebar.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
    });

    if (scrim) scrim.addEventListener("click", closeSidebar);

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            closeSidebar();
        }
    });

    /* ----------------------------------------------------------------------
       Section routing
       ---------------------------------------------------------------------- */

    function markActiveNav(page) {
        navLinks.forEach(link => {
            link.classList.toggle("is-active", link.getAttribute("data-page") === page);
        });
    }

    window.loadContent = function (page) {
        if (!sections[page]) page = "home";

        Object.values(sections).forEach(section => {
            if (section) section.style.display = "none";
        });

        const target = sections[page];
        target.style.display = "block";

        // Retrigger the entrance animation on every switch.
        target.classList.remove("section-enter");
        void target.offsetWidth;
        target.classList.add("section-enter");

        sortButtons.style.display = page === "home" ? "" : "none";
        markActiveNav(page);
        requestAnimationFrame(() => revealAll(target));

        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    };

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            loadContent(this.getAttribute("data-page"));
            if (window.innerWidth <= 1023) closeSidebar();
        });
    });

    /* ----------------------------------------------------------------------
       Collections: cover grid <-> opened collection
       ---------------------------------------------------------------------- */

    const groups = new Map();

    document.querySelectorAll(".gallery-group").forEach(group => {
        const name = group.getAttribute("data-group");
        const items = group.querySelector(".gallery-items");
        if (items) items.removeAttribute("style"); // CSS owns visibility from here
        groups.set(name, group);

        const folder = group.querySelector(".folder");
        if (folder) {
            folder.addEventListener("click", () => navigateToGroup(name));
            folder.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToGroup(name);
                }
            });
        }
    });

    // Stagger the cover cards in on first paint.
    document.querySelectorAll(".gallery-group .folder").forEach((folder, i) => {
        folder.style.animationDelay = Math.min(i * 55, 550) + "ms";
    });

    function currentQuery() {
        return new URLSearchParams(window.location.search);
    }

    function navigateToGroup(name) {
        const params = currentQuery();
        params.set("group", name);
        history.pushState({ group: name }, "", "?" + params.toString());
        showGroup(name);
    }

    function navigateToRoot() {
        const params = currentQuery();
        params.delete("group");
        const q = params.toString();
        history.pushState({ group: null }, "", q ? "?" + q : window.location.pathname);
        showAllGroups();
    }

    function showGroup(name) {
        const group = groups.get(name);
        if (!group) return showAllGroups();

        groups.forEach(g => g.classList.remove("is-open"));
        group.classList.add("is-open");
        gallery.setAttribute("data-open", name);
        galleryContainer.classList.add("is-drilled");

        loadContentSilently("home");
        revealAll(group);
        window.scrollTo({ top: 0, behavior: "auto" });
        layoutMasonry(group.querySelector(".photo-grid"));
    }

    function showAllGroups() {
        groups.forEach(g => g.classList.remove("is-open"));
        gallery.removeAttribute("data-open");
        galleryContainer.classList.remove("is-drilled");
    }

    // Switch to the home section without the scroll/animation side effects.
    function loadContentSilently(page) {
        Object.values(sections).forEach(s => { if (s) s.style.display = "none"; });
        sections[page].style.display = "block";
        sortButtons.style.display = page === "home" ? "" : "none";
        markActiveNav(page);
    }

    document.querySelectorAll("[data-back]").forEach(btn => {
        btn.addEventListener("click", navigateToRoot);
    });

    window.addEventListener("popstate", function (event) {
        const name = (event.state && event.state.group) || currentQuery().get("group");
        name ? showGroup(name) : showAllGroups();
    });

    markActiveNav("home");

    /* ----------------------------------------------------------------------
       Masonry: rows of 1px + a computed span, so tall and wide shots sit
       flush together while still reading left-to-right in upload order.
       ---------------------------------------------------------------------- */

    const ROW_GAP = 20;

    document.querySelectorAll(".photo-grid").forEach(grid => grid.classList.add("is-masonry"));

    function layoutMasonry(grid) {
        if (!grid || !grid.classList.contains("is-masonry")) return;
        if (!grid.offsetParent && grid.offsetHeight === 0) return; // hidden collection

        grid.querySelectorAll(".gallery-item").forEach(item => {
            const img = item.querySelector("img");
            const height = img && img.naturalWidth
                ? img.getBoundingClientRect().height + 2 // + card border
                : item.getBoundingClientRect().height;
            if (height > 0) {
                item.style.gridRowEnd = "span " + Math.ceil(height + ROW_GAP);
            }
        });
    }

    function layoutAllMasonry() {
        document.querySelectorAll(".photo-grid").forEach(layoutMasonry);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(layoutAllMasonry, 120);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(layoutAllMasonry);
    }
    window.addEventListener("load", layoutAllMasonry);

    /* ----------------------------------------------------------------------
       Image loading: blurred placeholder fades into the real photo
       ---------------------------------------------------------------------- */

    function watchImage(img) {
        const done = () => {
            img.classList.add("is-loaded");
            layoutMasonry(img.closest(".photo-grid"));
        };
        if (img.complete && img.naturalWidth) {
            done();
        } else {
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
        }
    }

    document.querySelectorAll(".folder-thumbnail, .gallery-item img").forEach(watchImage);

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */

    const revealObserver = "IntersectionObserver" in window
        ? new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 })
        : null;

    function revealAll(scope) {
        const root = scope || document;
        const nodes = root.querySelectorAll(".reveal:not(.is-in)");

        nodes.forEach((node, i) => {
            node.style.setProperty("--i", i % 8);
            if (!revealObserver) {
                node.classList.add("is-in");
                return;
            }
            // Re-observing an already-observed element is a no-op, so a node
            // first seen inside a display:none section would never get its
            // callback once that section is shown. Unobserve first to force a
            // fresh initial notification.
            revealObserver.unobserve(node);
            revealObserver.observe(node);
        });

        // Safety net: hidden content is a far worse failure than a missed
        // animation, so anything still unrevealed shortly after gets shown.
        window.setTimeout(() => {
            root.querySelectorAll(".reveal:not(.is-in)").forEach(node => {
                if (node.getBoundingClientRect().top < window.innerHeight + 200) {
                    node.classList.add("is-in");
                }
            });
        }, 700);
    }

    revealAll(document);

    /* ----------------------------------------------------------------------
       Lightbox
       ---------------------------------------------------------------------- */

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalCounter = document.getElementById("modalCounter");
    const filmstrip = document.getElementById("modalFilmstrip");
    const closeBtn = document.querySelector(".close");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let images = [];
    let currentIndex = 0;
    let lastFocused = null;

    document.querySelectorAll(".gallery-group").forEach(group => {
        const items = Array.from(group.querySelectorAll(".gallery-item"));

        items.forEach((item, index) => {
            const open = () => {
                images = items.map(el => el.querySelector("img"));
                currentIndex = index;
                openModal();
            };
            item.addEventListener("click", open);
            item.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            });
        });
    });

    function buildFilmstrip() {
        filmstrip.innerHTML = "";
        if (images.length < 2) return;

        images.forEach((img, i) => {
            const thumb = document.createElement("img");
            thumb.src = img.dataset.thumb || img.src;
            thumb.alt = img.dataset.title || "";
            thumb.loading = "lazy";
            thumb.addEventListener("click", e => {
                e.stopPropagation();
                currentIndex = i;
                render();
            });
            filmstrip.appendChild(thumb);
        });
    }

    function preload(index) {
        const img = images[(index + images.length) % images.length];
        if (!img) return;
        const pre = new Image();
        pre.src = img.dataset.full || img.src;
    }

    let renderToken = 0;

    function render() {
        const source = images[currentIndex];
        if (!source) return;

        const token = ++renderToken;
        const full = source.dataset.full || source.src;
        const preview = source.currentSrc || source.src;

        modalImg.alt = source.dataset.title || "";

        // Show the grid-sized image straight away (it is already cached), then
        // swap in the full-resolution file once it has downloaded.
        if (preview && preview !== full) {
            modalImg.src = preview;
            modalImg.classList.add("is-loaded", "is-preview");
            modal.classList.add("is-loading");
        } else {
            modalImg.classList.remove("is-loaded", "is-preview");
            modal.classList.add("is-loading");
        }

        const loader = new Image();
        loader.onload = function () {
            if (token !== renderToken) return;   // a newer photo won the race
            modalImg.src = full;
            modalImg.classList.add("is-loaded");
            modalImg.classList.remove("is-preview");
            modal.classList.remove("is-loading");
        };
        loader.onerror = function () {
            if (token !== renderToken) return;
            modalImg.classList.add("is-loaded");
            modalImg.classList.remove("is-preview");
            modal.classList.remove("is-loading");
        };
        loader.src = full;

        modalTitle.textContent = source.dataset.title || "";
        modalDesc.textContent = source.dataset.caption || "";
        modalCounter.textContent = images.length > 1
            ? (currentIndex + 1) + " / " + images.length
            : "";

        Array.from(filmstrip.children).forEach((thumb, i) => {
            const active = i === currentIndex;
            thumb.classList.toggle("is-current", active);
            if (active) {
                thumb.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
            }
        });

        const multiple = images.length > 1;
        prevBtn.style.display = multiple ? "" : "none";
        nextBtn.style.display = multiple ? "" : "none";

        preload(currentIndex + 1);
        preload(currentIndex - 1);
    }

    function openModal() {
        lastFocused = document.activeElement;
        buildFilmstrip();
        render();

        modal.classList.add("is-open");
        requestAnimationFrame(() => modal.classList.add("is-visible"));

        body.style.overflow = "hidden";
        closeBtn.focus({ preventScroll: true });
    }

    function closeModal() {
        modal.classList.remove("is-visible");
        body.style.overflow = "";

        window.setTimeout(() => {
            modal.classList.remove("is-open");
            modalImg.removeAttribute("src");
            modalImg.classList.remove("is-loaded", "is-preview");
        }, reduceMotion ? 0 : 300);

        if (lastFocused) lastFocused.focus({ preventScroll: true });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        render();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render();
    }

    closeBtn.addEventListener("click", closeModal);
    closeBtn.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeModal(); }
    });
    nextBtn.addEventListener("click", e => { e.stopPropagation(); nextImage(); });
    prevBtn.addEventListener("click", e => { e.stopPropagation(); prevImage(); });

    window.addEventListener("keydown", function (e) {
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") closeModal();
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal || e.target.classList.contains("modal-bg") || e.target.classList.contains("modal-stage")) {
            closeModal();
        }
    });

    // Swipe between photos on touch devices.
    let touchX = 0;
    let touchY = 0;

    modal.addEventListener("touchstart", e => {
        touchX = e.changedTouches[0].clientX;
        touchY = e.changedTouches[0].clientY;
    }, { passive: true });

    modal.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
            dx < 0 ? nextImage() : prevImage();
        } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
            closeModal();
        }
    }, { passive: true });

    /* ----------------------------------------------------------------------
       Deep link: ?group=Kathmandu opens that collection straight away
       ---------------------------------------------------------------------- */

    const initialGroup = currentQuery().get("group");
    if (initialGroup) {
        showGroup(initialGroup);
    } else {
        layoutAllMasonry();
    }
});

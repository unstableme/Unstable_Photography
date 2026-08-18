/* ==========================================================================
   Intro reveal: the page opens through the "o" of Photography.

   Loaded without defer so the "already seen this tab" decision happens before
   first paint and repeat views never flash the overlay.
   ========================================================================== */

(function () {
    "use strict";

    const KEY = "up-intro-seen";

    let skip = false;
    try { skip = sessionStorage.getItem(KEY) === "1"; } catch (e) { skip = false; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) skip = true;

    document.addEventListener("DOMContentLoaded", function () {
        const intro = document.getElementById("intro");
        const letter = document.getElementById("intro-o");
        if (!intro) return;

        function finish() {
            intro.classList.add("is-done");
            document.body.style.overflow = "";
            try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
        }

        if (skip) { finish(); return; }

        document.body.style.overflow = "hidden";

        const supportsMask = window.CSS &&
            (CSS.supports("mask-image", "radial-gradient(#000, #fff)") ||
             CSS.supports("-webkit-mask-image", "radial-gradient(#000, #fff)"));

        // Measured against real layout: for this face at line-height 1.02 the
        // centre of a lowercase o sits at 57% of the line box, and its counter
        // is about 15.5% of the font size across.
        function position() {
            if (!letter || !supportsMask) return;
            const r = letter.getBoundingClientRect();
            const size = parseFloat(getComputedStyle(letter).fontSize) || r.height;

            // The <i> box IS the o's advance width, so its horizontal middle is
            // the glyph's middle. Vertically the ink centre lands at 57% of the
            // line box: baseline is at top + ascent(81/106), and the x-height
            // centre is half the o's ink height (42/2) above that.
            intro.style.setProperty("--ox", (r.left + r.width / 2).toFixed(2) + "px");
            intro.style.setProperty("--oy", (r.top + r.height * 0.865).toFixed(2) + "px");
            intro.style.setProperty("--hole", (size * 0.10).toFixed(2) + "px");
            intro.classList.add("is-masked");
        }

        // Measure only once the webfont is in place, or the box is the wrong size.
        let started = false;
        function begin() {
            if (started) return;
            started = true;
            position();
            window.setTimeout(function () { intro.classList.add("is-running"); }, 850);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(begin);
            window.setTimeout(begin, 1200);          // guard if it never settles
        } else {
            begin();
        }

        intro.addEventListener("animationend", function (e) {
            if (e.animationName === "introZoom") finish();
        });

        window.setTimeout(finish, 5000);             // never leave the page covered
    });
})();

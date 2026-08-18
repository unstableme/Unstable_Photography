/* ==========================================================================
   Intro reveal.

   Measures the "o" in Photography, punches a hole through the overlay at its
   counter, then scales the overlay from that exact point so the page opens up
   through the letter.

   Loaded WITHOUT defer so the skip decision happens before first paint - a
   repeat visitor in the same tab never sees a flash of the overlay.
   ========================================================================== */

(function () {
    "use strict";

    const KEY = "up-intro-seen";

    let skip = false;
    try {
        skip = sessionStorage.getItem(KEY) === "1";
    } catch (e) {
        skip = false;   // private mode etc. - just play it
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) skip = true;

    // Runs before <body> exists, so wait for the element.
    document.addEventListener("DOMContentLoaded", function () {
        const intro = document.getElementById("intro");
        const letter = document.getElementById("intro-o");
        if (!intro) return;

        function finish() {
            intro.classList.add("is-done");
            document.body.style.overflow = "";
            try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
        }

        if (skip) {
            finish();
            return;
        }

        document.body.style.overflow = "hidden";

        // Measure only once the webfont is in place - metrics taken against a
        // fallback font put the hole in the wrong spot.
        let started = false;
        function begin() {
            if (started) return;
            started = true;
            position();
            window.setTimeout(function () { intro.classList.add("is-running"); }, 850);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(begin);
            window.setTimeout(begin, 1200);   // guard if it never settles
        } else {
            begin();
        }

        const supportsMask =
            window.CSS && (CSS.supports("mask-image", "radial-gradient(#000, #fff)") ||
                           CSS.supports("-webkit-mask-image", "radial-gradient(#000, #fff)"));

        function position() {
            if (!letter || !supportsMask) return;
            const r = letter.getBoundingClientRect();
            const cs = getComputedStyle(letter);
            const size = parseFloat(cs.fontSize) || r.height;

            // The element's box is the LINE box, not the glyph, so measuring it
            // directly puts the hole well above the letter. Derive the glyph's
            // real ink box from font metrics instead.
            let cy = r.top + r.height * 0.72;      // fallback
            let ink = size * 0.48;                 // fallback x-height

            try {
                const ctx = document.createElement("canvas").getContext("2d");
                ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
                const m = ctx.measureText("o");

                if (m.fontBoundingBoxAscent && m.actualBoundingBoxAscent) {
                    const fAsc = m.fontBoundingBoxAscent;
                    const fDesc = m.fontBoundingBoxDescent;
                    // Where the baseline sits inside the line box.
                    const baseline = r.top + (r.height - (fAsc + fDesc)) / 2 + fAsc;
                    const inkTop = baseline - m.actualBoundingBoxAscent;
                    const inkBottom = baseline + m.actualBoundingBoxDescent;
                    cy = (inkTop + inkBottom) / 2;
                    ink = inkBottom - inkTop;
                }
            } catch (e) { /* keep the fallbacks */ }

            intro.style.setProperty("--ox", (r.left + r.width / 2).toFixed(2) + "px");
            intro.style.setProperty("--oy", cy.toFixed(2) + "px");
            // The counter of a serif lowercase o is roughly a third of its height.
            intro.style.setProperty("--hole", (ink * 0.30).toFixed(2) + "px");
            intro.classList.add("is-masked");
        }

        intro.addEventListener("animationend", function (e) {
            if (e.animationName === "introZoom") finish();
        });

        // Never let a dropped animation event leave the page covered.
        window.setTimeout(finish, 4200);
    });
})();

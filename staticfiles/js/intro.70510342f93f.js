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

        const supportsMask =
            window.CSS && (CSS.supports("mask-image", "radial-gradient(#000, #fff)") ||
                           CSS.supports("-webkit-mask-image", "radial-gradient(#000, #fff)"));

        if (letter && supportsMask) {
            const r = letter.getBoundingClientRect();
            const size = parseFloat(getComputedStyle(letter).fontSize) || r.height;

            intro.style.setProperty("--ox", (r.left + r.width / 2) + "px");
            // The counter sits a little above the glyph's vertical middle.
            intro.style.setProperty("--oy", (r.top + r.height * 0.60) + "px");
            // Roughly the radius of the hole inside a serif lowercase o.
            intro.style.setProperty("--hole", (size * 0.125).toFixed(2) + "px");
            intro.classList.add("is-masked");
        }

        // Hold on the words, then fly into the letter.
        window.setTimeout(function () {
            intro.classList.add("is-running");
        }, 850);

        intro.addEventListener("animationend", function (e) {
            if (e.animationName === "introZoom") finish();
        });

        // Never let a dropped animation event leave the page covered.
        window.setTimeout(finish, 4200);
    });
})();

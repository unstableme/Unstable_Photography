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

        /* Find the actual hole inside the "o".

           No estimating: draw the glyph to a canvas with the same font, scan
           the pixels for the enclosed transparent region (the counter), then
           map it back to page coordinates. Font and size agnostic. */
        function measureCounter(font, size) {
            const pad = Math.ceil(size * 0.6);
            const W = Math.ceil(size * 2.2);
            const H = Math.ceil(size * 2.2);
            const c = document.createElement("canvas");
            c.width = W;
            c.height = H;

            const g = c.getContext("2d", { willReadFrequently: true });
            g.font = font;
            g.textBaseline = "alphabetic";
            g.fillStyle = "#fff";
            const baseY = Math.round(H * 0.72);
            g.fillText("o", pad, baseY);

            const px = g.getImageData(0, 0, W, H).data;
            const A = function (x, y) { return px[(y * W + x) * 4 + 3]; };
            const INK = 40;

            let minX = W, maxX = -1, minY = H, maxY = -1;
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    if (A(x, y) > INK) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX < 0) return null;

            // Across the middle of the ink: left stroke, hole, right stroke.
            const midY = Math.round((minY + maxY) / 2);
            let x = minX;
            while (x <= maxX && A(x, midY) <= INK) x++;
            while (x <= maxX && A(x, midY) > INK) x++;
            const hl = x;
            while (x <= maxX && A(x, midY) <= INK) x++;
            const hr = x - 1;
            if (hr <= hl) return null;

            // Down the middle of that hole.
            const cxc = Math.round((hl + hr) / 2);
            let y = minY;
            while (y <= maxY && A(cxc, y) <= INK) y++;
            while (y <= maxY && A(cxc, y) > INK) y++;
            const ht = y;
            while (y <= maxY && A(cxc, y) <= INK) y++;
            const hb = y - 1;
            if (hb <= ht) return null;

            return {
                dx: (hl + hr) / 2 - pad,       // from the glyph origin
                dy: (ht + hb) / 2 - baseY,     // from the baseline
                r: Math.min(hr - hl, hb - ht) / 2
            };
        }

        function position() {
            if (!letter || !supportsMask) return;

            const r = letter.getBoundingClientRect();
            const cs = getComputedStyle(letter);
            const size = parseFloat(cs.fontSize) || r.height;
            const font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;

            // Exact baseline: a zero-height inline-block aligns its bottom edge
            // to the baseline, so its top IS the baseline.
            const probe = document.createElement("span");
            probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
            letter.parentNode.insertBefore(probe, letter);
            const baselineY = probe.getBoundingClientRect().top;
            probe.remove();

            const m = measureCounter(font, size);
            let cx, cy, hole;

            if (m) {
                cx = r.left + m.dx;
                cy = baselineY + m.dy;
                hole = m.r * 0.9;              // stay just inside the stroke
            } else {
                cx = r.left + r.width / 2;     // only if the pixel read fails
                cy = baselineY - size * 0.26;
                hole = size * 0.10;
            }

            intro.style.setProperty("--ox", cx.toFixed(2) + "px");
            intro.style.setProperty("--oy", cy.toFixed(2) + "px");
            intro.style.setProperty("--hole", hole.toFixed(2) + "px");
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

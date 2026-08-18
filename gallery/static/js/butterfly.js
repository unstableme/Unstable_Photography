/* ==========================================================================
   Butterfly cursor.

   The native cursor is only hidden once this script has actually built its
   replacement, so a failed or blocked script leaves the normal pointer alone.
   Skipped entirely on touch devices and when reduced motion is requested.
   ========================================================================== */

(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduceMotion || coarse) return;

    const el = document.createElement("div");
    el.className = "butterfly";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
        '<svg viewBox="0 0 40 34">' +
          '<g class="bf-wing bf-left">' +
            '<path d="M20 18C16.5 7.5 11 3 6.5 4.2 2 5.4 1.6 12 4.6 16.4 7 20 13 21.6 20 18z" fill="url(#bfg)"/>' +
            '<path d="M20 18c-3.6 6.4-8 9.8-12 8.8-3.4-.9-4-5-1.6-7.8C8.9 16 14.6 15.5 20 18z" fill="url(#bfg2)"/>' +
          '</g>' +
          '<g class="bf-wing bf-right">' +
            '<path d="M20 18C23.5 7.5 29 3 33.5 4.2 38 5.4 38.4 12 35.4 16.4 33 20 27 21.6 20 18z" fill="url(#bfg)"/>' +
            '<path d="M20 18c3.6 6.4 8 9.8 12 8.8 3.4-.9 4-5 1.6-7.8C31.1 16 25.4 15.5 20 18z" fill="url(#bfg2)"/>' +
          '</g>' +
          '<ellipse cx="20" cy="18.5" rx="1.5" ry="6.2" fill="#2b2118"/>' +
          '<path d="M20 12.6c-.8-2.4-2.3-4-3.8-4.6M20 12.6c.8-2.4 2.3-4 3.8-4.6" stroke="#2b2118" stroke-width="0.9" fill="none" stroke-linecap="round"/>' +
          '<defs>' +
            '<linearGradient id="bfg" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="#ffb066"/><stop offset="100%" stop-color="#ff6a3d"/>' +
            '</linearGradient>' +
            '<linearGradient id="bfg2" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="#ff8a4d"/><stop offset="100%" stop-color="#c8442b"/>' +
            '</linearGradient>' +
          '</defs>' +
        '</svg>';

    document.body.appendChild(el);
    document.documentElement.classList.add("has-butterfly");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let angle = 0;

    window.addEventListener("pointermove", function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        el.classList.remove("is-away");
    }, { passive: true });

    // Fade out only while the pointer is genuinely off the page.
    document.addEventListener("pointerleave", () => el.classList.add("is-away"));
    document.addEventListener("pointerenter", () => el.classList.remove("is-away"));

    // Faster wing beat while travelling, a lazy flap at rest.
    let flap = 0;

    function frame() {
        const dx = targetX - x;
        const dy = targetY - y;

        // Tight enough to feel attached to the pointer, loose enough to flutter.
        x += dx * 0.24;
        y += dy * 0.24;

        const speed = Math.min(Math.hypot(dx, dy), 90);

        // Bank into the direction of travel.
        const want = Math.max(-26, Math.min(26, dx * 0.5));
        angle += (want - angle) * 0.12;

        // Gentle bob so it never looks pinned to the pointer.
        const bob = Math.sin(flap * 0.09) * (1.6 + speed * 0.03);
        flap += 1 + speed * 0.06;

        el.style.transform =
            "translate3d(" + (x - 19) + "px," + (y - 17 + bob) + "px,0) rotate(" + angle.toFixed(2) + "deg)";
        el.style.setProperty("--beat", (0.42 - Math.min(speed, 90) * 0.0026).toFixed(3) + "s");

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();

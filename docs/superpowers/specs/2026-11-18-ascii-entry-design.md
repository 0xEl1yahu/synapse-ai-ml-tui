# WTFis.AI entry screen

## Approved revision

The wordmark stays still. A shallow pool of pale-green ASCII water sits between the title and the entry button. Tapping sends a ring across the surface, dragging leaves a wake, and holding then releasing sends a stronger ring. Reduced-motion mode shows a still water surface. The renderer adapts the wave field from [ASCII Liquid Login on 21st.dev](https://21st.dev/@prayaniwork/components/ascii-liquid-login). The session and keyboard behavior below still apply.

## Original wordmark design

The entrance introduces the curriculum with two elements: the name and a button. A first-time visitor should recognize the name and see how to enter before moving the pointer.

## Approaches

The selected direction makes the wordmark interactive. It gives the visitor one place to look and makes the lettering itself memorable. A draggable ASCII cube would introduce the 3D labs but split attention between the emblem and the title. A cursor-fill treatment would keep the title steady but make the effect harder to discover on touchscreens. The motion reference for the selected direction is [Pixel Text Headline Animation on 21st.dev](https://21st.dev/@kedhareswer/components/pixel-headline).

## Appearance and interaction

- Center `WTFis.AI` on a near-black background. Draw the uppercase letters five character rows tall in pale phosphor, with the lowercase `is` sharing their baseline. Keep the dot distinct at phone widths.
- Use the block characters `█`, `▓`, and `░` to give the letters weight. At rest the wordmark is still. A nearby pointer or fingertip sends a short ripple through a few blocks. They settle back into their original cells.
- Place one green **[ Enter curriculum ↵ ]** button directly beneath the wordmark. It works immediately by click, tap, or keyboard. Touching the artwork plays the ripple. Activating the button opens the existing curriculum overview with **Start with Python**.

## Proposed defaults for approval

Show the entrance once per browser tab. Reloading after entry returns to the curriculum. If session storage is unavailable, keep entry working for the current visit.

Expose the name as a single heading to screen readers and hide the decorative glyph grid. Use a native button with a visible focus indicator and move focus to the overview heading after entry. With reduced motion enabled, show the finished lettering and use the same button.

Keep the entrance lightweight with a small glyph grid. Load the curriculum’s interactive 3D scene after entry. Check that the complete name and button fit at 320px wide, the word remains legible during a ripple, and the entire path works with keyboard alone.

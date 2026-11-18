# ASCII entry screen implementation plan

Implement the [approved design](../specs/2026-11-18-ascii-entry-design.md) with React, CSS and browser pointer events.

## Wordmark and entry button

- Build `src/components/entry/EntryScreen.tsx` with five-row block letters, smaller lowercase letters on the same baseline, and a native entry button. Style the screen in `src/components/entry/entry.css`.
- Give the artwork one accessible heading. Animate nearby cells on mouse movement or touch, leave them still at rest, and respect the system reduced-motion setting.
- Check the composition at 320px and desktop widths. Test that interaction settles, touch on the artwork stays on the entrance, and Tab reaches the button.

## Curriculum handoff

- Switch `src/main.tsx` from a static curriculum import to loading it after entry. Persist a successful entry in session storage, handle a failed load, and keep the current visit usable when browser storage is blocked.
- Focus the overview heading in `src/App.tsx` after explicit entry. Keep the learner’s saved theme and progress available.
- Test keyboard entry, a same-tab refresh, an independent new tab and restricted storage. Verify that the curriculum bundle and WebGL canvas load after entry. Run the production build and check the live site.

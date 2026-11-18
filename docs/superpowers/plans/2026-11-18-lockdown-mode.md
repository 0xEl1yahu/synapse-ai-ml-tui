# Lockdown Mode compatibility implementation plan

**Goal** — A reader can enter the curriculum, open lessons and navigate the labs with Apple Lockdown Mode enabled. When a 3D scene cannot run, its title and equation remain readable.

**Basis** — The approved design follows a production-build reproduction in Chrome with WebGL disabled. Entry succeeded, the overview mounted its renderer, and “Error creating WebGL context.” left the page empty. Actual Safari verification is a separate acceptance step.

**Architecture** — Keep the existing WebGLViewportShell props and all three callers in src/App.tsx. Put capability handling and recovery inside the shared viewport. Use existing React, TypeScript, React Three Fiber and Playwright dependencies.

### 1. Support browsers without WebGL 2

- [ ] In tests/curriculum.spec.ts, add a Playwright case using page.addInitScript before navigation. Return null for webgl2 context requests and delegate all other requests to the original method. Enter through the landing page, open “Start with Python”, and reload. Assert the lesson opens and the returning-session overview remains usable. Run the case against the current build and capture the failure.
- [ ] In src/components/webgl/WebGLViewportShell.tsx, check WebGL 2 availability before mounting the interactive scene. Handle both a null context and an exception. Keep the check out of the render loop, release any temporary probe context and avoid repeating it when scene tabs change.
- [ ] Keep the standalone scene selector available. Render the selected scene’s existing label and equation as HTML with the message “Interactive 3D is unavailable in this browser.” Omit the canvas, ASCII overlay, renderer controls, camera hints and live telemetry in this state.
- [ ] Extend the blocked-context test through an embedded lesson sandbox and the standalone lab. Switch scenes, verify the displayed equation changes, and navigate back. Check that renderer controls are absent and no uncaught page error occurred. Repeat the capability case with getContext throwing.

### 2. Contain failures after a successful capability check

- [ ] Add a separate browser case that allows the detached probe to succeed but denies WebGL 2 to the mounted renderer canvas. Confirm the renderer path was reached and the test fails on the missing fallback before adding recovery.
- [ ] Place a viewport-local React error boundary around the interactive subtree, including its controls. The installed Fiber Canvas forwards rejected renderer configuration to React by throwing during render. Use the same HTML fallback for this path and keep scene selection and lesson navigation outside the boundary. Keep failure state for that viewport mount so a scene switch updates the fallback without repeatedly attempting initialization.
- [ ] Rerun the renderer-failure case. Assert the fallback is visible, another scene can be selected and the lesson remains navigable. Exercise the healthy path separately with WebGL 2 available. Verify a scene draws, switching scenes works, and the ASCII and pause controls respond.

### 3. Verify the release

- [ ] Run npm run build and npm test. Record the browser and results for the blocked, initialization-failure and healthy paths.
- [ ] On a device with Lockdown Mode enabled and active for the site, open the production build in Safari. Test fresh entry, returning-session reload, reading a lesson, switching standalone lab scenes and navigating back. Record device, OS, Safari version and outcome. Keep this check pending until it is performed on an actual device.

**Acceptance** — A graphics failure stays inside the lab in every location. The curriculum remains navigable with Lockdown Mode active, and supported browsers retain the working 3D experience.

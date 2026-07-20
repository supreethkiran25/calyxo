<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Calyxo Routing Rules
- NEVER automatically redirect from root URL `http://localhost:5173/` (`/`) to `/user/dashboard` or `/trainer/dashboard` upon page load or session recovery.
- Navigating to `/` MUST always stay at `/` and render the `LandingPage` component without forcing navigation to dashboard.


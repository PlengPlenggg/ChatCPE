# cpechat (React + Vite + TS)

This project was scaffolded to implement UI from the Figma design.

## Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview production build
- `npm run lint`: Lint TypeScript/React files
- `npm run format`: Format with Prettier

## Quick Start

```powershell
npm install
npm run dev
```

Then open the shown local URL in your browser.

## Structure

- `src/pages/Home.tsx`: Starter page
- `src/components/Placeholder.tsx`: Lightweight placeholder wrapper
- `src/styles/global.css`: Minimal global styles

## Notes

- Husky pre-commit hooks run ESLint and Prettier on staged files.
- Components derived from the Figma node will be added under `src/components/` and wired into `Home`.
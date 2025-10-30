# Fix Vercel Blank Screen Deployment

- [x] Update frontend/vite.config.js: Add base: "./" and outDir: "dist"
- [x] Update vercel.json: Change rewrites destination to "/"
- [x] Test locally: cd frontend && npm run build && npx serve dist

# Door Opening Tracker

A client-side React dashboard for uploading a QRS mainline CSV, calculating door-opening compliance, documenting missed metrics, and exporting the completed records to JSON.

## Requirements

- Node.js 20+
- Git
- A GitHub repository

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build

```bash
npm run build
```

## GitHub Pages

1. Create a GitHub repository named `door-opening-tracker`.
2. Push this project to the `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Set the Pages source to **GitHub Actions**.
5. The workflow in `.github/workflows/deploy.yml` will build and deploy the site.
6. The site will be available at:

`https://YOUR-USERNAME.github.io/door-opening-tracker/`

If you use a different repository name, change the `base` value in `vite.config.js` to match it.

## CSV logic

Narrow Body:
- 319
- 320
- 321
- 738
- Target: 2:30

Wide Body:
- 787
- 777
- Target: 3:30

All CSV parsing and JSON export happen in the user's browser. No backend is used.

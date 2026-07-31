# spitexlueg

TYPO3 14 project for **Lueg** (dsstudio / Studio Thompfister).

## Stack

- TYPO3 CMS **14.3** (Composer mode)
- Local dev via **DDEV** (PHP 8.4, nginx-fpm, MariaDB 11.8, docroot `public/`)
- Site package: `src/packages/site_package` (Composer package `lueg/site-package`)

## Local setup

```bash
ddev start
ddev composer install
```

Then finish the TYPO3 install once at `https://lueg.ddev.site/typo3/install.php`
(DDEV DB credentials: host `db`, user `db`, password `db`, database `db`).

- Frontend: https://lueg.ddev.site/
- Backend: https://lueg.ddev.site/typo3

## Frontend (Tailwind + Vite)

CSS/JS are bundled with **Vite** (Tailwind v4) and integrated via
`praetorius/vite-asset-collector` + the DDEV add-on `s2b/ddev-vite-sidecar`.

```bash
ddev npm install     # once, after cloning
ddev vite            # dev server with HMR / live reload → keep running while working
ddev npm run build   # production build into public/_assets/vite/
```

- With DDEV in **Development** context (`TYPO3_CONTEXT=Development`, already set),
  assets are served from the Vite dev server at `https://vite.lueg.ddev.site`
  with hot module replacement — the browser refreshes on every change.
- Entry point: `src/packages/site_package/Resources/Private/Frontend/main.js`
  (imports `main.css`). Registered via `Configuration/ViteEntrypoints.json`.
- Tailwind scans the Fluid templates via `@source` directives in `main.css`.
- **Run `ddev npm run build` before deploying** (production context uses the built manifest).

## Site package

The extension `site_package` provides:

- **Site Set** (`Configuration/Sets/SitePackage/`) — TypoScript setup/constants, loaded via
  the site configuration's `dependencies`.
- **Backend layout** `Default` (Header / Body / Footer) — `Configuration/page.tsconfig`.
- **RTE preset** `site_package` — `Configuration/RTE/Default.yaml`, set as default in page TSconfig.
- **Fluid templates** — `Resources/Private/{Layouts,Templates,Partials}`.
- **Assets** — `Resources/Public/{Css,JavaScript,Icons}`.

## Notes

- `config/system/settings.php`, `vendor/`, `public/` (generated) and `var/` are gitignored.
- The site configuration is versioned in `config/sites/lueg/config.yaml`.

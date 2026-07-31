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

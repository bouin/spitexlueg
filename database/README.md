# Database dump

`lueg.sql.gz` is a full dump of the local DDEV database (pages, content
elements, site config, backend user, …). Useful to spin the site up with all
content on another machine.

## Restore

```bash
ddev import-db --file=database/lueg.sql.gz
ddev exec vendor/bin/typo3 cache:flush
```

## Refresh the dump

```bash
ddev export-db --file=database/lueg.sql.gz
```

Note: the dump includes `be_users` (with the admin password hash). Uploaded
media lives in `fileadmin/` (gitignored) — re-upload images after restoring.

# Backend files

`schema.sql` initializes the MySQL 8 schema and base configuration. It intentionally creates no default admin. Use `bin/create-admin.php` after importing the schema. The PHP REST entry point is `api/index.php`; `config/Database.php` loads credentials from the root `.env` file.

See the root README for setup, the current API scope, and remaining requirements before production deployment.

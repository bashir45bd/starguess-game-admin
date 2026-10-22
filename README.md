# StarGuess Admin and API

The project contains the supplied StarGuess admin UI, a PHP 8.2 REST API, and the MySQL schema. The API is the authority for accounts, game configuration, match results, and Stars ledger changes.

## Local XAMPP setup

1. Start Apache and MySQL in XAMPP. The current local instance has `starguess_db` created and `backend/schema.sql` imported. For a fresh install, create the database:

   ```sql
   CREATE DATABASE starguess_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. `.env` is configured for the local XAMPP root account. Replace those values for another database and keep `.env` private.
3. Import `backend/schema.sql` into `starguess_db`.
4. A local super-admin account named `admin` is provisioned in the current database. Its generated password was provided in the setup conversation. For a fresh install, create an admin through the CLI; it prompts for a password and stores only its hash:

   ```powershell
   C:\xampp\php\php.exe C:\xampp\htdocs\starguess-admin\backend\bin\create-admin.php admin admin@example.com "Site Administrator"
   ```

5. Run `npm install`, then `npm run build`. Copy the generated `dist` contents into this document root if Apache serves the production build.
6. Open `http://localhost/starguess-admin/`. The dashboard API routes require Apache `mod_rewrite` and PDO MySQL.

## API features currently present

- Admin login/session validation/logout, self-service password change with current-password verification, session rotation and audit logging, role permission checks, dashboard KPIs and seven-day charts.
- User registration/login with a 15-minute lock after five invalid passwords, email-code password recovery (15-minute code expiry, attempt limit, and session revocation), profile update, wallet and transaction history, packages, daily/weekly/all-time leaderboards, notifications, daily reward claim, support ticket creation, and Stars transfer.
- Quick and private match creation/join, server-validated secret/guess flow, immutable wallet entries, commission accounting, match history, and game configuration.
- Admin user listing/detail/status/risk management, wallet listing/adjustment with reason and audit record, package and game-mode updates, payments/disputes, game audit and password-reverified match refunds, leaderboards/rewards/referrals, audit logs, anti-fraud alert handling, notifications, dashboard charts, and protected boolean settings changes.

Email verification and password recovery use short-lived, single-use email codes. Registration does not create an authenticated session until email verification succeeds. SMTP delivery is configurable through the environment variables in `.env.example`.

SSLCommerz hosted checkout is implemented in sandbox mode by default. The API creates pending orders and credits Stars only after server-side Order Validation confirms the transaction, currency, amount, and order snapshot. Customer success redirects and the provider IPN both use the same idempotent validator. Before live use, configure the merchant credentials and public HTTPS base URL in `.env`; configure the matching IPN URL in the SSLCommerz merchant portal. Never put these credentials in Flutter.

Maximum guess attempts settle the match on the server. Run the game settlement worker every minute so stale quick matches are refunded and expired turns are settled:

```powershell
C:\xampp\php\php.exe C:\xampp\htdocs\starguess-admin\backend\bin\settle-expired-games.php
```

The schema includes broader platform tables whose complete workflows are not implemented, including double-round gameplay, editing individual range/fee configuration rows, exports, encrypted backup execution, and broad automated abuse/rate limiting. Production deployment also requires a public HTTPS host, an approved SSLCommerz merchant account and credentials, working SMTP credentials with a verified sender, a non-root database account, scheduled worker execution, monitoring, backups, and a release signing key.

## Deployment requirements

Use HTTPS, a non-root database account, secret values in environment configuration, an SMTP service with verified sender, rate limiting at the web server/API layer, scheduled cleanup/timeout workers, backups, and monitoring. Configure `APP_BASE_URL` as the public app origin containing the `starguess-admin` path; the API appends `/api/v1` for provider callbacks. Begin with SSLCommerz sandbox credentials and `SSLCOMMERZ_MODE=sandbox`; switch to live only after callback/IPN validation on the public HTTPS site. The Flutter app uses `--dart-define=API_URL=https://your-host/starguess-admin/api/v1` for a production API address. Do not deploy using the local Android emulator URL or plain HTTP.

The dashboard chart and KPI endpoints read current MySQL data. Live push updates are not implemented; the admin UI refreshes by navigation/reload.

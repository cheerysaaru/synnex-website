# Laravel backend scaffold

This folder contains the Laravel-compatible API files for the Synnex Technology contact system. Generate a fresh Laravel application in this folder (or copy these files into an existing Laravel app) and set PostgreSQL values in `.env`.

Required environment values:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=synnext
DB_USERNAME=postgres
DB_PASSWORD=change-me
```

The endpoint is `POST /api/contact-submissions` with `name`, `phone`, `service`, and `message` fields. It returns a JSON acknowledgement after validation and persistence.

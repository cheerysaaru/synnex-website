# Backend setup

This repository includes the Laravel API contract, validation, Eloquent model, migration, PostgreSQL connection config, and a local PostgreSQL Docker service definition. The current Manus sandbox does not include PHP, Composer, Docker, or `psql`, so the backend cannot be executed here; it is ready to run on a PHP/Laravel environment.

## Fresh Laravel application

Create a Laravel 11 app in `backend/` or copy the provided `app/`, `routes/`, `database/`, `config/database.php`, and `composer.json` files into an existing Laravel app. Then copy `.env.example` to `.env`, set the PostgreSQL password, and run:

```bash
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

## PostgreSQL with Docker

From `backend/` on a machine with Docker:

```bash
docker compose up -d postgres
```

The frontend is configured as demo-only for now, so no browser submission is sent to the API until an API base URL is deliberately wired into the React form.

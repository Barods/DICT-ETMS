# ETMS Django Backend

This project uses **Django** as the backend framework and **XAMPP phpMyAdmin** to manage the MySQL-compatible database used by the application.

Open phpMyAdmin at `http://localhost/phpmyadmin` after starting Apache and MySQL in XAMPP. Create a database named `etms`; Django will create the tables through migrations.

## Setup

1. Start Apache and MySQL in the XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin` and create a database named `etms`.
3. Copy `.env.example` to `.env` and set the database credentials.
4. Install dependencies with `python -m pip install -r requirements.txt`.
5. Apply migrations with `python manage.py migrate`.
6. Start the API with `python manage.py runserver 8001`.

The API will be available at `http://localhost:8001/api/`.

## Endpoints

- `GET /api/health/`
- `GET|POST /api/tasks/`
- `GET|PUT|PATCH|DELETE /api/tasks/<id>/`
- `GET|POST /api/notifications/`
- `GET|PUT|PATCH|DELETE /api/notifications/<id>/`

The Next.js frontend can call the API from `http://localhost:3000` through the configured CORS origin.
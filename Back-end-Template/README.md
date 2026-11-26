# Back-end Template

## Local Installation Process

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites
- Install **Python 3.9.0** (Recommended version: [Download Python 3.9.0](https://www.python.org/ftp/python/3.9.0/python-3.9.0-amd64.exe)). Make sure to check the "Add Path" option during installation.


### 2. Database Setup
The application uses MySQL by default. Start MySQL (for example through XAMPP) and set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` to match your database. Use `DB_ENGINE=sqlite` only when intentionally running against the local SQLite database.


### 3. Environment Setup
Clone the repository and set up a virtual environment:

```bash
# Clone the repository
git clone <REPO_URL>
cd ./Back-end-Template

# Create and activate a virtual environment
# Install pipenv globally
pip install pipenv

# Activate the virtual environment
pipenv shell

# Install project dependencies
pipenv install

# Run Django through the Pipenv environment
pipenv run python manage.py migrate
pipenv run python manage.py runserver 0.0.0.0:8000
```

### 4. Configuration
Database settings are read from environment variables in [config/settings.py](config/settings.py). `DB_ENGINE` defaults to `mysql`; the connection defaults are `DB_NAME=etms`, `DB_USER=root`, `DB_PASSWORD=` (empty), `DB_HOST=localhost`, and `DB_PORT=3306`. Set these variables before starting Django if your MySQL connection uses different values. Set `DB_ENGINE=sqlite` to use `db.sqlite3` instead. Email settings and `SECRET_KEY` remain configured in `config/settings.py`.

### 5. Running the Application
Once the dependencies are installed, migrate the database and start the server:

```bash
# Run database migrations
pipenv run python manage.py migrate
# Start the development server
pipenv run python manage.py runserver 0.0.0.0:8000
```

### 6. Seed Data
`accounts.UserAccount` requires an `office`, so create one before creating a user. For an intentionally selected SQLite setup, run:

```bash
pipenv run python manage.py shell
```

Then create the office in the Django shell:

```python
from offices.models import Office
Office.objects.get_or_create(
    officeMail='hq@company.com',
    defaults={
        'name': 'Headquarters',
        'street': '123 Main St',
        'city': 'Cagayan de Oro',
        'province': 'Misamis Oriental',
        'region': 'Northern Mindanao',
        'numUsers': 45,
    },
)
exit()
```

For a MySQL setup, the same office can be added in phpMyAdmin's SQL tab:

```sql
INSERT INTO offices_office (name, officeMail, street, city, province, region, numusers)
VALUES ('Headquarters', 'hq@company.com', '123 Main St', 'Cagayan de Oro', 'Misamis Oriental', 'Northern Mindanao', 45);
```
```sql
INSERT INTO `accounts_useraccount` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_active`, `is_staff`, `office_id`, `position`, `acc_lvl`) VALUES
(1, 'pbkdf2_sha256$600000$b0Jc0HzaNEjlgo95x2Co5S$qDNW4xXSc+3QQ1eAzFqInCQRz2J4T0s9PAy9EwDUyoQ=', '2026-08-24 08:23:43.581439', 1, 'admin@gmail.com', 'admin', 'gwapo', 1, 1, 1, 'System Administrator', 5);
```




```bash
python manage.py createsuperuser
```

```bash
FRONT-END-Credentials
username: admin@gmail.com
password: ChangeMe123!
```
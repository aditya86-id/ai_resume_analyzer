web: cd backend && gunicorn resume_analyzer.wsgi:application --bind 0.0.0.0:$PORT --workers 3
release: cd backend && python manage.py migrate && python manage.py collectstatic --noinput

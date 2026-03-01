from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import User
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Setup the database for the AI Resume Analyzer"

    def handle(self, *args, **options):
        self.stdout.write("Starting database setup...")
        
        # Run migrations
        self.stdout.write("Running migrations...")
        call_command("migrate", verbosity=0)
        self.stdout.write(self.style.SUCCESS("✓ Migrations completed"))
        
        # Create superuser if it doesn't exist
        self.stdout.write("Creating default superuser...")
        try:
            User.objects.get(username="admin")
            self.stdout.write(self.style.WARNING("⚠ Admin user already exists"))
        except User.DoesNotExist:
            User.objects.create_superuser("admin", "admin@resumeai.com", "admin123")
            self.stdout.write(self.style.SUCCESS("✓ Admin user created (username: admin, password: admin123)"))
        
        # Seed jobs and templates
        self.stdout.write("Seeding job descriptions and templates...")
        call_command("seed_jobs_and_templates", verbosity=0)
        self.stdout.write(self.style.SUCCESS("✓ Database seeded with sample data"))
        
        self.stdout.write(self.style.SUCCESS("\n✓ Database setup completed successfully!"))
        self.stdout.write("\nYou can now start the server with: python manage.py runserver")

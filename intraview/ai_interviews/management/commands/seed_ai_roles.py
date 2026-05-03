# ai_interviews/management/commands/seed_ai_roles.py

from django.core.management.base import BaseCommand

from ai_interviews.models import Role


BASE_ROLES = [
    # Featured roles (top 15 grid)
    {
        "name": "Digital Marketing Specialist",
        "category": "Marketing",
        "is_featured": True,
        "display_order": 10,
        "aliases": ["Digital Marketer"],
    },
    {
        "name": "Sales Executive",
        "category": "Sales",
        "is_featured": True,
        "display_order": 20,
        "aliases": ["Sales Representative"],
    },
    {
        "name": "Business Analyst",
        "category": "Business",
        "is_featured": True,
        "display_order": 30,
        "aliases": ["BA"],
    },
    {
        "name": "Data Scientist",
        "category": "Data",
        "is_featured": True,
        "display_order": 40,
        "aliases": [],
    },
    {
        "name": "Data Analyst",
        "category": "Data",
        "is_featured": True,
        "display_order": 50,
        "aliases": [],
    },
    {
        "name": "Marketing Manager",
        "category": "Marketing",
        "is_featured": True,
        "display_order": 60,
        "aliases": [],
    },
    {
        "name": "Customer Service Representative",
        "category": "Support",
        "is_featured": True,
        "display_order": 70,
        "aliases": ["Customer Support", "CSR"],
    },
    {
        "name": "Financial Analyst",
        "category": "Finance",
        "is_featured": True,
        "display_order": 80,
        "aliases": [],
    },
    {
        "name": "Account Manager",
        "category": "Business",
        "is_featured": True,
        "display_order": 90,
        "aliases": [],
    },
    {
        "name": "Web Designer",
        "category": "Design",
        "is_featured": True,
        "display_order": 100,
        "aliases": ["UI Designer"],
    },
    {
        "name": "Full Stack Developer",
        "category": "Engineering",
        "is_featured": True,
        "display_order": 110,
        "aliases": ["Fullstack Engineer"],
    },
    {
        "name": "Product Manager",
        "category": "Product",
        "is_featured": True,
        "display_order": 120,
        "aliases": ["PM"],
    },
    {
        "name": "Cybersecurity Analyst",
        "category": "Security",
        "is_featured": True,
        "display_order": 130,
        "aliases": ["Security Analyst"],
    },
    {
        "name": "Software Engineer",
        "category": "Engineering",
        "is_featured": True,
        "display_order": 140,
        "aliases": ["SDE", "Software Developer"],
    },
    {
        "name": "Project Manager",
        "category": "Project Management",
        "is_featured": True,
        "display_order": 150,
        "aliases": ["Scrum Master (partial)"],
    },
    # You can append more non-featured roles here.
]


class Command(BaseCommand):
    help = "Seed base AI interview roles into the database."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in BASE_ROLES:
            name = data["name"]
            defaults = {
                "category": data.get("category", ""),
                "description": data.get("description", ""),
                "aliases": data.get("aliases", []),
                "skills": data.get("skills", []),
                "is_featured": data.get("is_featured", False),
                "display_order": data.get("display_order", 0),
                "is_active": data.get("is_active", True),
            }

            obj, created = Role.objects.update_or_create(
                name=name,
                defaults=defaults,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created role: {obj.name}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"Updated role: {obj.name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created={created_count}, Updated={updated_count}"
            )
        )
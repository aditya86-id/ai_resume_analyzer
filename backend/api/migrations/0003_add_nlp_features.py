# Generated migration for NLP features

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_skill_options_resumeanalysis_ai_suggestions_and_more'),
    ]

    operations = [
        # Add NLP analysis fields to JobDescription
        migrations.AddField(
            model_name='jobdescription',
            name='extracted_skills',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='jobdescription',
            name='experience_level',
            field=models.CharField(
                choices=[
                    ('entry', 'Entry-level'),
                    ('junior', 'Junior'),
                    ('mid', 'Mid-level'),
                    ('senior', 'Senior'),
                    ('executive', 'Executive'),
                ],
                default='mid',
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name='jobdescription',
            name='skill_categories',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='jobdescription',
            name='requirements_summary',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='jobdescription',
            name='nlp_analysis',
            field=models.JSONField(default=dict),
        ),
        # Add NLP matching fields to JobMatch
        migrations.AddField(
            model_name='jobmatch',
            name='partial_matches',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='jobmatch',
            name='match_details',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='jobmatch',
            name='match_quality',
            field=models.CharField(
                choices=[
                    ('excellent', 'Excellent'),
                    ('good', 'Good'),
                    ('fair', 'Fair'),
                    ('poor', 'Poor'),
                ],
                default='good',
                max_length=20,
            ),
        ),
    ]

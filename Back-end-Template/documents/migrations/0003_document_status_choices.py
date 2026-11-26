from django.db import migrations, models


def normalize_statuses(apps, schema_editor):
    Document = apps.get_model('documents', 'Document')
    Document.objects.filter(status='Pending').update(status='Draft')
    Document.objects.filter(status='Received').update(status='Published')


class Migration(migrations.Migration):
    dependencies = [
        ('documents', '0002_document_delete_letter'),
    ]

    operations = [
        migrations.RunPython(normalize_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='document',
            name='status',
            field=models.CharField(
                choices=[
                    ('Published', 'Published'),
                    ('Draft', 'Draft'),
                    ('Archived', 'Archived'),
                ],
                default='Draft',
                max_length=20,
            ),
        ),
    ]

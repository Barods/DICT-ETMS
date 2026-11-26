from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('documents', '0003_document_status_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='documents/'),
        ),
    ]
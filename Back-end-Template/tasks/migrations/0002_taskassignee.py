from django.db import migrations, models


ASSIGNEE_NAMES = [
    'Isn Roy',
    'Ian Nico',
    'Ella Grace',
    'Jason',
    'Reyson',
    'Shala',
    'Mohammad Aslan',
    'Almarie',
    'Shawiy Omar',
    'Sir Rey',
]


def seed_assignees(apps, schema_editor):
    TaskAssignee = apps.get_model('tasks', 'TaskAssignee')
    TaskAssignee.objects.using(schema_editor.connection.alias).bulk_create(
        [TaskAssignee(name=name) for name in ASSIGNEE_NAMES],
        ignore_conflicts=True,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskAssignee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('department', models.CharField(default='Operations', max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.RunPython(seed_assignees, migrations.RunPython.noop),
    ]
# Generated by Django 2.0.3 on 2018-05-03 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thefederation', '0014_fix_some_node_fields_to_be_blank_true'),
    ]

    operations = [
        migrations.AddField(
            model_name='platform',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='platform',
            name='tagline',
            field=models.CharField(blank=True, max_length=300),
        ),
    ]
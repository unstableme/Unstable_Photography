# Generated by Django 4.1.7 on 2025-02-25 09:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='title',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='photo',
            name='category',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='photo',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='photo',
            name='image',
            field=models.ImageField(upload_to='gallery_images/'),
        ),
        migrations.AlterField(
            model_name='photo',
            name='location',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

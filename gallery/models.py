from django.db import models

class Photo(models.Model):
    title = models.CharField(max_length=255, default="")
    image = models.ImageField(upload_to='gallery_images/')
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

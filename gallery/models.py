from django.db import models
from cloudinary.models import CloudinaryField

class Photo(models.Model):
    title = models.CharField(max_length=255, default="")
    image = CloudinaryField('image')  # Use CloudinaryField instead of ImageField
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

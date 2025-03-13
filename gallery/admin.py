from django.contrib import admin
from .models import Photo

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'category', 'uploaded_at', 'image')
    search_fields = ('title', 'location', 'category')
    list_filter = ('location', 'category')


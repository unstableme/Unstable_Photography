from django.shortcuts import render
from .models import Photo

def gallery_view(request):
    sort_by = request.GET.get('sort', 'location')  # Default sort by location
    photos = Photo.objects.all()

    grouped_photos = {}
    
    # Choose sorting key: location or category
    for photo in photos:
        if sort_by == "category":
            key = photo.category if photo.category else "Unknown Category"
        else:
            key = photo.location if photo.location else "Unknown Location"

        if key not in grouped_photos:
            grouped_photos[key] = []
        grouped_photos[key].append(photo)

    return render(request, 'gallery.html', {'grouped_photos': grouped_photos, 'sort_by': sort_by})

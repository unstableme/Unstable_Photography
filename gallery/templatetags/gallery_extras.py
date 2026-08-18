"""Small helpers for rendering Cloudinary assets nicely.

These only affect *delivery* of the existing images (format, quality, size,
https) - never which images are shown or what is written about them.
"""

from django import template

register = template.Library()

_UPLOAD = "/upload/"


@register.filter
def cld(value, transform="f_auto,q_auto"):
    """Return a Cloudinary URL with `transform` applied, forced over https.

    Falls back to the original value for anything that is not a Cloudinary
    delivery URL, so static images and future storages keep working.
    """
    url = str(value or "")
    if not url:
        return url

    if url.startswith("http://"):
        url = "https://" + url[len("http://"):]

    if transform and _UPLOAD in url:
        head, marker, tail = url.partition(_UPLOAD)
        # Don't stack transforms if one is somehow already baked in.
        if not tail.startswith(("f_", "q_", "c_", "w_", "h_", "e_", "g_")):
            return "".join([head, marker, transform, "/", tail])

    return url

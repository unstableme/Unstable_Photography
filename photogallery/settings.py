import os
from pathlib import Path

import environ
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
# Read .env FIRST, and with an explicit path.
#   - explicit path: django-environ otherwise looks next to this file
#     (photogallery/.env) rather than in the project root.
#   - first: the cloudinary SDK reads CLOUDINARY_URL from the environment at
#     import time, so the variables must exist before `import cloudinary`.
# On Render these are real environment variables and this file simply isn't
# there, which is a no-op.
environ.Env.read_env(BASE_DIR / '.env')

import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

CLOUDINARY_URL = env('CLOUDINARY_URL')

# Debugging: Print Database URL
DATABASE_URL = env('DATABASE_URL')

# Cloudinary configuration
cloudinary.config(cloudinary_url=CLOUDINARY_URL, secure=True)

SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: never run with debug turned on in production - it leaks
# tracebacks, settings and SQL to anyone who can trigger an error.
# Defaults to off, so production is safe unless you deliberately opt in.
# Escape hatch: set DEBUG=True in the Render dashboard to turn it back on.
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = ['unstable-photography.onrender.com', '127.0.0.1', 'localhost', '192.168.101.2','192.168.101.3','192.168.18.185']

CSRF_TRUSTED_ORIGINS = [
    "https://unstable-photography.onrender.com",
    "https://*.cloudinary.com"  # Cloudinary domain for media files
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'whitenoise.runserver_nostatic',
    'gallery',  # Make sure this is here
    'cloudinary',
    'cloudinary_storage',
    'storages',
]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATIC_URL = 'static/'

STATICFILES_DIRS = [BASE_DIR / "gallery/static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


ROOT_URLCONF = 'photogallery.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'gallery/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'photogallery.wsgi.application'


DATABASES = {
    'default': dj_database_url.config(default='sqlite:///db.sqlite3')  # Fallback to SQLite
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# --- Production hardening (only applied when DEBUG is off) ---------------
if not DEBUG:
    # Render terminates TLS and forwards the original scheme in this header.
    # Django needs it to know the request arrived over HTTPS.
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # Stop the session and CSRF cookies from ever crossing a plain HTTP link.
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Sensible low-risk defaults.
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

    # Left off deliberately - enable once you are sure the site is only ever
    # reached over HTTPS:
    #   SECURE_SSL_REDIRECT = True   # can loop if a proxy header is missing
    #   SECURE_HSTS_SECONDS = 31536000   # HSTS is effectively irreversible


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True



DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Use Cloudinary for media storage
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'


MEDIA_URL = '/media/'
#MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


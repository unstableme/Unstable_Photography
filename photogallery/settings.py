import os
from pathlib import Path

import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings
import environ
import dj_database_url


env = environ.Env()
# Reading .env file
environ.Env.read_env()

CLOUDINARY_URL = env('CLOUDINARY_URL')
print("CLOUDINARY_URL:", CLOUDINARY_URL)  # Debugging: Check if the URL is loaded correctly


# Debugging: Print Database URL
DATABASE_URL = env('DATABASE_URL')
print("DATABASE_URL:", DATABASE_URL)
# Cloudinary configuration
cloudinary.config(cloudinary_url=CLOUDINARY_URL)
print("Cloudinary Config:", cloudinary.config().cloud_name)  # Should print your cloud name
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-uh#marv=r*#2=e)mhab(f=2bs2ybbzp0vwa*u&92vd7%&znsvl'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['unstable-photography.onrender.com', '127.0.0.1', 'localhost', '192.168.101.2','192.168.101.3']

CSRF_TRUSTED_ORIGINS = [
    "https://unstable-photography.onrender.com",
    "https://*.cloudinary.com"  # Cloudinary domain for media files
]


# Application definition

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

STATICFILES_DIRS = [BASE_DIR / 'gallery/static']  # If you have a static folder in your project
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


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.config(default=env('DATABASE_URL'))  # Use `env()` to read DATABASE_URL
}
print("Cloudinary URL:", CLOUDINARY_URL)
print("Database URL:", env('DATABASE_URL'))

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/



STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # The location where static files will be stored after `collectstatic`

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Use Cloudinary for media storage
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'


MEDIA_URL = '/media/'
#MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

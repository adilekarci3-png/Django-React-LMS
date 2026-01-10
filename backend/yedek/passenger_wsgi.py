# passenger_wsgi.py
import os, sys

BASE_DIR = os.path.dirname(__file__)
sys.path.insert(0, BASE_DIR)

# (Eğer sanal ortam kullanıyorsan – aşağıdaki iki satırı venv yoluna göre aç)
# import site
# site.addsitedir('/home/akademiehadorg/test.akademi.ehad.org.tr/backend/venv/lib/python3.11/site-packages')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from backend.wsgi import application

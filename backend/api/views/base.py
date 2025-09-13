# api/views/base.py
from django.conf import settings
from django.contrib.auth import get_user_model

import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY
PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
PAYPAL_SECRET_ID = settings.PAYPAL_SECRET_ID

from rest_framework.permissions import AllowAny
from rest_framework import generics, serializers

from api import models as api_models
from api import serializers as api_serializer  # Diğer modüller de bunu kullanıyor

User = get_user_model()


class BaseVariantMixin:
    permission_classes = [AllowAny]

    def extract_variants(self, prefix, parent_instance, variant_model, item_model):
        """
        Form-data'dan:
          variants[0][title] = ...
          variants[0][pdf]   = <file>
        gibi alanları okuyup ilgili Variant ve Item'ları oluşturur.
        """
        for key in self.request.data:
            if key.startswith("variants") and key.endswith("[title]"):
                index = key.split("[")[1].split("]")[0]
                title = self.request.data[key]
                pdf_key = f"variants[{index}][pdf]"
                pdf_file = self.request.data.get(pdf_key)

                variant_instance = variant_model.objects.create(
                    title=title,
                    **{prefix: parent_instance}
                )
                if pdf_file:
                    item_model.objects.create(
                        variant=variant_instance,
                        title=title,
                        file=pdf_file
                    )

    def get_koordinator_by_user(self, user):
        try:
            stajer = api_models.Stajer.objects.get(user=user)
            return stajer.instructor
        except api_models.Stajer.DoesNotExist:
            try:
                ogrenci = api_models.Ogrenci.objects.get(user=user)
                return ogrenci.instructor
            except api_models.Ogrenci.DoesNotExist:
                return None


class BaseCreateAPIView(BaseVariantMixin, generics.CreateAPIView):
    pass


class BaseUpdateAPIView(BaseVariantMixin, generics.UpdateAPIView):
    pass


class BaseListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]


class BaseDestroyAPIView(generics.DestroyAPIView):
    permission_classes = [AllowAny]

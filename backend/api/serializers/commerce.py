from rest_framework import serializers
from api import models as api_models

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Cart
        fields = '__all__'

class CartOrderItemSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(read_only=True)
    teacher = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = api_models.CartOrderItem
        fields = '__all__'

class CartOrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    class Meta:
        model = api_models.CartOrder
        fields = '__all__'
    def get_order_items(self, obj):
        order_items = api_models.CartOrderItem.objects.filter(order=obj)
        return CartOrderItemSerializer(order_items, many=True, context=self.context).data

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Certificate
        fields = '__all__'

class _DepthOnPostMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

class CompletedLessonSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.CompletedLesson
        fields = '__all__'

class CompletedOdevSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.CompletedOdev
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Coupon
        fields = '__all__'

class WishlistSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.Wishlist
        fields = '__all__'

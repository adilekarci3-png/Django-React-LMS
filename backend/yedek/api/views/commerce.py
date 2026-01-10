# commerce.py (YENİ)
import stripe, requests
from decimal import Decimal
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

# from api import models as api_models
# from api import serializers as api_serializer
from .. import models as api_models, serializers as api_serializer

stripe.api_key = settings.STRIPE_SECRET_KEY
PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
PAYPAL_SECRET_ID = settings.PAYPAL_SECRET_ID

class CartAPIView(generics.CreateAPIView):
    queryset = api_models.Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        course = api_models.Course.objects.filter(id=course_id).first()
        user = api_models.User.objects.filter(id=user_id).first() if user_id != "undefined" else None

        country_object = api_models.Country.objects.filter(name=country_name).first()
        country = country_object.name if country_object else "Türkiye"
        tax_rate = (country_object.tax_rate / 100) if country_object else 0

        cart = api_models.Cart.objects.filter(cart_id=cart_id, course=course).first()
        if not cart:
            cart = api_models.Cart(course=course)

        cart.user = user
        cart.price = price
        cart.tax_fee = Decimal(price) * Decimal(tax_rate)
        cart.country = country
        cart.cart_id = cart_id
        cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
        cart.save()

        return Response({"message": "Cart Created Successfully" if not cart else "Cart Updated Successfully"},
                        status=status.HTTP_201_CREATED)

class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        return api_models.Cart.objects.filter(cart_id=cart_id)

class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']
        return get_object_or_404(api_models.Cart, cart_id=cart_id, id=item_id)

class CartStatsAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        return api_models.Cart.objects.filter(cart_id=cart_id)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        total_price = sum(Decimal(ci.price or 0) for ci in queryset)
        total_tax   = sum(Decimal(ci.tax_fee or 0) for ci in queryset)
        total_total = sum(Decimal(ci.total or 0) for ci in queryset)
        return Response({"price": float(total_price), "tax": float(total_tax), "total": float(total_total)})

class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        full_name = request.data.get('full_name', '')
        email = request.data.get('email', '')
        country = request.data.get('country', '')
        cart_id = request.data.get('cart_id')
        user_id = request.data.get('user_id', 0)

        user = get_object_or_404(api_models.User, id=user_id) if user_id not in (0, "0", None, "") else None
        cart_items = api_models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_initial_total = Decimal("0.00")
        total_total = Decimal("0.00")

        order = api_models.CartOrder.objects.create(
            full_name=full_name, email=email, country=country, student=user
        )

        for c in cart_items:
            api_models.CartOrderItem.objects.create(
                order=order, course=c.course, price=c.price, tax_fee=c.tax_fee,
                total=c.total, initial_total=c.total, teacher=c.course.teacher
            )
            total_price += Decimal(c.price or 0)
            total_tax += Decimal(c.tax_fee or 0)
            total_initial_total += Decimal(c.total or 0)
            total_total += Decimal(c.total or 0)
            order.teachers.add(c.course.teacher)

        # Bu alanlar modelde mevcut olmalı:
        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({"message": "Order Created Successfully", "order_oid": str(order.oid)},
                        status=status.HTTP_201_CREATED)

class CheckoutAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()
    lookup_field = 'oid'

class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = request.data.get('order_oid')
        coupon_code = request.data.get('coupon_code')
        if not order_oid or not coupon_code:
            return Response({"message": "Missing parameters", "icon": "error"}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(api_models.CartOrder, oid=order_oid)
        coupon = get_object_or_404(api_models.Coupon, code=coupon_code)

        order_items = api_models.CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
        if not order_items.exists():
            return Response({"message": "No eligible items for this coupon", "icon": "warning"}, status=status.HTTP_200_OK)

        coupon_applied = False
        for item in order_items:
            if coupon not in item.coupons.all():
                discount = item.total * coupon.discount / 100
                item.total -= discount
                item.price -= discount
                item.saved += discount
                item.applied_coupon = True
                item.coupons.add(coupon)
                item.save()

                order.total -= discount
                order.sub_total -= discount
                order.saved += discount
                coupon_applied = True

        if coupon_applied:
            order.coupons.add(coupon)
            order.save()
            if order.student_id:
                coupon.used_by.add(order.student)
            return Response({"message": "Coupon applied successfully", "icon": "success"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Coupon already applied", "icon": "warning"}, status=status.HTTP_200_OK)

class StripeCheckoutAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = self.kwargs['order_oid']
        order = get_object_or_404(api_models.CartOrder, oid=order_oid)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=order.email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': f"Order for {order.full_name}"},
                        'unit_amount': int(order.total * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.FRONTEND_SITE_URL}/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_SITE_URL}/payment-failed/",
            )
            # Modelde stripe_session_id alanı olmalı:
            order.stripe_session_id = checkout_session.id
            order.save()
            return Response({"url": checkout_session.url}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"message": "Payment error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    resp = requests.post(token_url, data=data, auth=(client_id, secret_key))
    if resp.status_code == 200:
        return resp.json()['access_token']
    raise Exception(f"Failed to get access token from PayPal {resp.status_code}")

class PaymentSuccessAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        session_id = request.data['session_id']
        paypal_order_id = request.data['paypal_order_id']

        order = get_object_or_404(api_models.CartOrder, oid=order_oid)
        order_items = api_models.CartOrderItem.objects.filter(order=order)

        # PayPal
        if paypal_order_id != "null":
            paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {get_access_token(PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID)}"
            }
            r = requests.get(paypal_api_url, headers=headers)
            if r.status_code == 200 and r.json().get('status') == "COMPLETED":
                if order.payment_status == "Processing":
                    order.payment_status = "Paid"
                    order.save()
                    api_models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")
                    for o in order_items:
                        api_models.Notification.objects.create(
                            teacher=o.teacher, order=order, order_item=o, type="New Order"
                        )
                        api_models.EnrolledCourse.objects.create(
                            course=o.course, user=order.student, teacher=o.teacher, order_item=o
                        )
                    return Response({"message": "Payment Successfull"})
                return Response({"message": "Already Paid"})
            return Response({"message": "PayPal Error Occurred"}, status=400)

        # Stripe
        if session_id != 'null':
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid":
                if order.payment_status == "Processing":
                    order.payment_status = "Paid"
                    order.save()
                    api_models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")
                    for o in order_items:
                        api_models.Notification.objects.create(
                            teacher=o.teacher, order=order, order_item=o, type="New Order"
                        )
                        api_models.EnrolledCourse.objects.create(
                            course=o.course, user=order.student, teacher=o.teacher, order_item=o
                        )
                    return Response({"message": "Payment Successfull"})
                return Response({"message": "Already Paid"})
            return Response({"message": "Payment Failed"}, status=400)

        return Response({"message": "No payment reference sent"}, status=400)

class CartAPIView(generics.CreateAPIView):
    queryset = api_models.Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        course = api_models.Course.objects.filter(id=course_id).first()
        user = None if user_id == "undefined" else api_models.User.objects.filter(id=user_id).first()

        try:
            country_object = api_models.Country.objects.filter(name=country_name).first()
            country = country_object.name
        except Exception:
            country_object = None
            country = "Türkiye"

        tax_rate = (country_object.tax_rate / 100) if country_object else 0
        cart = api_models.Cart.objects.filter(cart_id=cart_id, course=course).first()

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()
            return Response({"message": "Cart Updated Successfully"}, status=status.HTTP_200_OK)

        cart = api_models.Cart(
            course=course,
            user=user,
            price=price,
            tax_fee=Decimal(price) * Decimal(tax_rate),
            country=country,
            cart_id=cart_id,
        )
        cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
        cart.save()
        return Response({"message": "Cart Created Successfully"}, status=status.HTTP_201_CREATED)


class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        return api_models.Cart.objects.filter(cart_id=cart_id)


class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']
        return get_object_or_404(api_models.Cart, cart_id=cart_id, id=item_id)


class CartStatsAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        return api_models.Cart.objects.filter(cart_id=cart_id)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_total = Decimal("0.00")

        for cart_item in queryset:
            total_price += Decimal(cart_item.price or 0)
            total_tax += Decimal(cart_item.tax_fee or 0)
            total_total += Decimal(cart_item.total or 0)

        data = {"price": float(total_price), "tax": float(total_tax), "total": float(total_total)}
        return Response(data)


class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        full_name = request.data.get('full_name', '')
        email = request.data.get('email', '')
        country = request.data.get('country', '')
        cart_id = request.data.get('cart_id')
        user_id = request.data.get('user_id', 0)

        user = get_object_or_404(api_models.User, id=user_id) if user_id not in (0, "0", None, "") else None
        cart_items = api_models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_initial_total = Decimal("0.00")
        total_total = Decimal("0.00")

        order = api_models.CartOrder.objects.create(
            full_name=full_name,
            email=email,
            country=country,
            student=user
        )

        for c in cart_items:
            api_models.CartOrderItem.objects.create(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            )
            total_price += Decimal(c.price or 0)
            total_tax += Decimal(c.tax_fee or 0)
            total_initial_total += Decimal(c.total or 0)
            total_total += Decimal(c.total or 0)
            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({"message": "Order Created Successfully", "order_oid": str(order.oid)}, status=status.HTTP_201_CREATED)


class CheckoutAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()
    lookup_field = 'oid'


class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = request.data.get('order_oid')
        coupon_code = request.data.get('coupon_code')

        if not order_oid or not coupon_code:
            return Response({"message": "Missing parameters", "icon": "error"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = api_models.CartOrder.objects.get(oid=order_oid)
        except api_models.CartOrder.DoesNotExist:
            return Response({"message": "Order not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

        try:
            coupon = api_models.Coupon.objects.get(code=coupon_code)
        except api_models.Coupon.DoesNotExist:
            return Response({"message": "Coupon not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

        order_items = api_models.CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
        if not order_items.exists():
            return Response({"message": "No eligible items for this coupon", "icon": "warning"}, status=status.HTTP_200_OK)

        coupon_applied = False
        for item in order_items:
            if coupon not in item.coupons.all():
                discount = item.total * coupon.discount / 100
                item.total -= discount
                item.price -= discount
                item.saved += discount
                item.applied_coupon = True
                item.coupons.add(coupon)
                item.save()

                order.total -= discount
                order.sub_total -= discount
                order.saved += discount
                coupon_applied = True

        if coupon_applied:
            order.coupons.add(coupon)
            order.save()
            coupon.used_by.add(order.student)
            return Response({"message": "Coupon applied successfully", "icon": "success"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Coupon already applied", "icon": "warning"}, status=status.HTTP_200_OK)


class StripeCheckoutAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = self.kwargs['order_oid']
        order = get_object_or_404(api_models.CartOrder, oid=order_oid)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=order.email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': f"Order for {order.full_name}"},
                        'unit_amount': int(order.total * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.FRONTEND_SITE_URL}/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_SITE_URL}/payment-failed/",
            )

            order.stripe_session_id = checkout_session.id
            order.save()
            return Response({"url": checkout_session.url}, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            return Response(
                {"message": "Something went wrong when trying to make payment.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


def get_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    auth = (client_id, secret_key)
    response = requests.post(token_url, data=data, auth=auth)
    if response.status_code == 200:
        return response.json()['access_token']
    raise Exception(f"Failed to get access token from paypal {response.status_code}")


class PaymentSuccessAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        session_id = request.data['session_id']
        paypal_order_id = request.data['paypal_order_id']

        order = api_models.CartOrder.objects.get(oid=order_oid)
        order_items = api_models.CartOrderItem.objects.filter(order=order)

        # PayPal
        if paypal_order_id != "null":
            paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {get_access_token(PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID)}"
            }
            response = requests.get(paypal_api_url, headers=headers)
            if response.status_code == 200:
                paypal_payment_status = response.json()['status']
                if paypal_payment_status == "COMPLETED":
                    if order.payment_status == "Processing":
                        order.payment_status = "Paid"
                        order.save()
                        api_models.Notification.objects.create(
                            user=order.student, order=order, type="Course Enrollment Completed"
                        )
                        for o in order_items:
                            api_models.Notification.objects.create(
                                teacher=o.teacher, order=order, order_item=o, type="New Order"
                            )
                            api_models.EnrolledCourse.objects.create(
                                course=o.course, user=order.student, teacher=o.teacher, order_item=o
                            )
                        return Response({"message": "Payment Successfull"})
                    return Response({"message": "Already Paid"})
                return Response({"message": "Payment Failed"})
            return Response({"message": "PayPal Error Occured"})

        # Stripe
        if session_id != 'null':
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid":
                if order.payment_status == "Processing":
                    order.payment_status = "Paid"
                    order.save()
                    api_models.Notification.objects.create(
                        user=order.student, order=order, type="Course Enrollment Completed"
                    )
                    for o in order_items:
                        api_models.Notification.objects.create(
                            teacher=o.teacher, order=order, order_item=o, type="New Order"
                        )
                        api_models.EnrolledCourse.objects.create(
                            course=o.course, user=order.student, teacher=o.teacher, order_item=o
                        )
                    return Response({"message": "Payment Successfull"})
                return Response({"message": "Already Paid"})
            return Response({"message": "Payment Failed"})

        return Response({"message": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
    
class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(api_models.User, id=user_id)
        return api_models.Wishlist.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = get_object_or_404(api_models.User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)

        wishlist = api_models.Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            api_models.Wishlist.objects.create(user=user, course=course)
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)

class CartOrderItemListAPIView(APIView):
    def get(self, request):
        items = api_models.CartOrderItem.objects.all()
        serializer = api_serializer.CartOrderItemSerializer(items, many=True)
        return Response(serializer.data)
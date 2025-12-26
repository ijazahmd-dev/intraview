from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

def set_access_cookie(response, cookie_name, access_token):
    response.set_cookie(
        cookie_name,
        access_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    return response

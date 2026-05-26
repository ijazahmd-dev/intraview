# admin_dashboard/permissions.py
"""
Admin Dashboard permissions and authentication.

Re-exports existing admin auth classes for clean, localized imports.
No duplicated logic — delegates to the project's auth system.
"""

from authentication.authentication import AdminCookieJWTAuthentication  # noqa: F401
from authentication.permissions import IsAdminRole  # noqa: F401

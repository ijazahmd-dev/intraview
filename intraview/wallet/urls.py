from django.urls import path
from . import views_admin

urlpatterns = [


    path("admin/wallets/",views_admin.AdminTokenWalletListAPIView.as_view(),name="admin-wallet-list",),
    path("admin/wallets/<int:user_id>/transactions/", views_admin.AdminTokenTransactionListAPIView.as_view(),name="admin-wallet-transactions",),
    path("admin/wallets/<int:user_id>/transactions/export-csv/",views_admin.AdminTokenTransactionExportCSVAPIView.as_view(),name="admin-wallet-transactions-export-csv",),
    path("admin/wallets/stats/",views_admin.AdminWalletStatsAPIView.as_view(),name="admin-wallet-stats",),

    
]

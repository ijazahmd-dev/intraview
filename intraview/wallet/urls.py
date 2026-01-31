from django.urls import path
from . import views_admin
from . import views
from . import views_interviewer

urlpatterns = [

    #user urls
    path("candidate/summary/", views.CandidateWalletSummaryAPIView.as_view()),
    path("candidate/transactions/", views.CandidateWalletTransactionsAPIView.as_view()),
    path("candidate/stats/", views.CandidateWalletStatsAPIView.as_view()),



    #Iterviewer urls
    path("interviewer/summary/", views_interviewer.InterviewerWalletSummaryAPIView.as_view()),
    path("interviewer/transactions/", views_interviewer.InterviewerWalletTransactionsAPIView.as_view()),
    path("interviewer/stats/", views_interviewer.InterviewerWalletStatsAPIView.as_view()),
    path("interviewer/earnings/", views_interviewer.InterviewerEarningsAPIView.as_view()),
    path("interviewer/earnings/transactions/",views_interviewer.InterviewerEarningTransactionsAPIView.as_view()),

    path('wallet-payouts/request/',views_interviewer.InterviewerPayoutRequestCreateAPIView.as_view(),name='payout-request-create'),
    
    # Payout list and detail
    path('wallet-payouts/',views_interviewer.InterviewerPayoutListAPIView.as_view(),name='payout-list'),
    path('wallet-payouts/<int:payout_id>/',views_interviewer.InterviewerPayoutDetailAPIView.as_view(),name='payout-detail'),
    
    # Utility endpoints
    path('wallet-payouts/stats/',views_interviewer.InterviewerPayoutStatsAPIView.as_view(),name='payout-stats'),
    path('wallet-payouts/eligibility/',views_interviewer.InterviewerPayoutEligibilityCheckAPIView.as_view(),name='payout-eligibility'),



    #Admin urls
    path("admin/wallets/",views_admin.AdminTokenWalletListAPIView.as_view(),name="admin-wallet-list",),
    path("admin/wallets/<int:user_id>/transactions/", views_admin.AdminTokenTransactionListAPIView.as_view(),name="admin-wallet-transactions",),
    path("admin/wallets/<int:user_id>/transactions/export-csv/",views_admin.AdminTokenTransactionExportCSVAPIView.as_view(),name="admin-wallet-transactions-export-csv",),
    path("admin/wallets/stats/",views_admin.AdminWalletStatsAPIView.as_view(),name="admin-wallet-stats",),

    
]

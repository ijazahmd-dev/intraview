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

    path(
        'admin-wallet-payouts/queue/',
        views_admin.AdminPayoutQueueAPIView.as_view(),
        name='admin-payout-queue'
    ),
    path(
        'admin-wallet-payouts/history/',
        views_admin.AdminPayoutHistoryAPIView.as_view(),
        name='admin-payout-history'
    ),
    
    # Statistics
    path(
        'admin-wallet-payouts/stats/',
        views_admin.AdminPayoutStatsAPIView.as_view(),
        name='admin-payout-stats'
    ),
    
    # Detail view
    path(
        'admin-wallet-payouts/<int:payout_id>/',
        views_admin.AdminPayoutDetailAPIView.as_view(),
        name='admin-payout-detail'
    ),
    
    # # Single action endpoint (recommended)
    # path(
    #     'admin-wallet-payouts/<int:payout_id>/action/',
    #     views_admin.AdminPayoutActionAPIView.as_view(),
    #     name='admin-payout-action'
    # ),
    
    # Individual action endpoints (alternative)
    path(
        'admin-wallet-payouts/<int:payout_id>/approve/',
        views_admin.AdminPayoutApproveAPIView.as_view(),
        name='admin-payout-approve'
    ),
    path(
        'admin-wallet-payouts/<int:payout_id>/reject/',
        views_admin.AdminPayoutRejectAPIView.as_view(),
        name='admin-payout-reject'
    ),
    path(
        'admin-wallet-payouts/<int:payout_id>/mark-paid/',
        views_admin.AdminPayoutMarkPaidAPIView.as_view(),
        name='admin-payout-mark-paid'
    ),

    
]

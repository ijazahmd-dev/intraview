from django.conf import settings

APP_NAME = "IntraView"
SUPPORT_EMAIL = "support@intraview.app"


def application_submitted_email(user):
    subject = f"{APP_NAME}: Interviewer Application Received"

    message = f"""
Hi {user.username},

Thank you for applying to become an interviewer on {APP_NAME}.

We have successfully received your application and it is now under review by our team.

What happens next?
• Our admins will review your profile and documents.
• This usually takes 1–3 business days.
• You will receive an email once a decision is made.

If you have any questions, contact us at {SUPPORT_EMAIL}.

Best regards,
{APP_NAME} Team
""".strip()

    return subject, message


def application_approved_email(user):
    subject = f"{APP_NAME}: Your Interviewer Application is Approved 🎉"

    message = f"""
Hi {user.username},

Great news!

Your application to become an interviewer on {APP_NAME} has been approved.

Next steps:
• Log in to your interviewer account
• Complete onboarding (profile & availability)
• Start accepting interview sessions

You can log in here:
{settings.FRONTEND_URL}/interviewer/login

Welcome aboard!
{APP_NAME} Team
""".strip()

    return subject, message


def application_rejected_email(user, reason=None):
    subject = f"{APP_NAME}: Interviewer Application Update"

    rejection_note = (
        f"\nReason provided by admin:\n{reason}\n"
        if reason else
        "\nYou may reapply after improving your profile.\n"
    )

    message = f"""
Hi {user.username},

Thank you for your interest in becoming an interviewer on {APP_NAME}.

After reviewing your application, we are unable to proceed at this time.
{rejection_note}

This decision does not prevent you from applying again in the future.

If you have questions, contact {SUPPORT_EMAIL}.

Best regards,
{APP_NAME} Team
""".strip()

    return subject, message

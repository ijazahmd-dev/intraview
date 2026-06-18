# interviewers serializers.py

from rest_framework import serializers
from .models import InterviewerApplication, InterviewerProfile, InterviewerAvailability, InterviewerVerification, VerificationStatus



# class InterviewerApplicationCreateSerializer(serializers.ModelSerializer):


#     specializations = serializers.ListField(
#         child=serializers.CharField(),
#         allow_empty=False
#     )

#     languages = serializers.ListField(
#         child=serializers.CharField(),
#         allow_empty=False
#     )



#     class Meta:
#         model = InterviewerApplication
#         exclude = ("user", "status", "reviewed_at", "reviewed_by", "rejection_reason", "created_at")

#     # def validate(self, attrs):
#     #     user = self.context["request"].user

#     #     # Only allow one application
#     #     if hasattr(user, "interviewer_application"):
#     #         raise serializers.ValidationError({
#     #         "code": "APPLICATION_EXISTS",
#     #         "message": "You have already submitted an interviewer application."
#     #     })

#     #     return attrs

#     def validate(self, attrs):
#         user = self.context["request"].user

#         # ✅ FIXED: Check if user can apply
#         existing_app = getattr(user, "interviewer_application", None)
#         if existing_app:
#             if existing_app.status == InterviewerApplication.STATUS_PENDING:
#                 raise serializers.ValidationError({
#                     "code": "APPLICATION_PENDING",
#                     "message": "You already have a pending application. Please wait for review."
#                 })
#             elif existing_app.status == InterviewerApplication.STATUS_APPROVED:
#                 raise serializers.ValidationError({
#                     "code": "ALREADY_APPROVED",
#                     "message": "You are already an approved interviewer."
#                 })
#             # ✅ ALLOW if REJECTED - user can reapply

#         return attrs









# ─── Application serializers ──────────────────────────────────────────────────

import re
import os
from django.utils.html import strip_tags

# ── Shared constants ──────────────────────────────────────────────────────────

VALID_TIMEZONES = {
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Seoul', 'Asia/Dhaka', 'Asia/Karachi',
    'Asia/Colombo', 'Asia/Kathmandu', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'Europe/Moscow', 'America/New_York', 'America/Chicago',
    'America/Denver', 'America/Los_Angeles', 'America/Toronto',
    'America/Vancouver', 'America/Sao_Paulo', 'Australia/Sydney',
    'Australia/Melbourne', 'Pacific/Auckland', 'Africa/Nairobi', 'UTC',
}

VALID_SPECIALIZATIONS = {
    'Frontend', 'Backend', 'Full Stack', 'Mobile',
    'Data Structures & Algorithms', 'System Design', 'DevOps', 'Data Science / ML',
}

RESUME_ALLOWED_EXTS   = {'pdf', 'doc', 'docx'}
CERT_ALLOWED_EXTS     = {'pdf', 'png', 'jpg', 'jpeg'}
ADDL_ALLOWED_EXTS     = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}
DANGEROUS_EXTS        = {'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'py', 'rb',
                         'zip', 'rar', 'tar', 'msi', 'dll', 'vbs'}

RESUME_ALLOWED_MIMES  = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}
CERT_ALLOWED_MIMES    = {'application/pdf', 'image/png', 'image/jpeg'}
ADDL_ALLOWED_MIMES    = RESUME_ALLOWED_MIMES | {'image/png', 'image/jpeg'}

MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_CERT_SIZE_BYTES   =  5 * 1024 * 1024   #  5 MB
MAX_ADDL_SIZE_BYTES   = 10 * 1024 * 1024   # 10 MB


def _get_ext(filename):
    _, ext = os.path.splitext(filename or '')
    return ext.lstrip('.').lower()


def _safe_text(value):
    """Strip HTML tags and whitespace."""
    if not value:
        return value
    return strip_tags(value).strip()


def _validate_phone(value):
    cleaned = (value or '').replace(' ', '')
    if cleaned.startswith('+91'):
        cleaned = cleaned[3:]
    elif cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    if not re.fullmatch(r'\d{10}', cleaned):
        raise serializers.ValidationError('Phone number must contain exactly 10 digits.')
    return value


def _validate_linkedin(value):
    if not re.match(r'^https?://(www\.)?linkedin\.com/in/[A-Za-z0-9_\-%.]+/?$', (value or '').strip()):
        raise serializers.ValidationError(
            'Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username).'
        )
    return value.strip()


def _validate_github(value):
    if not value or not value.strip():
        return value
    if not re.match(r'^https?://(www\.)?github\.com/[A-Za-z0-9_\-]+/?$', value.strip()):
        raise serializers.ValidationError(
            'Enter a valid GitHub profile URL (e.g. https://github.com/username).'
        )
    return value.strip()


def _validate_resume_file(file, *, required=True):
    if not file:
        if required:
            raise serializers.ValidationError('Resume is required.')
        return file
    ext = _get_ext(file.name)
    if ext in DANGEROUS_EXTS:
        raise serializers.ValidationError('This file type is not allowed.')
    if ext not in RESUME_ALLOWED_EXTS:
        raise serializers.ValidationError('Invalid file type. Accepted: PDF, DOC, DOCX.')
    if getattr(file, 'content_type', None) and file.content_type not in RESUME_ALLOWED_MIMES:
        raise serializers.ValidationError('Invalid file format.')
    if file.size > MAX_RESUME_SIZE_BYTES:
        raise serializers.ValidationError('Resume exceeds 10 MB limit.')
    return file


def _validate_cert_file(file):
    if not file:
        return file
    ext = _get_ext(file.name)
    if ext in DANGEROUS_EXTS:
        raise serializers.ValidationError('This file type is not allowed.')
    if ext not in CERT_ALLOWED_EXTS:
        raise serializers.ValidationError('Invalid format. Accepted: PDF, PNG, JPG, JPEG.')
    if getattr(file, 'content_type', None) and file.content_type not in CERT_ALLOWED_MIMES:
        raise serializers.ValidationError('Invalid file format.')
    if file.size > MAX_CERT_SIZE_BYTES:
        raise serializers.ValidationError('Certification file exceeds 5 MB limit.')
    return file


def _validate_addl_file(file):
    if not file:
        return file
    ext = _get_ext(file.name)
    if ext in DANGEROUS_EXTS:
        raise serializers.ValidationError('This file type is not allowed.')
    if ext not in ADDL_ALLOWED_EXTS:
        raise serializers.ValidationError('Invalid format. Accepted: PDF, DOC, DOCX, PNG, JPG, JPEG.')
    if getattr(file, 'content_type', None) and file.content_type not in ADDL_ALLOWED_MIMES:
        raise serializers.ValidationError('Invalid file format.')
    if file.size > MAX_ADDL_SIZE_BYTES:
        raise serializers.ValidationError('Document exceeds 10 MB limit.')
    return file


# ── Mixin — all shared field validators ──────────────────────────────────────

class ApplicationValidationMixin:
    """Field-level validators shared by both Create and Update serializers."""

    def validate_phone_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Phone number is required.')
        return _validate_phone(value)

    def validate_company_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Company name is required.')
        t = value.strip()
        if len(t) < 2 or len(t) > 100:
            raise serializers.ValidationError('Company name must be between 2 and 100 characters.')
        if not re.match(r"^[A-Za-z0-9\s&.,\-'()]+$", t):
            raise serializers.ValidationError('Enter a valid company name.')
        return t

    def validate_location(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Location is required.')
        t = value.strip()
        if len(t) < 2 or len(t) > 100:
            raise serializers.ValidationError('Enter a valid location (2–100 characters).')
        if not re.match(r'^[A-Za-z\s,\-]+$', t):
            raise serializers.ValidationError('Location can only contain letters, spaces, commas, and hyphens.')
        return t

    def validate_timezone(self, value):
        if not value or value not in VALID_TIMEZONES:
            raise serializers.ValidationError('Please select a valid timezone.')
        return value

    def validate_linkedin_url(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('LinkedIn profile URL is required.')
        return _validate_linkedin(value)

    def validate_github_url(self, value):
        return _validate_github(value)

    def validate_years_of_experience(self, value):
        if value is None:
            raise serializers.ValidationError('Professional experience is required.')
        try:
            n = float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Enter a valid experience value.')
        if n < 1:
            raise serializers.ValidationError('Minimum 1 year of professional experience required.')
        if n > 50:
            raise serializers.ValidationError('Experience must be between 1 and 50 years.')
        return value

    def validate_specializations(self, value):
        if not isinstance(value, list) or len(value) == 0:
            raise serializers.ValidationError('Select at least one specialization.')
        if len(value) > 5:
            raise serializers.ValidationError('Maximum 5 specializations allowed.')
        invalid = set(value) - VALID_SPECIALIZATIONS
        if invalid:
            raise serializers.ValidationError(
                f'Invalid specialization(s): {", ".join(sorted(invalid))}.'
            )
        return value

    def validate_education(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Education details are required.')
        t = _safe_text(value)
        if len(t) < 10:
            raise serializers.ValidationError('Education must be at least 10 characters.')
        if len(t) > 200:
            raise serializers.ValidationError('Education must not exceed 200 characters.')
        return t

    def validate_languages(self, value):
        if not isinstance(value, list) or len(value) == 0:
            raise serializers.ValidationError('Select at least one language.')
        if len(value) > 10:
            raise serializers.ValidationError('Maximum 10 languages allowed.')
        return value

    def validate_expertise_summary(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Expertise summary is required.')
        t = _safe_text(value)
        if len(t) < 100:
            raise serializers.ValidationError(
                f'Expertise summary must be at least 100 characters ({len(t)} provided).'
            )
        if len(t) > 2000:
            raise serializers.ValidationError('Expertise summary must not exceed 2000 characters.')
        return t

    def validate_motivation(self, value):
        if not value:
            return value
        t = _safe_text(value)
        if len(t) > 1000:
            raise serializers.ValidationError('Motivation response must not exceed 1000 characters.')
        return t

    def validate_certifications(self, value):
        return _validate_cert_file(value)

    def validate_additional_docs(self, value):
        return _validate_addl_file(value)

    def validate(self, attrs):
        """Cross-field: interview experience cannot exceed professional experience."""
        yoe  = attrs.get('years_of_experience')
        yoie = attrs.get('years_of_interview_experience')
        if yoe is not None and yoie is not None:
            try:
                if float(yoie) > float(yoe):
                    raise serializers.ValidationError({
                        'years_of_interview_experience':
                            'Interview experience cannot exceed professional experience.'
                    })
            except (TypeError, ValueError):
                pass
        return attrs


# ─── Create serializer ────────────────────────────────────────────────────────

class InterviewerApplicationCreateSerializer(ApplicationValidationMixin, serializers.ModelSerializer):
    """
    Used when a user submits their FIRST application.
    Resume is required.
    """

    specializations = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )

    class Meta:
        model  = InterviewerApplication
        exclude = (
            "user", "status", "reviewed_at", "reviewed_by",
            "rejection_reason", "created_at",
        )

    def validate_resume(self, value):
        return _validate_resume_file(value, required=True)

    def validate(self, attrs):
        # Duplicate / eligibility check
        user         = self.context["request"].user
        existing_app = getattr(user, "interviewer_application", None)

        if existing_app:
            if existing_app.status == InterviewerApplication.STATUS_PENDING:
                raise serializers.ValidationError({
                    "non_field_errors": "You already have a pending application. Please wait for review.",
                })
            elif existing_app.status == InterviewerApplication.STATUS_APPROVED:
                raise serializers.ValidationError({
                    "non_field_errors": "You are already an approved interviewer.",
                })

        # Cross-field validation from mixin
        return super().validate(attrs)


# ─── Update (re-apply) serializer ────────────────────────────────────────────

class InterviewerApplicationUpdateSerializer(ApplicationValidationMixin, serializers.ModelSerializer):
    """
    Used when a REJECTED applicant re-submits their application.
    File fields are optional — if omitted, backend keeps the existing file.
    """

    specializations = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )

    # Override file fields to make them optional on update
    resume          = serializers.FileField(required=False, allow_null=True)
    certifications  = serializers.FileField(required=False, allow_null=True)
    additional_docs = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model  = InterviewerApplication
        exclude = (
            "user", "status", "reviewed_at", "reviewed_by",
            "rejection_reason", "created_at",
        )

    def validate_resume(self, value):
        # Resume is optional on update (existing file retained if not supplied)
        return _validate_resume_file(value, required=False)

    def update(self, instance, validated_data):
        # Only replace a file field if a new file was actually sent
        for file_field in ("resume", "certifications", "additional_docs"):
            if file_field not in validated_data or validated_data[file_field] is None:
                validated_data.pop(file_field, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Reset admin-review state
        instance.status           = InterviewerApplication.STATUS_PENDING
        instance.rejection_reason = ""
        instance.reviewed_at      = None
        instance.reviewed_by      = None

        instance.save()
        return instance


class InterviewerApplicationReadSerializer(serializers.ModelSerializer):
    """
    Read-only serializer — returns existing application data for pre-populating
    the re-apply form. File fields return the URL/path, not the file object.
    """

    specializations = serializers.ListField(child=serializers.CharField())
    languages       = serializers.ListField(child=serializers.CharField())

    class Meta:
        model  = InterviewerApplication
        fields = (
            "id",
            "phone_number",
            "location",
            "timezone",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "company_name",
            "years_of_experience",
            "years_of_interview_experience",
            "specializations",
            "languages",
            "education",
            "expertise_summary",
            "motivation",
            "resume",
            "certifications",
            "additional_docs",
            "status",
            "rejection_reason",
            "created_at",
        )


















class InterviewerApplicationAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = InterviewerApplication
        fields = "__all__"





class InterviewerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerProfile
        fields = [
            "id",
            "display_name",
            "headline",
            "bio",
            "profile_picture",
            "years_of_experience",
            "location",
            "timezone",
            "base_session_rate",
            "specializations",
            "languages",
            "education",
            "certifications",
            "industries",
            "supported_interview_types",
            "supported_experience_levels",
            "is_profile_public",
            "is_accepting_bookings",
            "is_completed",
            "onboarding_step",
        ]

    def validate_specializations(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Specializations must be a list.")
        return value

    def validate_languages(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list.")
        return value

    def validate_supported_interview_types(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list.")
        invalid = set(value) - InterviewerProfile.VALID_INTERVIEW_TYPES
        if invalid:
            raise serializers.ValidationError(
                f"Invalid interview types: {sorted(invalid)}. "
                f"Valid values: {sorted(InterviewerProfile.VALID_INTERVIEW_TYPES)}"
            )
        return value

    def validate_supported_experience_levels(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list.")
        invalid = set(value) - InterviewerProfile.VALID_EXPERIENCE_LEVELS
        if invalid:
            raise serializers.ValidationError(
                f"Invalid experience levels: {sorted(invalid)}. "
                f"Valid values: {sorted(InterviewerProfile.VALID_EXPERIENCE_LEVELS)}"
            )
        return value



class InterviewerAvailabilityCreateSerializer(serializers.ModelSerializer):
    VALID_DURATIONS = [30, 45, 60, 90]

    duration_minutes = serializers.ChoiceField(
        choices=InterviewerAvailability.DURATION_CHOICES,
        help_text="Session duration: 30, 45, 60, or 90 minutes."
    )

    class Meta:
        model = InterviewerAvailability
        fields = [
            "date",
            "start_time",
            "duration_minutes",
            "timezone",
            "is_recurring",
            "recurrence_type",
            "recurrence_end_date",
        ]

    def validate_duration_minutes(self, value):
        if value not in self.VALID_DURATIONS:
            raise serializers.ValidationError(
                f"Duration must be one of {self.VALID_DURATIONS} minutes."
            )
        return value

    def validate(self, attrs):
        from datetime import datetime, timedelta

        # Calculate end_time on the backend from start_time + duration_minutes
        start_time = attrs.get("start_time")
        duration = attrs.get("duration_minutes")
        if start_time and duration:
            start_dt = datetime.combine(datetime.today(), start_time)
            end_dt = start_dt + timedelta(minutes=duration)
            attrs["end_time"] = end_dt.time()

        if attrs.get("is_recurring"):
            if not attrs.get("recurrence_type"):
                raise serializers.ValidationError(
                    "recurrence_type is required for recurring availability."
                )
            if not attrs.get("recurrence_end_date"):
                raise serializers.ValidationError(
                    "recurrence_end_date is required for recurring availability."
                )

        return attrs
    





class InterviewerVerificationSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerVerification
        fields = [
            "document_type",
            "document_number",
            "document_file",
        ]

    def validate(self, attrs):
        user = self.context["request"].user

        if hasattr(user, "verification"):
            status = user.verification.status
            if status == VerificationStatus.PENDING:
                raise serializers.ValidationError(
                    "Your verification is already under review."
                )
            if status == VerificationStatus.APPROVED:
                raise serializers.ValidationError(
                    "Your document is already verified."
                )

        return attrs



class InterviewerVerificationDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = InterviewerVerification
        fields = "__all__"






class InterviewerProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerProfile
        fields = ["profile_picture"]

    def validate_profile_picture(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image too large (max 5MB).")
        return value  

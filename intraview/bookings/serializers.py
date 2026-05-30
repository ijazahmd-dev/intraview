from rest_framework import serializers
from django.utils import timezone as django_timezone
from django.utils import timezone
from datetime import datetime, timedelta
from authentication.models import CustomUser
from interviewers.models import InterviewerAvailability,InterviewerProfile
from .models import InterviewBooking, RescheduleStatus

from wallet.models import TokenTransaction, TokenTransactionType
from feedbacks.models import CandidateEvaluation
from subscriptions.services.entitlement_service import SubscriptionEntitlementService



class CandidateInterviewerListSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(
        source="interviewer_profile.display_name"
    )
    headline = serializers.CharField(
        source="interviewer_profile.headline"
    )
    years_of_experience = serializers.IntegerField(
        source="interviewer_profile.years_of_experience"
    )
    profile_picture = serializers.ImageField(
        source="interviewer_profile.profile_picture"
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "display_name",
            "headline",
            "years_of_experience",
            "profile_picture",
        ]



class CandidateAvailabilitySerializer(serializers.ModelSerializer):
    start_datetime = serializers.SerializerMethodField()
    end_datetime = serializers.SerializerMethodField()
    remaining_capacity = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    token_cost = serializers.SerializerMethodField()

    class Meta:
        model = InterviewerAvailability
        fields = [
            "id", "title", "date", "start_time", "end_time", 
            "start_datetime", "end_datetime",
            "remaining_capacity", "timezone", "duration_minutes", "token_cost",
        ]

    def get_start_datetime(self, obj):
        """Fixed: Use django_timezone.make_aware"""
        dt = django_timezone.make_aware(datetime.combine(obj.date, obj.start_time))
        return dt.isoformat()

    def get_end_datetime(self, obj):
        """Fixed: Use django_timezone.make_aware"""
        dt = django_timezone.make_aware(datetime.combine(obj.date, obj.end_time))
        return dt.isoformat()

    def get_remaining_capacity(self, obj):
        return obj.remaining_capacity()

    def get_title(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')} ({obj.duration_minutes}min)"

    def get_token_cost(self, obj):
        try:
            base_rate = obj.interviewer.interviewer_profile.base_session_rate
            return obj.token_cost_for(base_rate)
        except Exception:
            return None





class CandidateInterviewerDetailSerializer(serializers.ModelSerializer):
    interviewer_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    verification_status = serializers.CharField(
        source="user.verification.status",
        read_only=True
    )

    class Meta:
        model = InterviewerProfile
        fields = [
            "interviewer_id",
            "email",

            # core
            "display_name",
            "headline",
            "bio",
            "profile_picture",
            "years_of_experience",
            "location",
            "timezone",

            # pricing
            "base_session_rate",

            # tags
            "specializations",
            "languages",
            "education",
            "certifications",
            "industries",

            # session configuration options (for booking UI)
            "supported_interview_types",
            "supported_experience_levels",

            # public flags
            "is_profile_public",
            "is_accepting_bookings",

            # verification
            "verification_status",

            # timestamps (optional but useful)
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields









class CreateInterviewBookingSerializer(serializers.Serializer):

    availability_id = serializers.IntegerField()

    # ─── Session Configuration Fields ────────────────────────────────────────────
    interview_type = serializers.ChoiceField(
        choices=InterviewBooking.InterviewType.choices,
        required=False,
        allow_blank=True,
        default="",
        help_text="Must be one of the interviewer's supported_interview_types.",
    )
    difficulty_level = serializers.ChoiceField(
        choices=InterviewBooking.DifficultyLevel.choices,
        required=False,
        allow_blank=True,
        default="",
        help_text="Must be one of the interviewer's supported_experience_levels.",
    )
    candidate_goal = serializers.ChoiceField(
        choices=InterviewBooking.CandidateGoal.choices,
        required=False,
        allow_blank=True,
        default="",
    )
    candidate_notes = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional preparation notes from candidate.",
    )
    selected_specialties = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
        help_text="Must be a subset of the interviewer's specializations.",
    )

    def validate_availability_id(self, value):
        try:
            availability = InterviewerAvailability.objects.select_related(
                "interviewer__interviewer_profile"
            ).get(id=value, is_active=True)
        except InterviewerAvailability.DoesNotExist:
            raise serializers.ValidationError("Availability not found.")
        return availability

    def validate(self, attrs):
        availability = attrs.get("availability_id")  # already the object
        if not availability:
            return attrs

        try:
            profile = availability.interviewer.interviewer_profile
        except Exception:
            return attrs  # profile may not exist yet (edge case)

        interview_type     = attrs.get("interview_type", "")
        difficulty_level   = attrs.get("difficulty_level", "")
        selected_specialties = attrs.get("selected_specialties", [])

        # ─── Interview Type ──────────────────────────────────────────────────
        if interview_type and profile.supported_interview_types:
            if interview_type not in profile.supported_interview_types:
                raise serializers.ValidationError({
                    "interview_type": (
                        f"This interviewer does not support '{interview_type}'. "
                        f"Supported types: {profile.supported_interview_types}"
                    )
                })

        # ─── Difficulty Level ────────────────────────────────────────────────
        if difficulty_level and profile.supported_experience_levels:
            if difficulty_level not in profile.supported_experience_levels:
                raise serializers.ValidationError({
                    "difficulty_level": (
                        f"This interviewer does not support level '{difficulty_level}'. "
                        f"Supported levels: {profile.supported_experience_levels}"
                    )
                })

        # ─── Selected Specialties ──────────────────────────────────────────────
        if selected_specialties and profile.specializations:
            # Normalize both sides to lowercase for case-insensitive comparison
            interviewer_specs_lower = {s.lower() for s in profile.specializations}
            invalid = [
                s for s in selected_specialties
                if s.lower() not in interviewer_specs_lower
            ]
            if invalid:
                raise serializers.ValidationError({
                    "selected_specialties": (
                        f"The following specialties are not supported by this interviewer: {invalid}. "
                        f"Available: {profile.specializations}"
                    )
                })

        return attrs
    


class CandidateUpcomingInterviewSerializer(serializers.ModelSerializer):
    interviewer_name = serializers.CharField(
        source="interviewer.interviewer_profile.display_name"
    )
    date = serializers.DateField(source="availability.date")
    start_time = serializers.TimeField(source="availability.start_time")
    end_time = serializers.TimeField(source="availability.end_time")
    

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "interviewer_name",
            "date",
            "start_time",
            "end_time",
            "token_cost",
            # session config
            "interview_type",
            "difficulty_level",
            "candidate_goal",
            "candidate_notes",
            "selected_specialties",
        ]





class CandidatePastInterviewSerializer(serializers.ModelSerializer):
    interviewer_name = serializers.CharField(source="interviewer.interviewer_profile.display_name")
    date = serializers.DateField(source="availability.date")
    start_time = serializers.TimeField(source="availability.start_time")
    end_time = serializers.TimeField(source="availability.end_time")

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "interviewer_name",
            "date",
            "start_time",
            "end_time",
            "status",
            "token_cost",
            # session config
            "interview_type",
            "difficulty_level",
            "candidate_goal",
            "candidate_notes",
            "selected_specialties",
        ]





class BookingDetailSerializer(serializers.ModelSerializer):
    interviewer_id       = serializers.IntegerField(source="interviewer.id", read_only=True)
    interviewer_name     = serializers.SerializerMethodField()
    interviewer_headline = serializers.SerializerMethodField()

    candidate_id    = serializers.IntegerField(source="candidate.id", read_only=True)
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)

    start_time = serializers.SerializerMethodField()
    end_time   = serializers.SerializerMethodField()

    # Reschedule fields
    reschedule_status = serializers.CharField(read_only=True)
    reschedule_note   = serializers.CharField(source="reschedule_reason", read_only=True)
    reschedule_count  = serializers.IntegerField(read_only=True)
    proposed_slot     = serializers.SerializerMethodField()

    # Feedback link — null if no evaluation exists yet
    feedback_evaluation_id = serializers.SerializerMethodField()

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "status",
            "token_cost",

            "start_datetime",
            "end_datetime",
            "start_time",
            "end_time",

            "cancellation_reason",
            "cancelled_at",

            "candidate_id",
            "candidate_email",

            "interviewer_id",
            "interviewer_name",
            "interviewer_headline",

            # reschedule
            "reschedule_status",
            "reschedule_note",
            "reschedule_count",
            "proposed_slot",

            # feedback
            "feedback_evaluation_id",

            # session configuration
            "interview_type",
            "difficulty_level",
            "candidate_goal",
            "candidate_notes",
            "selected_specialties",

            "created_at",
            "updated_at",
        ]

    def get_interviewer_name(self, obj):
        try:
            return obj.interviewer.interviewer_profile.display_name or ""
        except Exception:
            return ""

    def get_interviewer_headline(self, obj):
        try:
            return obj.interviewer.interviewer_profile.headline or ""
        except Exception:
            return ""

    def get_start_time(self, obj):
        if obj.start_datetime:
            return timezone.localtime(obj.start_datetime).strftime("%H:%M:%S")
        return None

    def get_end_time(self, obj):
        if obj.end_datetime:
            return timezone.localtime(obj.end_datetime).strftime("%H:%M:%S")
        return None

    def get_proposed_slot(self, obj):
        slot = obj.proposed_availability
        if not slot:
            return None
        return {
            "id":         slot.id,
            "date":       str(slot.date),
            "start_time": slot.start_time.strftime("%H:%M:%S"),
            "end_time":   slot.end_time.strftime("%H:%M:%S"),
        }

    def get_feedback_evaluation_id(self, obj):
        try:
            return obj.candidate_evaluation.id
        except CandidateEvaluation.DoesNotExist:
            return None
        





class CandidateRescheduleSerializer(serializers.Serializer):
    new_availability_id = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(max_length=500, allow_blank=True, required=False)

    def validate(self, attrs):
        booking = self.context["booking"]
        new_id = attrs["new_availability_id"]

        # ✅ Get new availability
        try:
            new_avail = InterviewerAvailability.objects.get(
                id=new_id,
                interviewer=booking.availability.interviewer,  # Same interviewer
                is_active=True,
            )
        except InterviewerAvailability.DoesNotExist:
            raise serializers.ValidationError(
                {"new_availability_id": "Availability not found or inactive."}
            )

        # ❌ Cannot reschedule to same slot
        if new_avail.id == booking.availability.id:
            raise serializers.ValidationError(
                {"new_availability_id": "Cannot reschedule to the same slot."}
            )

        # ✅ Capacity check
        if new_avail.remaining_capacity() <= 0:
            raise serializers.ValidationError(
                {"new_availability_id": "Selected slot is already full."}
            )

        # ✅ Future slot (CORRECT timezone handling)
        new_start_naive = datetime.combine(new_avail.date, new_avail.start_time)
        new_start_aware = timezone.make_aware(new_start_naive)  # Django TZ
        if new_start_aware <= timezone.now():
            raise serializers.ValidationError(
                {"new_availability_id": "Can only reschedule to future slots."}
            )

        # ✅ ADD TO ATTRS (fixes validated_data access)
        attrs["new_availability"] = new_avail
        return attrs
    






############################################### Interviewer Serializers ##############################################

class InterviewerCancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(
        min_length=10,
        max_length=500,
        help_text="Reason for cancelling the interview"
    )




# class InterviewerUpcomingSerializer(serializers.ModelSerializer):
#     candidate_email = serializers.EmailField(source="candidate.email")
#     date = serializers.DateField(source="availability.date")
#     start_time = serializers.TimeField(source="availability.start_time", read_only=True)
#     end_time = serializers.TimeField(source="availability.end_time", read_only=True)
    

#     class Meta:
#         model = InterviewBooking
#         fields = [
#             "id",
#             "candidate_email",
#             "date",
#             "start_time",
#             "end_time",
#             "status",
#             "token_cost",
#         ]






class InterviewerBookingDetailSerializer(serializers.ModelSerializer):
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)

    # Availability snapshot
    date = serializers.DateField(source="availability.date", read_only=True)
    start_time = serializers.TimeField(source="availability.start_time", read_only=True)
    end_time = serializers.TimeField(source="availability.end_time", read_only=True)

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "status",
            "token_cost",
            "start_datetime",
            "end_datetime",
            "candidate_email",
            "date",
            "start_time",
            "end_time",
            "cancellation_reason",
            "cancelled_at",
            "created_at",
            # session config
            "interview_type",
            "difficulty_level",
            "candidate_goal",
            "candidate_notes",
            "selected_specialties",
        ]





class InterviewerCompletedSessionSerializer(serializers.ModelSerializer):
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)

    date = serializers.DateField(source="availability.date", read_only=True)
    start_time = serializers.TimeField(source="availability.start_time", read_only=True)
    end_time = serializers.TimeField(source="availability.end_time", read_only=True)

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "candidate_email",
            "date",
            "start_time",
            "end_time",
            "status",
            "token_cost",
            "created_at",
        ]








class InterviewerRescheduleSerializer(serializers.Serializer):
    new_availability_id = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(max_length=500, allow_blank=True, required=False)

    def validate(self, attrs):
        booking = self.context["booking"]
        new_id = attrs["new_availability_id"]

        # ✅ Must be interviewer's own availability
        try:
            new_avail = InterviewerAvailability.objects.get(
                id=new_id,
                interviewer=booking.availability.interviewer,  # Must own it
                is_active=True,
            )
        except InterviewerAvailability.DoesNotExist:
            raise serializers.ValidationError(
                {"new_availability_id": "Availability not found or inactive."}
            )

   
        if new_avail.id == booking.availability.id:
            raise serializers.ValidationError(
                {"new_availability_id": "Cannot reschedule to the same slot."}
            )

        # ✅ Capacity check
        if new_avail.remaining_capacity() <= 0:
            raise serializers.ValidationError(
                {"new_availability_id": "Selected slot is already full."}
            )

        # ✅ Future slot only
        new_start_naive = datetime.combine(new_avail.date, new_avail.start_time)
        new_start_aware = timezone.make_aware(new_start_naive)
        if new_start_aware <= timezone.now():
            raise serializers.ValidationError(
                {"new_availability_id": "Can only reschedule to future slots."}
            )

        attrs["new_availability"] = new_avail
        return attrs










############################################### Interviewer Serializers  End ##############################################








############################################### Admin Serializers   ##############################################



class AdminInterviewBookingSerializer(serializers.ModelSerializer):
    candidate_email = serializers.EmailField(
        source="candidate.email", read_only=True
    )
    interviewer_email = serializers.EmailField(
        source="interviewer.email", read_only=True
    )

    availability_date = serializers.DateField(
        source="availability.date", read_only=True
    )
    availability_start = serializers.TimeField(
        source="availability.start_time", read_only=True
    )
    availability_end = serializers.TimeField(
        source="availability.end_time", read_only=True
    )

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "candidate_email",
            "interviewer_email",
            "availability_date",
            "availability_start",
            "availability_end",
            "status",
            "token_cost",
            "cancellation_reason",
            "created_at",
            "cancelled_at",
        ]
        read_only_fields = fields







class AdminBookingDetailSerializer(serializers.ModelSerializer):
    # Candidate
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    candidate_token_balance = serializers.IntegerField(
        source="candidate.token_balance", read_only=True
    )

    # Interviewer
    interviewer_email = serializers.EmailField(
        source="interviewer.email", read_only=True
    )
    interviewer_verification_status = serializers.CharField(
        source="interviewer.verification.status", read_only=True
    )
    interviewer_has_subscription = serializers.SerializerMethodField()

    # Availability
    date = serializers.DateField(source="availability.date", read_only=True)
    start_time = serializers.TimeField(source="availability.start_time", read_only=True)
    end_time = serializers.TimeField(source="availability.end_time", read_only=True)
    timezone = serializers.CharField(source="availability.timezone", read_only=True)
    max_bookings = serializers.IntegerField(
        source="availability.max_bookings", read_only=True
    )

    # Token audit
    token_lock_tx = serializers.SerializerMethodField()
    token_unlock_tx = serializers.SerializerMethodField()
    token_transfer_tx = serializers.SerializerMethodField()

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "status",
            "created_at",
            "cancelled_at",
            "cancellation_reason",
            "token_cost",
            # Candidate
            "candidate_email",
            "candidate_token_balance",
            # Interviewer
            "interviewer_email",
            "interviewer_verification_status",
            "interviewer_has_subscription",
            # Availability
            "date",
            "start_time",
            "end_time",
            "timezone",
            "max_bookings",
            # Token audit
            "token_lock_tx",
            "token_unlock_tx",
            "token_transfer_tx",
        ]

    def get_interviewer_has_subscription(self, obj):
        return SubscriptionEntitlementService.has_subscription(obj.interviewer)

    def _get_tx(self, obj, tx_type):
        tx = (
            TokenTransaction.objects
            .filter(
                reference_id=f"booking_{obj.id}",
                transaction_type=tx_type,
            )
            .order_by("-created_at")
            .first()
        )
        if not tx:
            return None
        return {
            "id": tx.id,
            "amount": tx.amount,
            "created_at": tx.created_at,
        }

    def get_token_lock_tx(self, obj):
        return self._get_tx(obj, TokenTransactionType.BOOKING_LOCK)

    def get_token_unlock_tx(self, obj):
        return self._get_tx(obj, TokenTransactionType.BOOKING_RELEASE)

    def get_token_transfer_tx(self, obj):
        return self._get_tx(obj, TokenTransactionType.SESSION_EARN)
    



























from interviewers.models import InterviewerAvailability
 
 
# ─── Reschedule options (read-only, returned to candidate) ───────────────────
 
class AvailableSlotSerializer(serializers.ModelSerializer):
    """Single availability slot returned in the reschedule options list."""
    remaining_capacity = serializers.SerializerMethodField()
    start_datetime     = serializers.SerializerMethodField()
    end_datetime       = serializers.SerializerMethodField()
 
    class Meta:
        model  = InterviewerAvailability
        fields = [
            "id", "date", "start_time", "end_time",
            "timezone", "remaining_capacity",
            "start_datetime", "end_datetime",
            "duration_minutes",
        ]
 
    def get_remaining_capacity(self, obj):
        return obj.remaining_capacity()
 
    def get_start_datetime(self, obj):
        dt = timezone.make_aware(datetime.combine(obj.date, obj.start_time))
        return dt.isoformat()
 
    def get_end_datetime(self, obj):
        dt = timezone.make_aware(datetime.combine(obj.date, obj.end_time))
        return dt.isoformat()
 
 
# ─── Reschedule request (submitted by candidate) ─────────────────────────────
 
RESCHEDULE_LIMIT          = 2      # max successful reschedules per booking
RESCHEDULE_MIN_HOURS_AHEAD = 2     # cannot request within 2 h of session start
 
 
class RescheduleRequestSerializer(serializers.Serializer):
    """
    Validates a candidate's reschedule request.
 
    proposed_availability_id  — ID of the desired slot (null = no slot / open preference)
    note                      — optional message to the interviewer
    """
    proposed_availability_id = serializers.IntegerField(
        min_value=1,
        required=True,
        allow_null=False,
        help_text="elect one of the available slots for rescheduling.",
    )
    note = serializers.CharField(
        max_length=500,
        allow_blank=True,
        required=False,
        default="",
    )
 
    def validate(self, attrs):
        booking = self.context["booking"]
        now     = timezone.now()
 
        # ── 1. Booking status must allow reschedule ───────────────────────────
        if booking.status not in [
            InterviewBooking.Status.PENDING,
            InterviewBooking.Status.CONFIRMED,
        ]:
            raise serializers.ValidationError(
                "Reschedule is only allowed for PENDING or CONFIRMED bookings."
            )
 
        # ── 2. No existing pending request ───────────────────────────────────
        if booking.reschedule_status == RescheduleStatus.PENDING:
            raise serializers.ValidationError(
                "A reschedule request is already pending. "
                "Wait for the interviewer to respond."
            )
 
        # ── 3. Reschedule limit ───────────────────────────────────────────────
        if booking.reschedule_count >= RESCHEDULE_LIMIT:
            raise serializers.ValidationError(
                f"Maximum of {RESCHEDULE_LIMIT} reschedules per booking reached."
            )
 
        # ── 4. Time restriction ───────────────────────────────────────────────
        if booking.start_datetime - now < timedelta(hours=RESCHEDULE_MIN_HOURS_AHEAD):
            raise serializers.ValidationError(
                f"Cannot request reschedule within "
                f"{RESCHEDULE_MIN_HOURS_AHEAD} hours of the session."
            )
 
        # ── 5. Slot validation (only when a slot is provided) ─────────────────
        slot_id = attrs.get("proposed_availability_id")

        try:
            slot = InterviewerAvailability.objects.get(
                id=slot_id,
                interviewer=booking.interviewer,
                is_active=True,
            )
        except InterviewerAvailability.DoesNotExist:
            raise serializers.ValidationError(
                {"proposed_availability_id":
                    "Slot not found, inactive, or belongs to a different interviewer."}
            )

        # Cannot propose the current slot
        if slot.id == booking.availability_id:
            raise serializers.ValidationError(
                {"proposed_availability_id":
                    "Cannot propose the same slot the booking is already on."}
            )

        # Slot must have capacity
        if slot.remaining_capacity() <= 0:
            raise serializers.ValidationError(
                {"proposed_availability_id": "Selected slot is already full."}
            )

        # Slot must be in the future
        slot_start = timezone.make_aware(
            datetime.combine(slot.date, slot.start_time)
        )
        if slot_start <= now:
            raise serializers.ValidationError(
                {"proposed_availability_id":
                    "Proposed slot must be in the future."}
            )

        attrs["proposed_availability"] = slot

 
        return attrs
 
 
# ─── Updated InterviewerUpcomingSerializer ───────────────────────────────────
# Replace your existing InterviewerUpcomingSerializer with this one.
# Added: candidate_name, reschedule_status, proposed_slot, reschedule_note
# so the interviewer can see and act on pending requests.
 
class ProposedSlotSerializer(serializers.ModelSerializer):
    """Minimal slot info shown in the interviewer's pending-request view."""
    start_datetime = serializers.SerializerMethodField()
    end_datetime   = serializers.SerializerMethodField()
 
    class Meta:
        model  = InterviewerAvailability
        fields = ["id", "date", "start_time", "end_time",
                  "timezone", "start_datetime", "end_datetime"]
 
    def get_start_datetime(self, obj):
        return timezone.make_aware(
            datetime.combine(obj.date, obj.start_time)
        ).isoformat()
 
    def get_end_datetime(self, obj):
        return timezone.make_aware(
            datetime.combine(obj.date, obj.end_time)
        ).isoformat()
 
 
class InterviewerUpcomingSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(source="candidate.email")
    date       = serializers.DateField(source="availability.date")
    start_time = serializers.TimeField(source="availability.start_time", read_only=True)
    end_time   = serializers.TimeField(source="availability.end_time",   read_only=True)
 
    # Reschedule request info
    reschedule_status   = serializers.CharField(read_only=True)
    proposed_slot       = serializers.SerializerMethodField()
    reschedule_note     = serializers.CharField(source="reschedule_reason", read_only=True)
    reschedule_requested_by = serializers.CharField(source="rescheduled_by", read_only=True)
 
    class Meta:
        model  = InterviewBooking
        fields = [
            "id",
            "candidate_name",
            "candidate_email",
            "date",
            "start_time",
            "end_time",
            "start_datetime",
            "end_datetime",
            "status",
            "token_cost",
            # reschedule
            "reschedule_status",
            "proposed_slot",
            "reschedule_note",
            "reschedule_requested_by",
            # session config
            "interview_type",
            "difficulty_level",
            "candidate_goal",
            "candidate_notes",
            "selected_specialties",
        ]
 
    def get_candidate_name(self, obj):
        return (
            f"{obj.candidate.first_name} {obj.candidate.last_name}".strip()
            or obj.candidate.email
        )
 
    def get_proposed_slot(self, obj):
        if obj.proposed_availability:
            return ProposedSlotSerializer(obj.proposed_availability).data
        return None
    









class NotifyInterviewerNewSlotSerializer(serializers.Serializer):
    preferred_window = serializers.CharField(
        max_length=200,
        allow_blank=False,
        help_text="Describe the time you prefer, e.g. 'tomorrow evening' or 'between 6–9 PM IST'.",
    )
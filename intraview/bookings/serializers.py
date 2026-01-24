from rest_framework import serializers
from django.utils import timezone as django_timezone
from django.utils import timezone
from datetime import datetime
from authentication.models import CustomUser
from interviewers.models import InterviewerAvailability,InterviewerProfile
from .models import InterviewBooking

from wallet.models import TokenTransaction, TokenTransactionType
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

    class Meta:
        model = InterviewerAvailability
        fields = [
            "id", "title", "start_datetime", "end_datetime", 
            "remaining_capacity", "timezone"
        ]

    def get_start_datetime(self, obj):
        """✅ FIXED: Use django_timezone.make_aware"""
        dt = django_timezone.make_aware(datetime.combine(obj.date, obj.start_time))
        return dt.isoformat()

    def get_end_datetime(self, obj):
        """✅ FIXED: Use django_timezone.make_aware"""
        dt = django_timezone.make_aware(datetime.combine(obj.date, obj.end_time))
        return dt.isoformat()

    def get_remaining_capacity(self, obj):
        return obj.remaining_capacity()

    def get_title(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"





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

            # tags
            "specializations",
            "languages",
            "education",
            "certifications",
            "industries",

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

    def validate_availability_id(self, value):
        try:
            availability = InterviewerAvailability.objects.get(
                id=value,
                is_active=True
            )
        except InterviewerAvailability.DoesNotExist :
            raise serializers.ValidationError("Availability not found.")

        return availability 
    



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
        ]






class BookingDetailSerializer(serializers.ModelSerializer):
    interviewer_id = serializers.IntegerField(source="interviewer.id", read_only=True)
    interviewer_name = serializers.CharField(
        source="interviewer.interviewer_profile.display_name",
        read_only=True,
        default=""
    )

    candidate_id = serializers.IntegerField(source="candidate.id", read_only=True)
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)

    class Meta:
        model = InterviewBooking
        fields = [
            "id",
            "status",
            "token_cost",

            "start_datetime",
            "end_datetime",

            "cancellation_reason",
            "cancelled_at",

            "candidate_id",
            "candidate_email",

            "interviewer_id",
            "interviewer_name",

            "created_at",
            "updated_at",
        ]

        
    


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




class InterviewerUpcomingSerializer(serializers.ModelSerializer):
    candidate_email = serializers.EmailField(source="candidate.email")
    date = serializers.DateField(source="availability.date")
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
        ]






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
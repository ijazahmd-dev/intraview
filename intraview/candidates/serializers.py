from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import InterviewType
from rest_framework.exceptions import ValidationError
import re
from django.utils.html import strip_tags

from .models import CandidateProfile



User = get_user_model()





# ============================================
# 1️⃣ BASIC CANDIDATE PROFILE SERIALIZER
# ============================================
class BasicCandidateProfileSerializer(serializers.ModelSerializer):
    """Minimal profile for list views / summaries"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_profile_picture = serializers.CharField(
        source='user.profile_picture_url', 
        read_only=True
    )
    
    class Meta:
        model = CandidateProfile
        fields = [
            'id',
            'user_id',
            'user_email',
            'user_profile_picture',
            'full_name',
            'target_role',
            'profile_completion',
            'interviews_completed'
        ]
        read_only_fields = fields









# ============================================
# 2️⃣ DETAILED CANDIDATE PROFILE SERIALIZER
# ============================================
class DetailedCandidateProfileSerializer(serializers.ModelSerializer):
    """Full profile with all details"""

    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_profile_picture = serializers.CharField(
        source='user.profile_picture_url',
        read_only=True
    )
    joined_at = serializers.DateTimeField(source='user.date_joined', read_only=True)

    experience_level_display = serializers.CharField(
        source='get_experience_level_display',
        read_only=True
    )
    preferred_difficulty_display = serializers.CharField(
        source='get_preferred_difficulty_display',
        read_only=True
    )

    class Meta:
        model = CandidateProfile
        fields = [
            # Identity
            'id',
            'user_id',
            'user_email',
            'user_first_name',
            'user_last_name',
            'user_profile_picture',
            'joined_at',
            'full_name',
            'headline',
            'bio',
            'phone',
            'location',
            'timezone',

            # Career
            'current_status',
            'current_role',
            'target_role',
            'experience_level',
            'experience_level_display',
            'years_experience',
            'skills',

            # Preferences
            'preferred_interview_types',
            'preferred_difficulty',
            'preferred_difficulty_display',
            'preferred_duration',
            'interviewer_notes',

            # Links
            'linkedin_url',
            'github_url',
            'portfolio_url',

            # Resume
            'resume_file',
            'resume_url',

            # Stats
            'profile_completion',
            'interviews_completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user_id',
            'user_email',
            'user_first_name',
            'user_last_name',
            'user_profile_picture',
            'joined_at',
            'profile_completion',
            'interviews_completed',
            'created_at',
            'updated_at',
        ]





# ============================================
# 3️⃣ PROFILE UPDATE SERIALIZER
# ============================================
class UpdateCandidateProfileSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(
        source='user.first_name', 
        required=False,
        allow_blank=True,
    )
    user_last_name = serializers.CharField(
        source='user.last_name', 
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = CandidateProfile
        fields = [
            'user_first_name',
            'user_last_name',
            'full_name',
            'headline',
            'bio',
            'phone',
            'location',
            'timezone',
            'current_status',
            'current_role',
            'target_role',
            'experience_level',
            'years_experience',
            'skills',
            'preferred_interview_types',
            'preferred_difficulty',
            'preferred_duration',
            'interviewer_notes',
            'linkedin_url',
            'github_url',
            'portfolio_url',
        ]

    def validate_user_first_name(self, value):
        if not value:
            raise ValidationError("First name is required")
        if len(value) < 2 or len(value) > 50:
            raise ValidationError("First name must be between 2 and 50 characters")
        if not re.match(r'^[A-Za-z\s]+$', value):
            raise ValidationError("First name must contain only letters and spaces")
        return value.strip()

    def validate_user_last_name(self, value):
        if value:
            if len(value) < 2 or len(value) > 50:
                raise ValidationError("Last name must be between 2 and 50 characters")
            if not re.match(r'^[A-Za-z\s]+$', value):
                raise ValidationError("Last name can only contain letters and spaces")
            return value.strip()
        return value

    def validate_full_name(self, value):
        if not value:
            raise ValidationError("Display name is required")
        value = value.strip()
        if len(value) < 3 or len(value) > 60:
            raise ValidationError("Display name must be between 3 and 60 characters")
        if not re.match(r'^[A-Za-z0-9\s]+$', value):
            raise ValidationError("Display name contains invalid characters")
        return value

    def validate_phone(self, value):
        if not value:
            raise ValidationError("Enter a valid phone number")
        value = value.replace(' ', '')
        test_val = value
        if test_val.startswith('+91'):
            test_val = test_val[3:]
        elif test_val.startswith('91') and len(test_val) == 12:
            test_val = test_val[2:]
            value = '+' + value
            
        if not re.match(r'^\d{10}$', test_val):
            raise ValidationError("Phone number must contain exactly 10 digits")
        return value

    def validate_location(self, value):
        if not value:
            raise ValidationError("Location is required")
        value = value.strip()
        if len(value) < 2 or len(value) > 100:
            raise ValidationError("Enter a valid location")
        if not re.match(r'^[A-Za-z\s,\-]+$', value):
            raise ValidationError("Location contains invalid characters")
        return value

    def validate_headline(self, value):
        if value:
            if len(value) > 150:
                raise ValidationError("Headline cannot exceed 150 characters")
            value = strip_tags(value)
        return value

    def validate_bio(self, value):
        if value:
            if len(value) > 1000:
                raise ValidationError("About me cannot exceed 1000 characters")
            value = strip_tags(value)
        return value

    def validate_current_role(self, value):
        if not value:
            raise ValidationError("Current role is required")
        if len(value) < 2 or len(value) > 100:
            raise ValidationError("Current role must be between 2 and 100 characters")
        return value

    def validate_target_role(self, value):
        if not value:
            raise ValidationError("Target role is required")
        if len(value) < 2 or len(value) > 100:
            raise ValidationError("Target role must be between 2 and 100 characters")
        return value

    def validate_years_experience(self, value):
        if value is None:
            raise ValidationError("Enter valid years of experience")
        if value < 0 or value > 50:
            raise ValidationError("Years of experience must be between 0 and 50")
        return value

    def validate_skills(self, value):
        if not value or not isinstance(value, list) or len(value) < 1:
            raise ValidationError("Add at least 1 skill")
        if len(value) > 20:
            raise ValidationError("Maximum 20 skills allowed")
        
        cleaned = []
        seen = set()
        for s in value:
            s = str(s).strip()
            if not s: continue
            if len(s) < 2 or len(s) > 50:
                raise ValidationError(f"Skill '{s}' must be between 2 and 50 characters")
            
            s_lower = s.lower()
            if s_lower in seen:
                raise ValidationError("Duplicate skills are not allowed")
            
            cleaned.append(s)
            seen.add(s_lower)
            
        if len(cleaned) < 1:
            raise ValidationError("Add at least 1 skill")
            
        return cleaned

    def validate_interviewer_notes(self, value):
        if value:
            if len(value) > 500:
                raise ValidationError("Notes cannot exceed 500 characters")
            value = strip_tags(value)
        return value

    def validate_linkedin_url(self, value):
        if value:
            if not value.startswith("https://"):
                raise ValidationError("Enter a valid LinkedIn profile URL")
            if not re.match(r'^https:\/\/(www\.)?linkedin\.com\/.*$', value):
                raise ValidationError("Enter a valid LinkedIn profile URL")
        return value

    def validate_github_url(self, value):
        if value:
            if not value.startswith("https://"):
                raise ValidationError("Enter a valid GitHub profile URL")
            if not re.match(r'^https:\/\/(www\.)?github\.com\/.*$', value):
                raise ValidationError("Enter a valid GitHub profile URL")
        return value

    def validate_portfolio_url(self, value):
        if value:
            if not value.startswith("https://"):
                raise ValidationError("Enter a valid website URL")
        return value

    def validate_preferred_interview_types(self, value):
        if not value or not isinstance(value, list) or len(value) == 0:
            raise ValidationError("Select at least one interview type")
        
        valid_types = [choice[0] for choice in InterviewType.choices]
        invalid = [v for v in value if v not in valid_types]
        if invalid:
            raise ValidationError("Invalid interview types selected")
        return value

    def validate_preferred_duration(self, value):
        if not value:
            raise ValidationError("Select interview duration")
        allowed_durations = [30, 45, 60]
        if value not in allowed_durations:
            raise ValidationError("Select interview duration")
        return value

    def update(self, instance, validated_data):
        user_data = {}
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
        
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance






# ============================================
# 4️⃣ RESUME SERIALIZER (DEDICATED)
# ============================================
class ResumeSerializer(serializers.ModelSerializer):
    """Dedicated serializer for resume operations"""
    
    resume_file_url = serializers.SerializerMethodField()
    has_resume = serializers.SerializerMethodField()
    upload_status = serializers.CharField(
        source='resume_upload_status',
        read_only=True
    )
    uploaded_at = serializers.DateTimeField(
        source='resume_uploaded_at',
        read_only=True
    )
    
    class Meta:
        model = CandidateProfile
        fields = [
            'id',
            'resume_file',
            'resume_file_url',
            'resume_url',
            'has_resume',
            'upload_status',
            'uploaded_at'
        ]
        read_only_fields = [
            'id',
            'has_resume',
            'resume_file_url',
            'upload_status',
            'uploaded_at'
        ]
    
    def get_resume_file_url(self, obj):
       
        if obj.resume_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
            return obj.resume_file.url
        return None
    
    def get_has_resume(self, obj):
        """Check if candidate has resume (file or URL)"""
        has_file = bool(obj.resume_file)
        has_url = bool((obj.resume_url or "").strip())
        return has_file or has_url
    
    def validate_resume_file(self, value):
        
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise ValidationError("Resume file size cannot exceed 5MB")
            
            #Check MIME type (not extension)
            if value.content_type != "application/pdf":
                raise ValidationError("Only PDF files are allowed")
        
        return value
    
    def validate_resume_url(self, value):

        if value and not value.startswith("https://"):
            raise ValidationError("Resume URL must start with https://")
        return value



             
        

    


# ============================================
# 5️⃣ PROFILE COMPLETION SERIALIZER
# ============================================
class ProfileCompletionSerializer(serializers.ModelSerializer):
    """Just for profile completion percentage"""
    
    completion_percentage = serializers.SerializerMethodField()
    missing_fields = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateProfile
        fields = ['completion_percentage', 'missing_fields']
        read_only_fields = fields
    
    def get_completion_percentage(self, obj):
        """Return completion as percentage"""
        return round(obj.profile_completion, 2)
    
    def get_missing_fields(self, obj):

        missing = []
        

        if not (obj.full_name or "").strip():
            missing.append("full_name")
        
        if not (obj.phone or "").strip():
            missing.append("phone")
        
        if not (obj.location or "").strip():
            missing.append("location")
        
        if not (obj.target_role or "").strip():
            missing.append("target_role")
        
        if not obj.experience_level:
            missing.append("experience_level")
        
        if obj.years_experience is None:
            missing.append("years_experience")
        
        if not obj.skills:
            missing.append("skills")
        
        has_resume = bool(obj.resume_file or (obj.resume_url or "").strip())
        if not has_resume:
            missing.append("resume")
        
        if not (obj.linkedin_url or "").strip():
            missing.append("linkedin_url")
        
        if not (obj.github_url or "").strip():
            missing.append("github_url")
        
        if not obj.preferred_interview_types:
            missing.append("preferred_interview_types")
        
        if not (obj.interviewer_notes or "").strip():
            missing.append("interviewer_notes")
        
        return missing    
    




# ============================================
# 6️⃣ NESTED USER SERIALIZER (for profile)
# ============================================
class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info in profile responses"""
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'username',
            'profile_picture_url'
        ]
        read_only_fields = fields
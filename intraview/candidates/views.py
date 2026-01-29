from django.shortcuts import render
import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone
from .models import CandidateProfile
from .serializers import (
    BasicCandidateProfileSerializer,
    DetailedCandidateProfileSerializer,
    UpdateCandidateProfileSerializer,
    ResumeSerializer,
    ProfileCompletionSerializer
)
from authentication.authentication import CookieJWTAuthentication

# Create your views here.


logger = logging.getLogger(__name__)


# ============================================
# 🔥 CANDIDATE PROFILE VIEWSET
# ============================================
class CandidateProfileViewSet(viewsets.ModelViewSet):
    """
    Complete candidate profile management.
    
    Endpoints:
    - GET    /api/candidate/profile/me/           → Current user profile
    - PATCH  /api/candidate/profile/me/           → Update profile
    - GET    /api/candidate/profile/completion/   → Profile completion %
    - POST   /api/candidate/profile/resume/upload/    → Upload resume (sync)
    - DELETE /api/candidate/profile/resume/delete/    → Delete resume
    - POST   /api/candidate/profile/picture/upload/   → Upload picture
    """
    
    queryset = CandidateProfile.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Route to correct serializer based on action"""
        if self.action == 'retrieve' or self.action == 'list':
            return BasicCandidateProfileSerializer
        elif self.action == 'me' or self.action == 'update_me':
            return DetailedCandidateProfileSerializer
        elif self.action == 'update':
            return UpdateCandidateProfileSerializer
        elif self.action in ['upload_resume', 'resume_status', 'delete_resume']:
            return ResumeSerializer
        elif self.action == 'completion':
            return ProfileCompletionSerializer
        return DetailedCandidateProfileSerializer
    
    def get_object(self):
        """Override to handle 'me' endpoint"""
        if self.kwargs.get('pk') == 'me':
            profile = get_object_or_404(
                CandidateProfile,
                user=self.request.user
            )
            self.check_object_permissions(self.request, profile)
            return profile
        return super().get_object()
    
    # ============================================
    # GET ENDPOINTS
    # ============================================
    
    @action(
    detail=False,
    methods=['get', 'patch'],  # ✅ Both methods
    permission_classes=[IsAuthenticated],
    url_path='me'
)
    def me(self, request):
        """Handle both GET and PATCH for /api/candidate/profile/me/"""
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = DetailedCandidateProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UpdateCandidateProfileSerializer(
                profile, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Profile updated successfully",
                    "data": DetailedCandidateProfileSerializer(profile).data
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def completion(self, request):
        """
        GET /api/candidate/profile/completion/
        Get profile completion percentage & missing fields
        """
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/candidate/profile/{id}/
        Get any candidate's public profile
        """
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        """
        GET /api/candidate/profile/
        List all candidate profiles (with pagination)
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # 🔥 Search by name or target_role
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(target_role__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        # 🔥 Filter by experience level
        exp_level = request.query_params.get('experience_level')
        if exp_level:
            queryset = queryset.filter(experience_level=exp_level)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    # ============================================
    # UPDATE ENDPOINTS
    # ============================================
    
    # @action(
    #     detail=False,
    #     methods=['patch'],
    #     permission_classes=[IsAuthenticated],
    #     url_path='me'
    # )
    # def update_me(self, request):
    #     """
    #     PATCH /api/candidate/profile/me/
    #     Update current user's profile
        
    #     Allowed fields:
    #     - user_first_name, user_last_name
    #     - full_name, phone, location, timezone
    #     - current_status, current_role, target_role
    #     - experience_level, years_experience, skills
    #     - preferred_interview_types, preferred_difficulty, preferred_duration
    #     - interviewer_notes
    #     - linkedin_url, github_url, portfolio_url
    #     """
    #     try:
    #         profile = CandidateProfile.objects.get(user=request.user)
    #     except CandidateProfile.DoesNotExist:
    #         return Response(
    #             {"error": "Profile not found"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )
        
    #     serializer = UpdateCandidateProfileSerializer(
    #         profile, 
    #         data=request.data, 
    #         partial=True,
    #         context={'request': request}
    #     )
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response({
    #             "message": "Profile updated successfully",
    #             "data": DetailedCandidateProfileSerializer(profile).data
    #         })
        
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # ✅ REMOVED: Generic update endpoint (security issue)
    # Users can only update their own profile via /me/
    
    def destroy(self, request, *args, **kwargs):
        """Prevent profile deletion"""
        return Response(
            {"error": "Profile cannot be deleted"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    # ============================================
    # 🔥 RESUME UPLOAD (SYNC - NO CELERY)
    # ============================================
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='resume/upload'
    )
    def upload_resume(self, request):
        """
        POST /api/candidate/profile/resume/upload/
        Upload resume to Cloudinary (synchronous)
        
        Request body (multipart/form-data):
        - resume_file: PDF file (max 5MB)
        
        Response:
        {
            "message": "Resume uploaded successfully",
            "resume_url": "https://cloudinary.../resume.pdf",
            "has_resume": true
        }
        """
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if file is provided
        if 'resume_file' not in request.FILES:
            return Response(
                {"error": "resume_file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resume_file = request.FILES['resume_file']
        
        # ✅ FIXED: Validate MIME type (not filename)
        if resume_file.content_type != "application/pdf":
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Validate file size (max 5MB)
        if resume_file.size > 5 * 1024 * 1024:
            return Response(
                {"error": "Resume file size cannot exceed 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # ✅ FIXED: Let Django + CloudinaryStorage handle upload
            # Remove manual cloudinary.uploader.upload()
            profile.resume_file.save(
                resume_file.name,
                resume_file,
                save=True
            )
            
            # ✅ Set upload status
            profile.resume_upload_status = "DONE"
            profile.resume_uploaded_at = timezone.now()
            profile.save()
            
            # ✅ FIXED: Log ID, not email (PII protection)
            logger.info(f"Resume uploaded: user_id={request.user.id}")
            
            serializer = ResumeSerializer(profile, context={'request': request})
            return Response({
                "message": "Resume uploaded successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Resume upload error: user_id={request.user.id}, error={str(e)}")
            
            profile.resume_upload_status = "FAILED"
            profile.save()
            
            return Response(
                {"error": "Failed to upload resume. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # ============================================
    # RESUME STATUS & DELETE
    # ============================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='resume/status'
    )
    def resume_status(self, request):
        """
        GET /api/candidate/profile/resume/status/
        Get current resume status
        
        Response:
        {
            "has_resume": true,
            "resume_file_url": "https://cloudinary.../resume.pdf",
            "resume_url": null,
            "upload_status": "DONE",
            "uploaded_at": "2026-01-27T10:30:00Z"
        }
        """
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = ResumeSerializer(profile, context={'request': request})
            data = serializer.data
            data['upload_status'] = profile.resume_upload_status
            data['uploaded_at'] = profile.resume_uploaded_at
            return Response(data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(
        detail=False,
        methods=['delete'],
        permission_classes=[IsAuthenticated],
        url_path='resume/delete'
    )
    def delete_resume(self, request):
        """
        DELETE /api/candidate/profile/resume/delete/
        Delete uploaded resume
        """
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            
            if not profile.resume_file:
                return Response(
                    {"error": "No resume file to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Delete from Cloudinary
            profile.resume_file.delete()
            profile.resume_upload_status = "DONE"
            profile.save()
            
            # ✅ FIXED: Log ID, not email
            logger.info(f"Resume deleted: user_id={request.user.id}")
            
            return Response({
                "message": "Resume deleted successfully"
            })
        
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Resume delete error: user_id={request.user.id}, error={str(e)}")
            return Response(
                {"error": "Failed to delete resume"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # ============================================
    # 🔥 PROFILE PICTURE UPLOAD
    # ============================================
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='picture/upload'
    )
    def upload_picture(self, request):
        """
        POST /api/candidate/profile/picture/upload/
        Upload profile picture to Cloudinary (synchronous)
        
        Request body (multipart/form-data):
        - profile_picture: Image file (jpg/png, max 5MB)
        
        Response:
        {
            "message": "Profile picture uploaded successfully",
            "picture_url": "https://cloudinary.../profile.jpg"
        }
        """
        if 'profile_picture' not in request.FILES:
            return Response(
                {"error": "profile_picture is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile_picture = request.FILES['profile_picture']
        
        # ✅ FIXED: Validate MIME type (not extension)
        valid_types = ['image/jpeg', 'image/png', 'image/gif']
        if profile_picture.content_type not in valid_types:
            return Response(
                {"error": "Only JPG, PNG, and GIF images are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Validate file size (max 5MB)
        if profile_picture.size > 5 * 1024 * 1024:
            return Response(
                {"error": "Image file size cannot exceed 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # ✅ FIXED: Use CloudinaryStorage + Django
            user = request.user
            user.profile_picture_url = profile_picture
            user.save()
            
            # ✅ FIXED: Log ID, not email
            logger.info(f"Profile picture uploaded: user_id={request.user.id}")
            
            return Response({
                "message": "Profile picture uploaded successfully",
                "picture_url": user.profile_picture_url.url if hasattr(user.profile_picture_url, 'url') else str(user.profile_picture_url)
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Picture upload error: user_id={request.user.id}, error={str(e)}")
            return Response(
                {"error": "Failed to upload picture. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
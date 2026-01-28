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


class CandidateProfileViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication] 

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return BasicCandidateProfileSerializer
        elif self.action == 'me':
            return DetailedCandidateProfileSerializer
        elif self.action == 'update' or self.action == 'update_me' :
            return UpdateCandidateProfileSerializer
        elif self.action in ['upload_resume', 'resume_status', 'resume_delete']:
            return ResumeSerializer
        elif self.action == 'profile_completion':
            return ProfileCompletionSerializer
        

    def get_object(self, request):
        if self.kwargs.get('pk') == 'me':
            profile = get_object_or_404(
                CandidateProfile, user=self.request.user
            )
            self.check_object_permissions(self.request, profile)
            return profile
        return super().get_object()
    

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def completion(self, request):
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
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__email__icontains=search) |
                Q(full_name__icontains=search) |
                q(target_role__icontains=search)
            )    
        exp_level = request.query_params.get('experience_level')
        if exp_level:
            queryset = queryset.filter(experience_level=exp_level)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    




    @action(detail=False, methods=['post'], permission_classes = [IsAuthenticated])
    def update_me(self, request):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message":"Profile updated successfully",
                "data": DetailedCandidateProfileSerializer(profile).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"error": "You cannot delete a candidate profile"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser], url_path='resume/upload')
    def upload_resume(self, request):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if 'resume_file' not in request.FILES:
            return Response(
                {"error": "resume_file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resume_file = request.FILES['resume_file']
        if resume_file.content_type != 'application/pdf':
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if resume_file.size > 5 * 1024 *1024:
            return Response(
                {"error": "Resume file size cannot exceed 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            profile.resume_file.save(resume_file.name, resume_file,
                                     save=True)
            
            profile.resume_upload_status="Done"
            profile.resume_uploaded_at=timezone.now()
            profile.save()

            logger.info(f"Resume uploaded by user id {request.user.id}")

            serializer = ResumeSerializer(profile, context={'request':request})
            return Response({
                "message":"Resume uploaded successfully",
                "data": serializer.data,
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Resume upload error: user_id={request.user.id}, error={str(e)}")

            profile.resume_upload_status = "Failed"
            profile.save()

            return Response(
                {"error": "Failed to upload resume"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        




    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='resume/status')
    def resume_status(self, request):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = ResumeSerializer(profile, context={'request':request})
            data = serializer.data
            data['upload_status'] = profile.resume_upload_status  
            data['uploaded_at'] = profile.resume_uploaded_at

            return Response(data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )



    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated], url_path='resume/delete')
    def delete_resume(self, request):
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            if not profile.resume_file:
                return Response(
                    {"error": "NO resume file to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )      
            profile.resume_file.delete()
            profile.resume_upload_status = "Done"
            profile.save()

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
        



    @action(detail=False, mothods=['post'], permission_classes=[IsAuthenticated], url_path='profile/upload')

    def upload_picture(self, request):
        if 'profile_picture' not in request.FILES:
            return Response(
                {"error": "profile_picture is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile_picture = request.FILES['profile_picture']

        valid_types = ['image/jpeg', 'image/png', 'image/gif1']

        if profile_picture.content_type not in valid_types:
            return Response(
                {"error": "Only JPG, PNG, and GIF images are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if profile_picture.size > 5 * 1024 * 1024:
            return Response(
                {"error": "file cannot exceed 5 mb"}, 
                status=status.HTTP_400_BAD_REQUEST
            )    
        
        try:
            user = request.user
            user.profile_picture = profile_picture
            user.save()

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
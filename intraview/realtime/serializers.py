# realtime/serializers.py

from rest_framework import serializers
from realtime.models import InterviewerNote


class InterviewerNoteSerializer(serializers.ModelSerializer):
  class Meta:
      model = InterviewerNote
      fields = ["booking", "interviewer", "content", "updated_at"]
      read_only_fields = ["booking", "interviewer", "updated_at"]

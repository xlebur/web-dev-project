from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TextSnippet, GameResult, Category

# 2 common serializers

class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)

class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()

# 2 model serializers

class TextSnippetModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextSnippet
        fields = ['id', 'title', 'content', 'category']

class GameResultModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameResult
        fields = ['id', 'user', 'text_snippet', 'wpm', 'accuracy', 'completed_at']
        read_only_fields = ['completed_at']
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth.models import User
from .models import TextSnippet, GameResult, Category
from .serializers import (
    TextSnippetModelSerializer, GameResultModelSerializer,
    CategorySerializer, UserSerializer
)
import random
from django.shortcuts import render

# Create your views here.

#function based views

@api_view(['GET'])
def random_text(request):
    # return random text for the game
    snippets = TextSnippet.objects.all()
    if not snippets.exists():
        return Response({'error': 'No texts available'}, status=404)
    snippet = random.choice(snippets)
    serializer = TextSnippetModelSerializer(snippet)
    return Response(serializer.data)

@api_view(['GET'])
def leaderboard(request):
    # top 10 results by wpm
    results = GameResult.objects.order_by('-wpm')[:10]
    serializer = GameResultModelSerializer(results, many=True)
    return Response(serializer.data)

# class based views

class TextSnippetListCreateView(generics.ListCreateAPIView):
    """CRUD: список всех текстов + создание нового (GET, POST)"""
    queryset = TextSnippet.objects.all()
    serializer_class = TextSnippetModelSerializer

class TextSnippetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """CRUD: получить / изменить / удалить текст по id (GET, PUT, DELETE)"""
    queryset = TextSnippet.objects.all()
    serializer_class = TextSnippetModelSerializer
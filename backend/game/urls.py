from django.urls import path
from . import views

urlpatterns = [
    path('texts/', views.TextSnippetListCreateView.as_view()),     # GET список, POST создать
    path('texts/<int:pk>/', views.TextSnippetDetailView.as_view()), # GET / PUT / DELETE по id
    path('texts/random/', views.random_text),                       # GET случайный текст
    path('leaderboard/', views.leaderboard),                        # GET топ игроков
]
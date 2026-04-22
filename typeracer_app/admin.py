from django.contrib import admin
from .models import Profile, Race, TextPassage, Achievement


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'avatar', 'total_races', 'best_wpm', 'avg_wpm', 'is_guest']
    search_fields = ['user__username', 'user__email']
    list_filter = ['is_guest']


@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ['user', 'wpm', 'accuracy', 'errors', 'duration', 'mode', 'created_at']
    search_fields = ['user__username']
    list_filter = ['mode', 'created_at']
    ordering = ['-created_at']


@admin.register(TextPassage)
class TextPassageAdmin(admin.ModelAdmin):
    list_display = ['id', 'difficulty', 'word_count', 'is_active', 'created_at']
    list_filter = ['difficulty', 'is_active']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement_type', 'earned_at']
    list_filter = ['achievement_type']
    search_fields = ['user__username']

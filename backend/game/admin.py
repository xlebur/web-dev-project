from django.contrib import admin
from .models import Category, TextSnippet, GameResult

@admin.register(TextSnippet)
class TextSnippetAdmin(admin.ModelAdmin):
    fields = ['title', 'content', 'category']  # явно указываем все поля

admin.site.register(Category)
admin.site.register(GameResult)
from django.contrib.auth.models import User
from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class TextSnippet(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True,
                                 related_name='snippets') #FK 1

    def __str__(self):
        return self.title


class GameResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='results') #FK 2
    text_snipped = models.ForeignKey(TextSnippet, on_delete=models.SET_NULL, null=True,
                                     related_name='results')
    wpm = models.IntegerField()
    accuracy = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.wpm} WPM"

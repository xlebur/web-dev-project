"""
Run this after migrations to seed the database with text passages.
Usage: python seed.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'typeracer_project.settings')
django.setup()

from typeracer_app.models import TextPassage

TEXTS = [
    {
        'content': 'The quick brown fox jumps over the lazy dog near the riverbank where birds sing at dawn.',
        'difficulty': 'easy',
    },
    {
        'content': 'Practice makes perfect, but nobody is perfect, so why practice at all? That is the question.',
        'difficulty': 'easy',
    },
    {
        'content': 'Angular is a platform for building mobile and desktop web applications using TypeScript and HTML.',
        'difficulty': 'medium',
    },
    {
        'content': 'Typing speed improves gradually with consistent practice and focus on accuracy over raw speed.',
        'difficulty': 'medium',
    },
    {
        'content': 'The best way to predict the future is to create it through hard work and determined effort every single day.',
        'difficulty': 'medium',
    },
    {
        'content': 'Web development combines creativity with logic to build interfaces that people use every day across the world.',
        'difficulty': 'medium',
    },
    {
        'content': 'A journey of a thousand miles begins with a single step taken confidently in the right direction without hesitation.',
        'difficulty': 'hard',
    },
    {
        'content': 'Clean code is not just about making things work but making them easy for others to understand and maintain over time.',
        'difficulty': 'hard',
    },
    {
        'content': 'Django REST Framework provides a powerful and flexible toolkit for building Web APIs with minimal boilerplate code.',
        'difficulty': 'hard',
    },
    {
        'content': 'Software engineering is the discipline of applying systematic, disciplined, and quantifiable approaches to software development.',
        'difficulty': 'hard',
    },
]

created = 0
for t in TEXTS:
    obj, was_created = TextPassage.objects.get_or_create(content=t['content'], defaults={'difficulty': t['difficulty']})
    if was_created:
        created += 1

print(f'Seeded {created} new text passages. Total: {TextPassage.objects.count()}')

from django.db import models
from django.contrib.auth.models import User


# ── Custom Model Manager (requirement) ────────────────────────────────────────
class RaceManager(models.Manager):
    """Custom manager for Race model with helper query methods."""

    def top_scores(self, limit=50):
        """Return top races ordered by WPM."""
        return self.order_by('-wpm')[:limit]

    def by_user(self, user):
        """Return all races for a specific user, newest first."""
        return self.filter(user=user).order_by('-created_at')

    def user_best(self, user):
        """Return the best WPM race for a user."""
        return self.filter(user=user).order_by('-wpm').first()


# ── Model 1: Profile ──────────────────────────────────────────────────────────
# ForeignKey relationship 1: Profile → User (OneToOne acts as FK)
class Profile(models.Model):
    AVATAR_CHOICES = [
        ('🦊', 'Fox'),
        ('🐯', 'Tiger'),
        ('🦁', 'Lion'),
        ('🐺', 'Wolf'),
        ('🦅', 'Eagle'),
        ('🐉', 'Dragon'),
        ('🦄', 'Unicorn'),
        ('🐧', 'Penguin'),
        ('🦋', 'Butterfly'),
        ('🐬', 'Dolphin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.CharField(max_length=10, default='🦊', choices=AVATAR_CHOICES)
    total_races = models.PositiveIntegerField(default=0)
    best_wpm = models.PositiveIntegerField(default=0)
    avg_wpm = models.PositiveIntegerField(default=0)
    is_guest = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def update_stats(self, new_wpm):
        """Recalculate stats after a new race."""
        self.total_races += 1
        if new_wpm > self.best_wpm:
            self.best_wpm = new_wpm
        # Recalculate average from all races
        all_races = self.user.races.all()
        if all_races.exists():
            total = sum(r.wpm for r in all_races)
            self.avg_wpm = total // all_races.count()
        self.save()


# ── Model 2: TextPassage ──────────────────────────────────────────────────────
class TextPassage(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    content = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    word_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Text #{self.pk} ({self.difficulty}) — {self.word_count} words"

    def save(self, *args, **kwargs):
        self.word_count = len(self.content.split())
        super().save(*args, **kwargs)


# ── Model 3: Race ─────────────────────────────────────────────────────────────
# ForeignKey relationship 2: Race → User
# ForeignKey relationship 3: Race → TextPassage
class Race(models.Model):
    MODE_CHOICES = [
        ('30', '30 seconds'),
        ('60', '60 seconds'),
        ('inf', 'Infinite'),
        ('multi', 'Multiplayer'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='races')
    text = models.ForeignKey(
        TextPassage, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='races'
    )
    wpm = models.PositiveIntegerField()
    accuracy = models.PositiveIntegerField()
    errors = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(default=0, help_text='Race duration in seconds')
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='30')
    created_at = models.DateTimeField(auto_now_add=True)

    # Attach custom manager
    objects = RaceManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.wpm} WPM ({self.created_at.strftime('%Y-%m-%d')})"


# ── Model 4: Achievement ──────────────────────────────────────────────────────
# ForeignKey relationship 4: Achievement → User
class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('first_race', 'First Race'),
        ('speed_50', 'Speed Demon (50+ WPM)'),
        ('speed_80', 'Type Master (80+ WPM)'),
        ('speed_100', 'Century Typist (100+ WPM)'),
        ('accuracy_100', 'Perfect Accuracy'),
        ('races_10', '10 Races Completed'),
        ('races_50', '50 Races Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement_type')
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} — {self.achievement_type}"

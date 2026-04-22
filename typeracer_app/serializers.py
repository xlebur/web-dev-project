from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Race, TextPassage, Achievement


# ══════════════════════════════════════════════════════════════════════════════
# serializers.Serializer  (requirement: at least 2)
# ══════════════════════════════════════════════════════════════════════════════

class RegisterSerializer(serializers.Serializer):
    """Plain Serializer for user registration with custom validation."""
    username = serializers.CharField(min_length=3, max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    avatar = serializers.CharField(max_length=10, default='🦊', required=False)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', '🦊')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        Profile.objects.create(user=user, avatar=avatar)
        return user


class LoginSerializer(serializers.Serializer):
    """Plain Serializer for login credentials."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


# ══════════════════════════════════════════════════════════════════════════════
# serializers.ModelSerializer  (requirement: at least 2)
# ══════════════════════════════════════════════════════════════════════════════

class ProfileSerializer(serializers.ModelSerializer):
    """ModelSerializer for Profile — includes nested user info."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'avatar',
            'total_races', 'best_wpm', 'avg_wpm',
            'is_guest', 'created_at'
        ]
        read_only_fields = ['total_races', 'best_wpm', 'avg_wpm', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True) # Вкладываем профиль

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']



class RaceSerializer(serializers.ModelSerializer):
    """ModelSerializer for Race — used for list, create, detail."""
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Race
        fields = [
            'id', 'username', 'wpm', 'accuracy',
            'errors', 'duration', 'mode', 'created_at',
        ]
        read_only_fields = ['id', 'username', 'created_at']

    def validate_wpm(self, value):
        if value < 0 or value > 300:
            raise serializers.ValidationError('WPM must be between 0 and 300.')
        return value

    def validate_accuracy(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Accuracy must be between 0 and 100.')
        return value

    def create(self, validated_data):
        """Link race to authenticated user automatically."""
        user = self.context['request'].user
        race = Race.objects.create(user=user, **validated_data)

        # Update profile stats
        try:
            profile = user.profile
            profile.update_stats(race.wpm)
        except Profile.DoesNotExist:
            pass

        # Check and award achievements
        self._check_achievements(user, race)
        return race

    def _check_achievements(self, user, race):
        total_races = Race.objects.filter(user=user).count()
        achievements_to_check = []

        if total_races == 1:
            achievements_to_check.append('first_race')
        if race.wpm >= 50:
            achievements_to_check.append('speed_50')
        if race.wpm >= 80:
            achievements_to_check.append('speed_80')
        if race.wpm >= 100:
            achievements_to_check.append('speed_100')
        if race.accuracy == 100:
            achievements_to_check.append('accuracy_100')
        if total_races >= 10:
            achievements_to_check.append('races_10')
        if total_races >= 50:
            achievements_to_check.append('races_50')

        for a_type in achievements_to_check:
            Achievement.objects.get_or_create(user=user, achievement_type=a_type)


class TextPassageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextPassage
        fields = ['id', 'content', 'difficulty', 'word_count', 'created_at']
        read_only_fields = ['word_count', 'created_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_type', 'earned_at']
        read_only_fields = ['earned_at']

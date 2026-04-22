from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Profile, Race, TextPassage, Achievement
from .serializers import (
    RegisterSerializer, LoginSerializer,
    ProfileSerializer, RaceSerializer,
    TextPassageSerializer, AchievementSerializer,UserSerializer
)


# ══════════════════════════════════════════════════════════════════════════════
# Function-Based Views (requirement: at least 2 FBV)
# ══════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """FBV 1 — Register a new user and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        profile = user.profile
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """FBV 2 — Login with username/password, return JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def guest_login_view(request):
    """FBV 3 — Create a temporary guest account."""
    import random, string
    rand_suffix = ''.join(random.choices(string.digits, k=4))
    username = f'Guest{rand_suffix}'

    # Make username unique
    while User.objects.filter(username=username).exists():
        rand_suffix = ''.join(random.choices(string.digits, k=4))
        username = f'Guest{rand_suffix}'

    user = User.objects.create_user(username=username, password=None)
    profile = Profile.objects.create(user=user, is_guest=True, avatar='👤')
    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """FBV 4 — Logout by blacklisting the refresh token."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """FBV 5 — Get current authenticated user's profile."""
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)
    return Response(ProfileSerializer(profile).data)


# ══════════════════════════════════════════════════════════════════════════════
# Class-Based Views (requirement: at least 2 CBV using APIView)
# ══════════════════════════════════════════════════════════════════════════════

class RaceListCreateView(APIView):
    """
    CBV 1 — Race list and create.
    GET  /api/races/         → leaderboard (top 50, public)
    POST /api/races/         → save race result (authenticated)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """Global leaderboard — top 50 races by WPM."""
        races = Race.objects.top_scores(50)  # uses custom manager
        serializer = RaceSerializer(races, many=True)
        return Response({'leaderboard': serializer.data})

    def post(self, request):
        """Save a completed race — linked to request.user."""
        serializer = RaceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            race = serializer.save()
            return Response(RaceSerializer(race).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RaceDetailView(APIView):
    """
    CBV 2 — Race detail: retrieve, update, delete (full CRUD for Race).
    GET    /api/races/<id>/  → get race detail
    PUT    /api/races/<id>/  → update race
    DELETE /api/races/<id>/  → delete race
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Race.objects.get(pk=pk, user=user)
        except Race.DoesNotExist:
            return None

    def get(self, request, pk):
        race = self.get_object(pk, request.user)
        if not race:
            return Response({'error': 'Race not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RaceSerializer(race).data)

    def put(self, request, pk):
        race = self.get_object(pk, request.user)
        if not race:
            return Response({'error': 'Race not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RaceSerializer(race, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        race = self.get_object(pk, request.user)
        if not race:
            return Response({'error': 'Race not found.'}, status=status.HTTP_404_NOT_FOUND)
        race.delete()
        return Response({'message': 'Race deleted.'}, status=status.HTTP_204_NO_CONTENT)


class MyRacesView(APIView):
    """
    CBV 3 — Personal race history.
    GET /api/races/my/  → authenticated user's races
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        races = Race.objects.by_user(request.user)  # uses custom manager
        serializer = RaceSerializer(races, many=True)
        return Response({'races': serializer.data})


class ProfileView(APIView):
    """
    CBV 4 — User profile: get and update.
    GET   /api/profile/   → get profile
    PATCH /api/profile/   → update avatar
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def patch(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TextPassageListView(APIView):
    """
    CBV 5 — Text passages for typing tests.
    GET  /api/texts/          → list active texts
    POST /api/texts/          → create new text (admin only in production)
    """
    def get_permissions(self):
        return [AllowAny()]

    def get(self, request):
        difficulty = request.query_params.get('difficulty')
        texts = TextPassage.objects.filter(is_active=True)
        if difficulty:
            texts = texts.filter(difficulty=difficulty)
        serializer = TextPassageSerializer(texts, many=True)
        return Response({'texts': serializer.data})

    def post(self, request):
        serializer = TextPassageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AchievementListView(APIView):
    """
    CBV 6 — User achievements.
    GET /api/achievements/  → authenticated user's achievements
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        achievements = Achievement.objects.filter(user=request.user)
        serializer = AchievementSerializer(achievements, many=True)
        return Response({'achievements': serializer.data})

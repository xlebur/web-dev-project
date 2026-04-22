from django.urls import path
from . import views

urlpatterns = [
    # ── Auth (FBV) ──────────────────────────────────────────────────────────
    path('auth/register/',   views.register_view,    name='register'),
    path('auth/login/',      views.login_view,       name='login'),
    path('auth/guest/',      views.guest_login_view, name='guest-login'),
    path('auth/logout/',     views.logout_view,      name='logout'),
    path('auth/me/',         views.me_view,          name='me'),

    # ── Races (CBV) ─────────────────────────────────────────────────────────
    path('races/',           views.RaceListCreateView.as_view(), name='race-list-create'),
    path('races/my/',        views.MyRacesView.as_view(),        name='my-races'),
    path('races/<int:pk>/',  views.RaceDetailView.as_view(),     name='race-detail'),

    # ── Profile (CBV) ───────────────────────────────────────────────────────
    path('profile/',         views.ProfileView.as_view(),        name='profile'),

    # ── Texts (CBV) ─────────────────────────────────────────────────────────
    path('texts/',           views.TextPassageListView.as_view(), name='text-list'),

    # ── Achievements (CBV) ──────────────────────────────────────────────────
    path('achievements/',    views.AchievementListView.as_view(), name='achievements'),
]

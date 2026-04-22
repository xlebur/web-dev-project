import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UserProfile {
  avatar: string;
  total_races: number;
  best_wpm: number;
  avg_wpm: number;
  is_guest: boolean;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  is_guest: boolean;
  join_date: string;
  total_races: number;
  best_wpm: number;
  avg_wpm: number;
  profile?: UserProfile;
}

export interface Race {
  id: number;
  username: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  mode: string;
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Achievement {
  id: number;
  achievement_type: string;
  earned_at: string;
}

export interface TextPassage {
  id: number;
  content: string;
  difficulty: string;
  word_count: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ── AUTH ────────────────────────────────────────────────────────────────────

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register/`, { username, email, password })
      .pipe(catchError(this.handleError));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login/`, { username, password })
      .pipe(catchError(this.handleError));
  }

  loginAsGuest(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/guest/`, {})
      .pipe(catchError(this.handleError));
  }

  logout(refresh: string): Observable<any> {
    return this.http.post(`${this.base}/auth/logout/`, { refresh })
      .pipe(catchError(this.handleError));
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.base}/auth/me/`)
      .pipe(catchError(this.handleError));
  }

  // ── RACES ───────────────────────────────────────────────────────────────────

  saveRace(wpm: number, accuracy: number, errors: number, duration: number, mode: string = '30'): Observable<Race> {
    return this.http.post<Race>(`${this.base}/races/`, { wpm, accuracy, errors, duration, mode })
      .pipe(catchError(this.handleError));
  }

  getLeaderboard(): Observable<{ leaderboard: Race[] }> {
    return this.http.get<{ leaderboard: Race[] }>(`${this.base}/races/`)
      .pipe(catchError(this.handleError));
  }

  getMyRaces(): Observable<{ races: Race[] }> {
    return this.http.get<{ races: Race[] }>(`${this.base}/races/my/`)
      .pipe(catchError(this.handleError));
  }

  deleteRace(id: number): Observable<any> {
    return this.http.delete(`${this.base}/races/${id}/`)
      .pipe(catchError(this.handleError));
  }

  // ── PROFILE ─────────────────────────────────────────────────────────────────

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/profile/`)
      .pipe(catchError(this.handleError));
  }

  updateAvatar(avatar: string): Observable<User> {
    return this.http.patch<User>(`${this.base}/profile/`, { avatar })
      .pipe(catchError(this.handleError));
  }

  // ── TEXTS ───────────────────────────────────────────────────────────────────

  getTexts(difficulty?: string): Observable<{ texts: TextPassage[] }> {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    return this.http.get<{ texts: TextPassage[] }>(`${this.base}/texts/${params}`)
      .pipe(catchError(this.handleError));
  }

  // ── ACHIEVEMENTS ────────────────────────────────────────────────────────────

  getAchievements(): Observable<{ achievements: Achievement[] }> {
    return this.http.get<{ achievements: Achievement[] }>(`${this.base}/achievements/`)
      .pipe(catchError(this.handleError));
  }

  // ── ERROR HANDLER ────────────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Cannot connect to server. Make sure Django is running on port 8000.';
    } else if (error.error) {
      // Django returns errors as { field: ["message"] } or { detail: "message" }
      if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.error.detail) {
        message = error.error.detail;
      } else if (error.error.non_field_errors) {
        message = error.error.non_field_errors[0];
      } else {
        const firstKey = Object.keys(error.error)[0];
        if (firstKey) {
          const val = error.error[firstKey];
          message = Array.isArray(val) ? val[0] : val;
        }
      }
    } else if (error.status === 401) {
      message = 'Unauthorized. Please log in again.';
    } else if (error.status === 404) {
      message = 'Resource not found.';
    } else if (error.status === 500) {
      message = 'Server error. Please try again later.';
    }
    return throwError(() => new Error(message));
  }
}

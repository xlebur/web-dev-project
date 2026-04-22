import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService, User, AuthResponse } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'tr_jwt_token';
  private readonly USER_KEY = 'tr_user';

  currentUser = signal<User | null>(null);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser && this.getToken()) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.api.register(username, email, password).pipe(tap((res) => this.setSession(res)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    // Передаем username в api.service
    return this.api.login(username, password).pipe(tap((res) => this.setSession(res)));
  }

  loginAsGuest(): Observable<AuthResponse> {
    return this.api.loginAsGuest().pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && this.currentUser() !== null;
  }

  updateUserLocally(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);

    this.router.navigate(['/']);
  }
}

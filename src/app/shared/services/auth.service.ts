import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  joinDate: string;
  totalRaces: number;
  bestWpm: number;
  avgWpm: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS_KEY = 'tr_users';
  private readonly SESSION_KEY = 'tr_session';

  currentUser = signal<User | null>(null);

  constructor(private router: Router) {
    const saved = localStorage.getItem(this.SESSION_KEY);
    if (saved) this.currentUser.set(JSON.parse(saved));
  }

  register(username: string, email: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { success: false, error: 'Email already registered' };
    if (users.find(u => u.username === username)) return { success: false, error: 'Username already taken' };

    const user: User = {
      id: crypto.randomUUID(),
      username,
      email,
      avatar: this.generateAvatar(username),
      isGuest: false,
      joinDate: new Date().toLocaleDateString(),
      totalRaces: 0,
      bestWpm: 0,
      avgWpm: 0
    };

    const userRecord = { ...user, password: btoa(password) };
    users.push(userRecord);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.setSession(user);
    return { success: true };
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === btoa(password));
    if (!found) return { success: false, error: 'Invalid email or password' };

    const { password: _, ...user } = found;
    this.setSession(user as User);
    return { success: true };
  }

  loginAsGuest(): void {
    const guestNum = Math.floor(Math.random() * 9000) + 1000;
    const user: User = {
      id: crypto.randomUUID(),
      username: `Guest${guestNum}`,
      email: '',
      avatar: '👤',
      isGuest: true,
      joinDate: new Date().toLocaleDateString(),
      totalRaces: 0,
      bestWpm: 0,
      avgWpm: 0
    };
    this.setSession(user);
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  updateStats(wpm: number, accuracy: number): void {
    const user = this.currentUser();
    if (!user) return;
    user.totalRaces++;
    if (wpm > user.bestWpm) user.bestWpm = wpm;
    user.avgWpm = Math.round(((user.avgWpm * (user.totalRaces - 1)) + wpm) / user.totalRaces);
    this.setSession(user);

    if (!user.isGuest) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private setSession(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  }

  private getUsers(): any[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private generateAvatar(name: string): string {
    const avatars = ['🦊', '🐯', '🦁', '🐺', '🦅', '🐉', '🦄', '🐧', '🦋', '🐬'];
    return avatars[name.charCodeAt(0) % avatars.length];
  }
}

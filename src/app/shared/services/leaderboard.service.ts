import { Injectable } from '@angular/core';

export interface LeaderboardEntry {
  name: string;
  wpm: number;
  accuracy: number;
  errors: number;
  time: number;
  date: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private globalKey = 'typeracer_leaderboard_global';

  // --- GLOBAL leaderboard (all users, shown on /leaderboard) ---
  getGlobalEntries(): LeaderboardEntry[] {
    const data = localStorage.getItem(this.globalKey);
    return data ? JSON.parse(data) : [];
  }

  addEntry(entry: LeaderboardEntry): void {
    const entries = this.getGlobalEntries();
    entries.push(entry);
    entries.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem(this.globalKey, JSON.stringify(entries.slice(0, 50)));
  }

  // --- PERSONAL history (only current user's races) ---
  getUserEntries(userId: string): LeaderboardEntry[] {
    const all = this.getGlobalEntries();
    return all.filter(e => e.userId === userId);
  }

  clearGlobal(): void {
    localStorage.removeItem(this.globalKey);
  }

  getBestWpm(userId?: string): number {
    const entries = userId ? this.getUserEntries(userId) : this.getGlobalEntries();
    return entries.length > 0 ? entries[0].wpm : 0;
  }

  getAverageWpm(userId: string): number {
    const entries = this.getUserEntries(userId);
    if (entries.length === 0) return 0;
    return Math.round(entries.reduce((s, e) => s + e.wpm, 0) / entries.length);
  }
}

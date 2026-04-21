import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { LeaderboardService, LeaderboardEntry } from '../shared/services/leaderboard.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: any;
  recentRaces: LeaderboardEntry[] = [];
  bestWpm: number = 0;
  avgWpm: number = 0;
  totalRaces: number = 0;

  constructor(private auth: AuthService, private lbService: LeaderboardService) {
    this.user = this.auth.currentUser();
    const userId = this.user?.id || '';
    const personal = this.lbService.getUserEntries(userId);
    this.recentRaces = personal.slice(0, 10);
    this.bestWpm = personal.length > 0 ? personal[0].wpm : 0;
    this.avgWpm = this.lbService.getAverageWpm(userId);
    this.totalRaces = personal.length;
  }

  logout(): void {
    this.auth.logout();
  }

  getWpmBarWidth(wpm: number): number {
    const max = Math.max(this.bestWpm, 100);
    return Math.min(100, Math.round((wpm / max) * 100));
  }

  getAccColor(acc: number): string {
    if (acc >= 98) return '#639922';
    if (acc >= 90) return '#e24b4a';
    return '#ba7517';
  }
}

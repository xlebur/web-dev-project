import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaderboardService, LeaderboardEntry } from '../shared/services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {
  entries: LeaderboardEntry[] = [];

  constructor(private lbService: LeaderboardService, private router: Router) {
    this.entries = this.lbService.getGlobalEntries();
  }

  clearAll(): void {
    if (confirm('Clear entire leaderboard?')) {
      this.lbService.clearGlobal();
      this.entries = [];
    }
  }

  playAgain(): void {
    this.router.navigate(['/game']);
  }

  getRankIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return String(index + 1);
  }

  isTopThree(index: number): boolean {
    return index < 3;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Race } from '../shared/services/api.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  entries: Race[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  // Triggers GET /api/races/leaderboard
  loadLeaderboard(): void {
    this.loading = true;
    this.error = '';
    this.api.getLeaderboard().subscribe({
      next: (res) => { this.entries = res.leaderboard; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; }
    });
  }

  playAgain(): void { this.router.navigate(['/game']); }

  getRankIcon(i: number): string {
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
  }

  isTopThree(i: number): boolean { return i < 3; }
}

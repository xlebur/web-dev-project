import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardService } from '../shared/services/leaderboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [CommonModule],
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  bestWpm: number;
  totalRaces: number;

  constructor(
    private router: Router,
    private lbService: LeaderboardService,
  ) {
    this.bestWpm = this.lbService.getGlobalEntries().reduce((max, e) => (e.wpm > max ? e.wpm : max), 0);
    this.totalRaces = this.lbService.getGlobalEntries().length;
  }

  startRace(): void {
    this.router.navigate(['/game']);
  }

  viewLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }
}

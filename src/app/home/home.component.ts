import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardService } from '../shared/services/leaderboard.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/services/api.service'; // Путь может немного отличаться


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
    private auth: AuthService,
  ) {
    // Получаем данные из сигнала текущего пользователя
    const userProfile = this.auth.currentUser()?.profile;
    const user = this.auth.currentUser() as any;
    this.bestWpm = user?.profile?.best_wpm ?? 0;
    this.totalRaces = user?.profile?.total_races ?? 0;
  }

  startRace(): void {
    this.router.navigate(['/game']);
  }

  viewLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }
}

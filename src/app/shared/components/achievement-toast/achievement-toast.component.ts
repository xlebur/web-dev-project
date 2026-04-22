import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementService, AchievementToast } from '../../services/achievement.service';

@Component({
  selector: 'app-achievement-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-toast.component.html',
  styleUrls: ['./achievement-toast.component.css']
})
export class AchievementToastComponent {
  constructor(public achievementService: AchievementService) {}

  get toasts(): AchievementToast[] {
    return this.achievementService.toasts();
  }

  dismiss(id: string): void {
    this.achievementService.dismiss(id);
  }

  trackById(_: number, toast: AchievementToast): string {
    return toast.id;
  }
}

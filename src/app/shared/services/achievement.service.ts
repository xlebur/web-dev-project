import { Injectable, signal } from '@angular/core';

export interface AchievementToast {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<string, { title: string; description: string; icon: string }> = {
  first_race:    { title: 'First Race!',         description: 'You completed your first race',      icon: '🏁' },
  speed_50:      { title: 'Speed Demon',          description: 'Reached 50+ WPM',                   icon: '⚡' },
  speed_80:      { title: 'Type Master',          description: 'Reached 80+ WPM',                   icon: '🔥' },
  speed_100:     { title: 'Century Typist',       description: 'Reached 100+ WPM',                  icon: '💯' },
  speed_120:     { title: 'Keyboard Warrior',     description: 'Reached 120+ WPM',                  icon: '⚔️' },
  accuracy_100:  { title: 'Perfect Accuracy',     description: '100% accuracy in a race',           icon: '🎯' },
  races_10:      { title: '10 Races Done',        description: 'Completed 10 races',                icon: '🏆' },
  races_50:      { title: '50 Races Done',        description: 'Completed 50 races',                icon: '👑' },
};

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly KEY = 'tr_earned_achievements';
  toasts = signal<AchievementToast[]>([]);

  checkAndAward(wpm: number, accuracy: number, totalRaces: number): void {
    const earned = this.getEarned();
    const newOnes: string[] = [];

    if (totalRaces === 1 && !earned.includes('first_race'))   newOnes.push('first_race');
    if (wpm >= 50  && !earned.includes('speed_50'))           newOnes.push('speed_50');
    if (wpm >= 80  && !earned.includes('speed_80'))           newOnes.push('speed_80');
    if (wpm >= 100 && !earned.includes('speed_100'))          newOnes.push('speed_100');
    if (wpm >= 120 && !earned.includes('speed_120'))          newOnes.push('speed_120');
    if (accuracy === 100 && !earned.includes('accuracy_100')) newOnes.push('accuracy_100');
    if (totalRaces >= 10 && !earned.includes('races_10'))     newOnes.push('races_10');
    if (totalRaces >= 50 && !earned.includes('races_50'))     newOnes.push('races_50');

    newOnes.forEach((type, i) => {
      const meta = ACHIEVEMENTS[type];
      setTimeout(() => this.showToast(type, meta), i * 1200);
      earned.push(type);
    });

    if (newOnes.length > 0) {
      localStorage.setItem(this.KEY, JSON.stringify(earned));
    }
  }

  private showToast(type: string, meta: { title: string; description: string; icon: string }): void {
    const toast: AchievementToast = {
      id: `${type}_${Date.now()}`,
      type,
      title: meta.title,
      description: meta.description,
      icon: meta.icon
    };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  getEarned(): string[] {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }

  getAllWithStatus(): Array<{ type: string; earned: boolean } & typeof ACHIEVEMENTS[string]> {
    const earned = this.getEarned();
    return Object.entries(ACHIEVEMENTS).map(([type, meta]) => ({
      type,
      ...meta,
      earned: earned.includes(type)
    }));
  }
}

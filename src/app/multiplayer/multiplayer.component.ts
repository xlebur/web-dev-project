import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { LeaderboardService } from '../shared/services/leaderboard.service';

export interface Racer {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  wpm: number;
  isUser: boolean;
  finished: boolean;
  finishTime?: number;
  targetWpm: number;
}

@Component({
  selector: 'app-multiplayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.css']
})
export class MultiplayerComponent implements OnDestroy {
  @ViewChild('typingInput') typingInput!: ElementRef<HTMLInputElement>;

  readonly TEXTS = [
    'The quick brown fox jumps over the lazy dog near the riverbank where birds sing at dawn.',
    'Practice makes perfect, but nobody is perfect, so why practice at all? That is the question.',
    'Angular is a platform for building mobile and desktop web applications using TypeScript and HTML.',
    'Typing speed improves gradually with consistent practice and focus on accuracy over raw speed.',
  ];

  readonly BOT_NAMES = [
    { name: 'QuickFingers', avatar: '🦊' },
    { name: 'SpeedDemon', avatar: '🐯' },
    { name: 'TypeMaster', avatar: '🦁' },
    { name: 'KeyWizard', avatar: '🐺' },
  ];

  currentText = '';
  racers: Racer[] = [];
  typedValue = '';
  status: 'lobby' | 'countdown' | 'racing' | 'finished' = 'lobby';
  countdown = 3;
  userWpm = 0;
  userProgress = 0;
  userFinished = false;
  totalKeystrokes = 0;
  errorCount = 0;
  accuracy = 100;
  userRank = 0;
  elapsedSec = 0;

  private startTime = 0;
  private timerInterval: any = null;
  private botIntervals: any[] = [];
  private countdownInterval: any = null;

  constructor(private auth: AuthService, private lbService: LeaderboardService) {
    this.setupLobby();
  }

  setupLobby(): void {
    this.currentText = this.TEXTS[Math.floor(Math.random() * this.TEXTS.length)];
    const user = this.auth.currentUser();
    const numBots = 3;

    this.racers = [
      {
        id: 'user',
        name: user?.username || 'You',
        avatar: user?.avatar || '🎯',
        progress: 0,
        wpm: 0,
        isUser: true,
        finished: false,
        targetWpm: 0
      },
      ...this.BOT_NAMES.slice(0, numBots).map((b, i) => ({
        id: `bot_${i}`,
        name: b.name,
        avatar: b.avatar,
        progress: 0,
        wpm: 0,
        isUser: false,
        finished: false,
        targetWpm: 45 + Math.floor(Math.random() * 55)
      }))
    ];
    this.typedValue = '';
    this.userWpm = 0;
    this.userProgress = 0;
    this.userFinished = false;
    this.totalKeystrokes = 0;
    this.errorCount = 0;
    this.accuracy = 100;
    this.userRank = 0;
    this.elapsedSec = 0;
    this.status = 'lobby';
  }

  startRace(): void {
    this.status = 'countdown';
    this.countdown = 3;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.beginRace();
      }
    }, 1000);
  }

  beginRace(): void {
    this.status = 'racing';
    this.startTime = Date.now();
    setTimeout(() => this.typingInput?.nativeElement.focus(), 50);

    this.timerInterval = setInterval(() => {
      this.elapsedSec = (Date.now() - this.startTime) / 1000;
      this.updateUserStats();
    }, 200);

    this.racers.filter(r => !r.isUser).forEach(bot => {
      const jitter = (Math.random() - 0.5) * 8;
      const effectiveWpm = bot.targetWpm + jitter;
      const charsPerMs = (effectiveWpm * 5) / 60000;

      const interval = setInterval(() => {
        if (bot.finished || this.status === 'finished') {
          clearInterval(interval); return;
        }
        const elapsed = Date.now() - this.startTime;
        const charsTyped = Math.min(Math.floor(elapsed * charsPerMs), this.currentText.length);
        bot.progress = Math.round((charsTyped / this.currentText.length) * 100);
        bot.wpm = Math.round(effectiveWpm + (Math.random() - 0.5) * 4);

        if (charsTyped >= this.currentText.length && !bot.finished) {
          bot.finished = true;
          bot.progress = 100;
          bot.finishTime = elapsed;
          clearInterval(interval);
          this.checkAllFinished();
        }
      }, 100);

      this.botIntervals.push(interval);
    });
  }

  onInput(event: Event): void {
    if (this.status !== 'racing') return;
    const input = event.target as HTMLInputElement;
    const typed = input.value;
    this.typedValue = typed;

    if (typed.length > 0) {
      this.totalKeystrokes++;
      if (typed[typed.length - 1] !== this.currentText[typed.length - 1]) this.errorCount++;
    }

    if (typed.length >= this.currentText.length && !this.userFinished) {
      this.userFinished = true;
      const userRacer = this.racers.find(r => r.isUser)!;
      userRacer.finished = true;
      userRacer.progress = 100;
      userRacer.finishTime = Date.now() - this.startTime;
      this.checkAllFinished();
    }
  }

  onKeydown(): void {
    if (this.status === 'lobby') this.startRace();
  }

  updateUserStats(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const words = this.typedValue.trim().split(/\s+/).filter(Boolean).length;
    this.userWpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    this.userProgress = Math.min(100, Math.round((this.typedValue.length / this.currentText.length) * 100));
    this.accuracy = this.totalKeystrokes > 0
      ? Math.round(((this.totalKeystrokes - this.errorCount) / this.totalKeystrokes) * 100)
      : 100;

    const userRacer = this.racers.find(r => r.isUser)!;
    userRacer.wpm = this.userWpm;
    userRacer.progress = this.userProgress;
  }

  checkAllFinished(): void {
    const finishedCount = this.racers.filter(r => r.finished).length;
    if (finishedCount >= this.racers.length - 1) {
      setTimeout(() => this.finishRace(), 1500);
    }
  }

  finishRace(): void {
    clearInterval(this.timerInterval);
    this.botIntervals.forEach(clearInterval);
    this.status = 'finished';

    const sorted = [...this.racers].sort((a, b) => {
      if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });

    this.userRank = sorted.findIndex(r => r.isUser) + 1;
    this.racers = sorted;

    const user = this.auth.currentUser();
    this.lbService.addEntry({
      name: user?.username || 'You',
      wpm: this.userWpm,
      accuracy: this.accuracy,
      errors: this.errorCount,
      time: Math.round(this.elapsedSec),
      date: new Date().toLocaleDateString(),
      userId: user?.id
    });
    this.auth.updateStats(this.userWpm, this.accuracy);
  }

  getRankLabel(rank: number): string {
    const labels: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '4th' };
    return labels[rank] || `${rank}th`;
  }

  playAgain(): void {
    clearInterval(this.timerInterval);
    this.botIntervals.forEach(clearInterval);
    this.botIntervals = [];
    this.setupLobby();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
    this.botIntervals.forEach(clearInterval);
  }
}

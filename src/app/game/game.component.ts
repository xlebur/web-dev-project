import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaderboardService } from '../shared/services/leaderboard.service';
import { AuthService } from '../shared/services/auth.service';

export interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'wrong' | 'cursor';
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnDestroy {
  @ViewChild('typingInput') typingInput!: ElementRef<HTMLInputElement>;

  readonly TEXTS = [
    'The quick brown fox jumps over the lazy dog near the riverbank where birds sing at dawn.',
    'Practice makes perfect, but nobody is perfect, so why practice at all? That is the question.',
    'Angular is a platform for building mobile and desktop web applications using TypeScript and HTML.',
    'Typing speed improves gradually with consistent practice and focus on accuracy over raw speed.',
    'The best way to predict the future is to create it through hard work and determined effort.',
    'Web development combines creativity with logic to build interfaces that people use every day.',
    'A journey of a thousand miles begins with a single step taken confidently in the right direction.',
    'Clean code is not just about making things work but making them easy for others to understand.',
  ];

  currentText = '';
  chars: CharState[] = [];
  typedValue = '';
  raceMode = 30;
  status: 'idle' | 'countdown' | 'racing' | 'finished' = 'idle';
  countdown = 3;
  timeLeft = 30;
  elapsedSec = 0;
  wpm = 0;
  accuracy = 100;
  wordCount = 0;
  errorCount = 0;
  totalKeystrokes = 0;
  progress = 0;

  private startTime = 0;
  private timerInterval: any = null;
  private countdownInterval: any = null;

  constructor(
    private router: Router,
    private lbService: LeaderboardService,
    private auth: AuthService
  ) {
    this.newText();
  }

  newText(): void {
    this.currentText = this.TEXTS[Math.floor(Math.random() * this.TEXTS.length)];
    this.renderChars('');
  }

  renderChars(typed: string): void {
    this.chars = this.currentText.split('').map((ch, i) => {
      if (i < typed.length) return { char: ch, status: typed[i] === ch ? 'correct' : 'wrong' };
      if (i === typed.length) return { char: ch, status: 'cursor' };
      return { char: ch, status: 'pending' };
    });
  }

  setMode(mode: number): void {
    this.raceMode = mode;
    this.reset();
  }

  startRace(): void {
    if (this.status !== 'idle') return;
    this.status = 'countdown';
    this.countdown = 3;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(this.countdownInterval); this.beginRace(); }
    }, 1000);
  }

  beginRace(): void {
    this.status = 'racing';
    this.startTime = Date.now();
    this.totalKeystrokes = 0;
    this.errorCount = 0;
    this.elapsedSec = 0;
    this.timeLeft = this.raceMode;
    this.wpm = 0; this.accuracy = 100; this.wordCount = 0; this.progress = 0;
    this.typedValue = '';
    this.renderChars('');
    setTimeout(() => this.typingInput?.nativeElement.focus(), 50);

    this.timerInterval = setInterval(() => {
      this.elapsedSec = (Date.now() - this.startTime) / 1000;
      if (this.raceMode > 0) {
        this.timeLeft = Math.max(0, this.raceMode - this.elapsedSec);
        if (this.timeLeft <= 0) this.finishRace();
      } else {
        this.timeLeft = this.elapsedSec;
      }
      this.updateStats();
    }, 200);
  }

  onInput(event: Event): void {
    if (this.status !== 'racing') return;
    const typed = (event.target as HTMLInputElement).value;
    this.typedValue = typed;
    if (typed.length > 0) {
      this.totalKeystrokes++;
      if (typed[typed.length - 1] !== this.currentText[typed.length - 1]) this.errorCount++;
    }
    this.renderChars(typed);
    this.updateStats();
    if (typed.length >= this.currentText.length) this.finishRace();
  }

  onKeydown(_event: KeyboardEvent): void {
    if (this.status === 'idle') this.startRace();
  }

  updateStats(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const words = this.typedValue.trim().split(/\s+/).filter(Boolean).length;
    this.wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    this.wordCount = words;
    this.accuracy = this.totalKeystrokes > 0
      ? Math.round(((this.totalKeystrokes - this.errorCount) / this.totalKeystrokes) * 100) : 100;
    this.progress = Math.min(100, Math.round((this.typedValue.length / this.currentText.length) * 100));
  }

  finishRace(): void {
    clearInterval(this.timerInterval);
    this.status = 'finished';
    const elapsed = (Date.now() - this.startTime) / 1000;
    const user = this.auth.currentUser();
    this.lbService.addEntry({
      name: user?.username || 'You',
      wpm: this.wpm,
      accuracy: this.accuracy,
      errors: this.errorCount,
      time: Math.round(elapsed),
      date: new Date().toLocaleDateString(),
      userId: user?.id
    });
    this.auth.updateStats(this.wpm, this.accuracy);
  }

  reset(): void {
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
    this.status = 'idle';
    this.typedValue = '';
    this.wpm = 0; this.accuracy = 100; this.wordCount = 0;
    this.errorCount = 0; this.totalKeystrokes = 0; this.progress = 0;
    this.timeLeft = this.raceMode; this.elapsedSec = 0;
    this.renderChars('');
  }

  goLeaderboard(): void { this.router.navigate(['/leaderboard']); }
  goProfile(): void { this.router.navigate(['/profile']); }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
  }

  get timerDisplay(): string {
    if (this.raceMode === 0) return Math.floor(this.elapsedSec) + 's';
    return Math.ceil(this.timeLeft) + 's';
  }

  get timerUrgent(): boolean {
    return this.raceMode > 0 && this.timeLeft <= 5;
  }
}

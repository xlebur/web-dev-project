import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, TextPassage } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { AchievementService } from '../shared/services/achievement.service';

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
  @ViewChild('wpmCanvas')   wpmCanvas!: ElementRef<HTMLCanvasElement>;

  // Texts
  texts: TextPassage[] = [];
  currentText = '';
  chars: CharState[] = [];
  selectedDifficulty: 'easy' | 'medium' | 'hard' | 'all' = 'all';
  loadingTexts = false;

  // Game state
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
  saveError = '';
  saving = false;

  // Live WPM chart data
  wpmHistory: number[] = [];
  private wpmSampleInterval: any = null;

  private startTime = 0;
  private timerInterval: any = null;
  private countdownInterval: any = null;

  // Fallback texts if API is unavailable
  readonly FALLBACK_TEXTS = [
    'The quick brown fox jumps over the lazy dog near the riverbank where birds sing at dawn.',
    'Practice makes perfect, but nobody is perfect, so why practice at all? That is the question.',
    'Angular is a platform for building mobile and desktop web applications using TypeScript and HTML.',
    'Typing speed improves gradually with consistent practice and focus on accuracy over raw speed.',
    'The best way to predict the future is to create it through hard work and determined effort.',
  ];

  constructor(
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private achievements: AchievementService
  ) {
    this.loadTexts();
  }

  // ── Difficulty + text loading ──────────────────────────────────────────────

  setDifficulty(d: 'easy' | 'medium' | 'hard' | 'all'): void {
    this.selectedDifficulty = d;
    this.loadTexts();
    this.reset();
  }

  loadTexts(): void {
    this.loadingTexts = true;
    const diff = this.selectedDifficulty === 'all' ? undefined : this.selectedDifficulty;
    this.api.getTexts(diff).subscribe({
      next: (res) => {
        this.texts = res.texts;
        this.loadingTexts = false;
        this.pickText();
      },
      error: () => {
        this.loadingTexts = false;
        // Use fallback texts if API unreachable
        this.currentText = this.FALLBACK_TEXTS[Math.floor(Math.random() * this.FALLBACK_TEXTS.length)];
        this.renderChars('');
      }
    });
  }

  pickText(): void {
    if (this.texts.length > 0) {
      const t = this.texts[Math.floor(Math.random() * this.texts.length)];
      this.currentText = t.content;
    } else {
      this.currentText = this.FALLBACK_TEXTS[Math.floor(Math.random() * this.FALLBACK_TEXTS.length)];
    }
    this.renderChars('');
  }

  newText(): void {
    this.pickText();
    this.reset();
  }

  // ── Char rendering ────────────────────────────────────────────────────────

  renderChars(typed: string): void {
    this.chars = this.currentText.split('').map((ch, i) => {
      if (i < typed.length) return { char: ch, status: typed[i] === ch ? 'correct' : 'wrong' };
      if (i === typed.length) return { char: ch, status: 'cursor' };
      return { char: ch, status: 'pending' };
    });
  }

  // ── Race control ──────────────────────────────────────────────────────────

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
    this.totalKeystrokes = 0; this.errorCount = 0; this.elapsedSec = 0;
    this.timeLeft = this.raceMode; this.wpm = 0; this.accuracy = 100;
    this.wordCount = 0; this.progress = 0; this.typedValue = '';
    this.wpmHistory = [];
    this.renderChars('');
    setTimeout(() => this.typingInput?.nativeElement.focus(), 50);

    // Timer + WPM sampling every 2s for chart
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

    this.wpmSampleInterval = setInterval(() => {
      if (this.status === 'racing') {
        this.wpmHistory.push(this.wpm);
        this.drawWpmChart();
      }
    }, 2000);
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
    if (this.status === 'finished') return;
    clearInterval(this.timerInterval);
    clearInterval(this.wpmSampleInterval);
    this.wpmHistory.push(this.wpm);
    this.drawWpmChart();
    this.status = 'finished';
    const elapsed = (Date.now() - this.startTime) / 1000;

    this.saving = true;
    this.saveError = '';
    const mode = this.raceMode === 0 ? 'inf' : String(this.raceMode);

    this.api.saveRace(this.wpm, this.accuracy, this.errorCount, Math.round(elapsed), mode)
      .subscribe({
        next: () => {
          this.saving = false;
          const user = this.auth.currentUser();
          const totalRaces = (user?.total_races || 0) + 1;
          this.achievements.checkAndAward(this.wpm, this.accuracy, totalRaces);
        },
        error: (err) => {
          this.saveError = err.message;
          this.saving = false;
          // Still check achievements even if save fails
          this.achievements.checkAndAward(this.wpm, this.accuracy, 1);
        }
      });
  }

  // ── Live WPM chart ─────────────────────────────────────────────────────────

  drawWpmChart(): void {
    const canvas = this.wpmCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || this.wpmHistory.length < 2) return;

    const W = canvas.width;
    const H = canvas.height;
    const data = this.wpmHistory;
    const maxWpm = Math.max(...data, 60);
    const pad = { top: 10, right: 10, bottom: 20, left: 32 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxWpm - (maxWpm / 4) * i)), pad.left - 4, y + 4);
    }

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#e24b4a';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    data.forEach((val, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const y = pad.top + chartH - (val / maxWpm) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under line
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(226,75,74,0.1)';
    ctx.fill();

    // Dots
    data.forEach((val, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const y = pad.top + chartH - (val / maxWpm) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#e24b4a';
      ctx.fill();
    });
  }

  reset(): void {
    clearInterval(this.timerInterval); clearInterval(this.countdownInterval);
    clearInterval(this.wpmSampleInterval);
    this.status = 'idle'; this.typedValue = ''; this.wpm = 0; this.accuracy = 100;
    this.wordCount = 0; this.errorCount = 0; this.totalKeystrokes = 0;
    this.progress = 0; this.timeLeft = this.raceMode; this.elapsedSec = 0;
    this.saveError = ''; this.saving = false; this.wpmHistory = [];
    const canvas = this.wpmCanvas?.nativeElement;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    this.renderChars('');
  }

  goLeaderboard(): void { this.router.navigate(['/leaderboard']); }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval); clearInterval(this.countdownInterval);
    clearInterval(this.wpmSampleInterval);
  }

  get timerDisplay(): string {
    if (this.raceMode === 0) return Math.floor(this.elapsedSec) + 's';
    return Math.ceil(this.timeLeft) + 's';
  }

  get timerUrgent(): boolean {
    return this.raceMode > 0 && this.timeLeft <= 5;
  }
}

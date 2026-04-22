import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { ApiService, Race, User, Achievement } from '../shared/services/api.service';
import { AchievementService, ACHIEVEMENTS } from '../shared/services/achievement.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas')  barCanvas!:  ElementRef<HTMLCanvasElement>;

  user: User | null = null;
  recentRaces: Race[] = [];
  achievements: Array<{ type: string; earned: boolean; title: string; description: string; icon: string }> = [];
  bestWpm = 0;
  avgWpm = 0;
  totalRaces = 0;
  loading = true;
  error = '';

  // Avatar picker
  showAvatarPicker = false;
  savingAvatar = false;
  readonly AVATARS = ['🦊','🐯','🦁','🐺','🦅','🐉','🦄','🐧','🦋','🐬','🎯','🚀','🐲','🦖','🐻'];

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private achievementService: AchievementService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    this.achievements = this.achievementService.getAllWithStatus();
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    // Contexts are grabbed lazily inside draw functions
    // because canvases are inside *ngIf and don't exist yet here
  }

  loadProfile(): void {
    this.loading = true; this.error = '';
    this.api.getMyRaces().subscribe({
      next: (res) => {
        this.recentRaces = res.races.slice(0, 20);
        this.totalRaces = res.races.length;
        this.bestWpm = res.races.reduce((max, r) => r.wpm > max ? r.wpm : max, 0);
        this.avgWpm = res.races.length > 0
          ? Math.round(res.races.reduce((s, r) => s + r.wpm, 0) / res.races.length) : 0;
        this.loading = false;
        // Two ticks: first for *ngIf to render canvases, then draw
        setTimeout(() => setTimeout(() => { this.drawLineChart(); this.drawBarChart(); }));
      },
      error: (err) => { this.error = err.message; this.loading = false; }
    });
  }

  // ── Avatar Picker ──────────────────────────────────────────────────────────

  toggleAvatarPicker(): void {
    this.showAvatarPicker = !this.showAvatarPicker;
  }

  selectAvatar(avatar: string): void {
    if (!this.user || this.savingAvatar) return;
    this.savingAvatar = true;
    this.api.updateAvatar(avatar).subscribe({
      next: (updated) => {
        this.user = { ...this.user!, avatar };
        this.auth.updateUserLocally(this.user);
        this.showAvatarPicker = false;
        this.savingAvatar = false;
      },
      error: () => {
        // Update locally even if API fails
        this.user = { ...this.user!, avatar };
        this.auth.updateUserLocally(this.user);
        this.showAvatarPicker = false;
        this.savingAvatar = false;
      }
    });
  }

  // ── WPM Line Chart (last 10 races trend) ─────────────────────────────────

  drawLineChart(): void {
    const canvas = this.lineCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = [...this.recentRaces].reverse().slice(0, 10).map(r => r.wpm);
    if (!canvas || !ctx || data.length < 2) return;

    const W = canvas.width, H = canvas.height;
    const maxVal = Math.max(...data, 60);
    const pad = { top: 16, right: 16, bottom: 28, left: 40 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), pad.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = '#444'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    data.forEach((_, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      ctx.fillText(`#${i + 1}`, x, H - 6);
    });

    // Area fill
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      const y = pad.top + cH - (val / maxVal) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const lastX = pad.left + cW;
    ctx.lineTo(lastX, pad.top + cH);
    ctx.lineTo(pad.left, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(226,75,74,0.08)';
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#e24b4a'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    data.forEach((val, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      const y = pad.top + cH - (val / maxVal) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots + values
    data.forEach((val, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      const y = pad.top + cH - (val / maxVal) * cH;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e24b4a'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x, y - 8);
    });
  }

  // ── WPM Bar Chart (last 20 races) ─────────────────────────────────────────

  drawBarChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = [...this.recentRaces].reverse().slice(0, 20).map(r => r.wpm);
    if (!ctx || data.length === 0) return;

    const W = canvas.width, H = canvas.height;
    const maxVal = Math.max(...data, 60);
    const pad = { top: 16, right: 16, bottom: 28, left: 40 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const barW = Math.max(4, (cW / data.length) - 4);

    ctx.clearRect(0, 0, W, H);

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), pad.left - 6, y + 4);
    }

    // Bars
    data.forEach((val, i) => {
      const x = pad.left + (cW / data.length) * i + 2;
      const barH = (val / maxVal) * cH;
      const y = pad.top + cH - barH;

      // Color by performance
      const ratio = val / maxVal;
      ctx.fillStyle = ratio > 0.8 ? '#639922' : ratio > 0.5 ? '#e24b4a' : '#ba7517';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();
    });

    // Average line
    if (this.avgWpm > 0) {
      const avgY = pad.top + cH - (this.avgWpm / maxVal) * cH;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, avgY); ctx.lineTo(W - pad.right, avgY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#555'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText(`avg ${this.avgWpm}`, pad.left + 4, avgY - 4);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  logout(): void { this.auth.logout(); }

  getAccColor(acc: number): string {
    if (acc >= 98) return '#639922';
    if (acc >= 90) return '#e24b4a';
    return '#ba7517';
  }

  get earnedCount(): number {
    return this.achievements.filter(a => a.earned).length;
  }
}

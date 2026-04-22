import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn()) this.router.navigate(['/']);
  }

  switchMode(m: 'login' | 'register'): void {
    this.mode = m;
    this.error = '';
  }

  // Click event 1 — Register (triggers POST /api/auth/register)
  submit(): void {
    this.error = '';
    this.loading = true;

    if (this.mode === 'register') {
      this.auth.register(this.username.trim(), this.email.trim(), this.password)
        .subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => { this.error = err.message; this.loading = false; }
        });
    } else {
      // Click event 2 — Login (triggers POST /api/auth/login)
      this.auth.login(this.username.trim(), this.password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        },
      });
    }
  }

  // Click event 3 — Guest login (triggers POST /api/auth/guest)
  guestLogin(): void {
    this.loading = true;
    this.auth.loginAsGuest().subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => { this.error = err.message; this.loading = false; }
    });
  }
}

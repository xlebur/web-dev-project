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

  submit(): void {
    this.error = '';
    this.loading = true;

    setTimeout(() => {
      let result: { success: boolean; error?: string };

      if (this.mode === 'register') {
        if (!this.username.trim() || this.username.length < 3) {
          this.error = 'Username must be at least 3 characters';
          this.loading = false; return;
        }
        result = this.auth.register(this.username.trim(), this.email.trim(), this.password);
      } else {
        result = this.auth.login(this.email.trim(), this.password);
      }

      this.loading = false;
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.error = result.error || 'Something went wrong';
      }
    }, 400);
  }

  guestLogin(): void {
    this.auth.loginAsGuest();
    this.router.navigate(['/']);
  }
}

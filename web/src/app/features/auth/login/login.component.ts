import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = '';
  password = '';
  loading  = false;
  error    = '';
  showPass = false;

  stars = Array.from({ length: 60 }, () => ({
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    size:  Math.random() * 2.5 + 0.5,
    delay: Math.random() * 4,
  }));

  async onSubmit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error   = '';
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err?.status === 401
        ? 'E-mail ou senha incorretos'
        : 'Erro ao entrar. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
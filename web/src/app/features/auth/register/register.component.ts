import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="auth-moon">🌙</span>
          <h1>Lunar Leads</h1>
          <p>Crie sua conta gratuita</p>
        </div>

        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="full_name">Nome completo</label>
            <input id="full_name" type="text" class="form-control"
              [class.is-invalid]="error"
              placeholder="Seu nome"
              [(ngModel)]="full_name" name="full_name"
              required autocomplete="name" />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">E-mail</label>
            <input id="email" type="email" class="form-control"
              [class.is-invalid]="error"
              placeholder="voce@exemplo.com"
              [(ngModel)]="email" name="email"
              required autocomplete="email" />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Senha</label>
            <input id="password" type="password" class="form-control"
              [class.is-invalid]="error"
              placeholder="Mínimo 6 caracteres"
              [(ngModel)]="password" name="password"
              required />
          </div>

          @if (error) {
            <div class="alert alert--error" style="margin-bottom:20px;">
              <span>{{ error }}</span>
            </div>
          }

          @if (success) {
            <div class="alert alert--success" style="margin-bottom:20px;">
              <span>✅ Conta criada! Redirecionando...</span>
            </div>
          }

          <button type="submit" class="btn btn--primary btn--full btn--lg"
            [disabled]="loading || !full_name || !email || !password">
            @if (loading) {
              <span class="btn-spinner"></span> Criando...
            } @else {
              Criar conta
            }
          </button>
        </form>

        <p style="text-align:center; margin-top:24px; font-size:14px; color:var(--text-muted);">
          Já tem conta?
          <a routerLink="/login" style="color:var(--purple-light); font-weight:600;">
            Entrar
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  full_name = '';
  email     = '';
  password  = '';
  loading   = false;
  error     = '';
  success   = false;

  async onSubmit() {
    if (!this.full_name || !this.email || !this.password) return;
    this.loading = true;
    this.error   = '';
    try {
      await this.auth.register(this.full_name, this.email, this.password);
      this.success = true;
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.loading = false;
      this.error = err?.status === 400
        ? 'E-mail já cadastrado'
        : 'Erro ao criar conta. Tente novamente.';
    }
  }
}
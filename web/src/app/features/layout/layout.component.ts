import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page-wrapper">

      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-icon">🌙</span>
          <span class="logo-text">Lunar Leads</span>
        </div>

        <div class="nav-section">
          <div class="nav-label">Principal</div>
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
            <span class="nav-icon">🏠</span> Dashboard
          </a>
          <a class="nav-item" routerLink="/jobs" routerLinkActive="active"
            [routerLinkActiveOptions]="{exact: false}">
            <span class="nav-icon">🚀</span> Leads
          </a>
        </div>

        <div class="sidebar-footer">
          <div class="nav-item" style="cursor:default; pointer-events:none;">
            <span class="nav-icon">👤</span>
            <span style="font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;">
              {{ auth.user()?.full_name || auth.user()?.email }}
            </span>
          </div>
          @if (auth.user()?.role === 'ADMIN') {
            <div class="nav-item" style="cursor:default; pointer-events:none; padding-top:0;">
              <span style="font-size:11px; color:var(--purple-light); font-weight:700; letter-spacing:0.08em; margin-left:32px;">✦ ADMIN</span>
            </div>
          }
          <div class="nav-item" (click)="auth.logout()"
            style="color:var(--red-light); cursor:pointer;">
            <span class="nav-icon">🚪</span> Sair
          </div>
        </div>
      </aside>

      <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
        <header class="topbar">
          <span class="topbar-title">{{ pageTitle() }}</span>
          <div class="topbar-actions">
            @if (auth.user()?.role === 'ADMIN') {
              <span class="badge badge--purple">ADMIN ∞</span>
            } @else {
              <span class="badge badge--purple">{{ auth.user()?.role }}</span>
            }
          </div>
        </header>
        <main class="main-content">
          <router-outlet />
        </main>
      </div>

    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class LayoutComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  pageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('jobs'))      return 'Leads';
    return 'Lunar Leads';
  }
}
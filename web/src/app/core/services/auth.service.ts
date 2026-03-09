import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User { id: string; full_name: string | null; email: string; role: string; }
export interface LoginResponse { access_token: string; token_type: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'lunar_token';
  private readonly api = environment.apiUrl;
  private http   = inject(HttpClient);
  private router = inject(Router);
  private _user = signal<User | null>(null);
  user       = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());
  readonly ready: Promise<void>;
  private _resolveReady!: () => void;

  constructor() {
    this.ready = new Promise(resolve => { this._resolveReady = resolve; });
    const token = this.getToken();
    if (token) {
      this.http.get<User>(`${this.api}/auth/me`).subscribe({
        next:  user => { this._user.set(user); this._resolveReady(); },
        error: ()   => { localStorage.removeItem(this.TOKEN_KEY); this._user.set(null); this._resolveReady(); },
      });
    } else {
      this._resolveReady();
    }
  }

  register(full_name: string, email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.http.post<User>(`${this.api}/auth/register`, { full_name, email, password }).subscribe({
        next: user => resolve(user),
        error: err => reject(err),
      });
    });
  }

  login(email: string, password: string): Promise<User> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(
        `${this.api}/auth/login`,
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      ).subscribe({
        next: res => {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          this.http.get<User>(`${this.api}/auth/me`).subscribe({
            next:  user => { this._user.set(user); resolve(user); },
            error: err  => reject(err),
          });
        },
        error: err => reject(err),
      });
    });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
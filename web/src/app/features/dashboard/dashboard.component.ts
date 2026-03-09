import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobsService, Job, Quota } from '../../core/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Bem-vinda, {{ auth.user()?.full_name || auth.user()?.email }}</p>
        </div>
        <a routerLink="/jobs" class="btn btn--primary">✨ Nova Lista</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ jobs().length }}</div>
          <div class="stat-label">Listas geradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--green)">
            {{ doneCount() }}
          </div>
          <div class="stat-label">Concluídas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--yellow)">
            {{ activeCount() }}
          </div>
          <div class="stat-label">Em progresso</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--purple-light)">
            {{ totalLeads() }}
          </div>
          <div class="stat-label">Leads gerados</div>
        </div>
      </div>

      @if (quota()) {
        <div class="quota-widget" style="margin-bottom:32px;">
          <div class="quota-header">
            <span class="quota-label">🎯 Cota — {{ quota()!.month }}</span>
            <span class="quota-value">
              {{ quota()!.leads_used }} / {{ quota()!.leads_limit }}
              {{ quota()!.leads_limit >= 999 ? '(ilimitado)' : 'listas' }}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"
              [style.width.%]="quota()!.leads_limit >= 999 ? 5 : (quota()!.leads_used / quota()!.leads_limit) * 100">
            </div>
          </div>
          @if (quota()!.leads_limit < 999) {
            <p class="quota-reset">
              Restam {{ quota()!.leads_limit - quota()!.leads_used }} listas este mês
            </p>
          }
        </div>
      }

      <div class="card">
        <div class="card-header">
          <span class="card-title">Listas recentes</span>
          <a routerLink="/jobs" class="btn btn--ghost btn--sm">Ver todas →</a>
        </div>

        @if (loading()) {
          <div style="padding:32px; text-align:center;">
            <div class="spinner spinner--lg" style="margin:0 auto;"></div>
          </div>
        } @else if (jobs().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🚀</span>
            <p class="empty-title">Nenhuma lista ainda</p>
            <p class="empty-desc">Crie sua primeira lista para começar a gerar leads</p>
            <a routerLink="/jobs" class="btn btn--primary" style="margin-top:8px;">
              Criar primeira lista
            </a>
          </div>
        } @else {
          <div class="table-wrapper" style="border:none; border-radius:0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Mês</th>
                  <th>Leads</th>
                  <th>Criado em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (job of jobs().slice(0, 5); track job.id) {
                  <tr>
                    <td>
                      <span [class]="'status-' + job.status.toLowerCase()">
                        <span class="badge-dot" [class.pulse]="job.status === 'RUNNING'"></span>
                        {{ statusLabel(job.status) }}
                      </span>
                    </td>
                    <td style="font-family:var(--font-mono); font-size:13px;">
                      {{ job.job_month ?? '—' }}
                    </td>
                    <td style="font-family:var(--font-mono);">
                      {{ job.leads_found }} / {{ job.leads_limit }}
                    </td>
                    <td style="color:var(--text-muted); font-size:13px;">
                      {{ job.created_at | date:'dd/MM/yy HH:mm' }}
                    </td>
                    <td>
                      <a [routerLink]="'/jobs/' + job.id" class="btn btn--ghost btn--sm">Ver →</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1000px; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 32px;
    }
    .page-header h2 { margin-bottom: 4px; }
    .page-header p  { color: var(--text-muted); font-size: 14px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  auth    = inject(AuthService);
  private jobsSvc = inject(JobsService);

  jobs    = signal<Job[]>([]);
  quota   = signal<Quota | null>(null);
  loading = signal(true);

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      QUEUED:    'Na fila',
      RUNNING:   'Gerando',
      DONE:      'Concluído',
      FAILED:    'Falhou',
      CANCELLED: 'Cancelado',
    };
    return map[status] ?? status;
  }

  ngOnInit() {
    this.jobsSvc.listJobs().subscribe({
      next: jobs => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.jobsSvc.getQuota().subscribe({
      next: quota => this.quota.set(quota),
    });
  }

  doneCount():   number { return this.jobs().filter(j => j.status === 'DONE').length; }
  activeCount(): number { return this.jobs().filter(j => ['QUEUED','RUNNING'].includes(j.status)).length; }
  totalLeads():  number { return this.jobs().reduce((acc, j) => acc + (j.leads_found || 0), 0); }
}

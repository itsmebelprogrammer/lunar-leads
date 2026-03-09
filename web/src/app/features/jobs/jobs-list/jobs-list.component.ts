import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobsService, Job, Quota, State, Niche } from '../../../core/services/jobs.service';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="jobs-page">
      <div class="page-header">
        <div>
          <h2>Leads</h2>
          <p>Geração de leads por estado e nicho</p>
        </div>
        <button class="btn btn--primary" (click)="showModal = true"
          [disabled]="!!(quota() && quota()!.leads_used >= quota()!.leads_limit)">
          ✨ Nova Lista
        </button>
      </div>

      @if (quota()) {
        <div class="quota-widget" style="margin-bottom:24px; padding:14px 20px;">
          <div class="quota-header" style="margin-bottom:8px;">
            <span class="quota-label">Cota {{ quota()!.month }}</span>
            <span class="quota-value">{{ quota()!.leads_used }}/{{ quota()!.leads_limit }}</span>
          </div>
          <div class="progress-bar progress-bar--sm">
            <div class="progress-fill"
              [style.width.%]="(quota()!.leads_used / quota()!.leads_limit) * 100">
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div style="padding:48px; text-align:center;">
          <div class="spinner spinner--lg" style="margin:0 auto 16px;"></div>
          <p>Carregando listas...</p>
        </div>
      } @else if (jobs().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🚀</span>
          <p class="empty-title">Nenhuma lista criada</p>
          <p class="empty-desc">Crie uma lista para começar a gerar leads</p>
          <button class="btn btn--primary" style="margin-top:8px;" (click)="showModal = true">
            Criar primeira lista
          </button>
        </div>
      } @else {
        <div class="jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-card__header">
                <span [class]="'status-' + job.status.toLowerCase()">
                  <span class="badge-dot" [class.pulse]="job.status === 'RUNNING'"></span>
                  {{ statusLabel(job.status) }}
                </span>
                <span style="font-size:12px; color:var(--text-faint); font-family:var(--font-mono);">
                  {{ job.created_at | date:'dd/MM HH:mm' }}
                </span>
              </div>

              <div class="job-card__body">
                <div class="job-meta">
                  <span class="job-meta__label">Mês</span>
                  <span class="job-meta__value">{{ job.job_month ?? '—' }}</span>
                </div>
                <div class="job-meta">
                  <span class="job-meta__label">Formato</span>
                  <span class="job-meta__value">{{ job.export_format }}</span>
                </div>
                <div class="job-meta">
                  <span class="job-meta__label">Leads</span>
                  <span class="job-meta__value" style="color:var(--green-light);">
                    {{ job.leads_found }} / {{ job.leads_limit }}
                  </span>
                </div>
              </div>

              @if (job.error_message) {
                <div class="alert alert--error" style="margin:12px 0 0; font-size:12px; padding:8px 12px;">
                  <span>{{ job.error_message }}</span>
                </div>
              }

              <div class="job-card__footer">
                <a [routerLink]="'/jobs/' + job.id" class="btn btn--ghost btn--sm">
                  Detalhes →
                </a>
                @if (job.status === 'DONE' && job.leads_found > 0) {
                  <button class="btn btn--primary btn--sm" (click)="download(job.id)">
                    ↓ CSV
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title">✨ Nova Lista de Leads</span>
            <button class="modal-close" (click)="showModal = false">×</button>
          </div>

          @if (createError) {
            <div class="alert alert--error" style="margin-bottom:20px;">
              <span>{{ createError }}</span>
            </div>
          }

          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-control" [(ngModel)]="form.state_id">
              <option value="" disabled>Selecione o estado</option>
              @for (s of states(); track s.id) {
                <option [value]="s.id">{{ s.name }} ({{ s.uf }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nicho</label>
            <select class="form-control" [(ngModel)]="form.niche_id">
              <option value="" disabled>Selecione o nicho</option>
              @for (n of niches(); track n.id) {
                <option [value]="n.id">{{ n.label }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Mês de referência</label>
            <input type="month" class="form-control"
              [(ngModel)]="form.job_month"
              [min]="minMonth" [max]="maxMonth" />
            <span class="form-hint">Mês que será usado na busca</span>
          </div>

          <div class="form-group">
            <label class="form-label">Formato de exportação</label>
            <select class="form-control" [(ngModel)]="form.export_format">
              <option value="CSV">CSV</option>
              <option value="XLSX">XLSX</option>
            </select>
          </div>

          <button class="btn btn--primary btn--full btn--lg"
            [disabled]="creating || !form.state_id || !form.niche_id || !form.job_month"
            (click)="createJob()">
            @if (creating) {
              <span class="btn-spinner"></span> Gerando...
            } @else {
              🚀 Gerar Leads
            }
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .jobs-page { max-width: 1000px; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 24px;
    }
    .page-header h2 { margin-bottom: 4px; }
    .page-header p  { color: var(--text-muted); font-size: 14px; }
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .job-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      transition: var(--transition);
    }
    .job-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--shadow-purple);
      transform: translateY(-2px);
    }
    .job-card__header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 16px;
    }
    .job-card__body {
      display: flex; flex-direction: column;
      gap: 8px; margin-bottom: 16px;
    }
    .job-card__footer {
      display: flex; gap: 8px;
      padding-top: 12px; border-top: 1px solid var(--border);
    }
    .job-meta {
      display: flex; justify-content: space-between;
      align-items: center; font-size: 13px;
    }
    .job-meta__label { color: var(--text-muted); }
    .job-meta__value { font-family: var(--font-mono); font-weight: 500; }
  `],
})
export class JobsListComponent implements OnInit {
  private jobsSvc = inject(JobsService);

  jobs        = signal<Job[]>([]);
  quota       = signal<Quota | null>(null);
  states      = signal<State[]>([]);
  niches      = signal<Niche[]>([]);
  loading     = signal(true);
  showModal   = false;
  creating    = false;
  createError = '';

  form = {
    state_id:      '' as any,
    niche_id:      '' as any,
    job_month:     '',
    export_format: 'CSV',
  };

  get minMonth() {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().slice(0, 7);
  }
  get maxMonth() { return new Date().toISOString().slice(0, 7); }

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
    this.load();
    this.jobsSvc.getStates().subscribe(s => this.states.set(s));
    this.jobsSvc.getNiches().subscribe(n => this.niches.set(n));
    this.jobsSvc.getQuota().subscribe(q => this.quota.set(q));
  }

  load() {
    this.loading.set(true);
    this.jobsSvc.listJobs().subscribe({
      next:  jobs => { this.jobs.set(jobs); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  createJob() {
    if (!this.form.state_id || !this.form.niche_id || !this.form.job_month) return;
    this.creating    = true;
    this.createError = '';

    this.jobsSvc.createJob({
      state_id:      +this.form.state_id,
      niche_id:      +this.form.niche_id,
      job_month:     this.form.job_month,
      export_format: this.form.export_format,
    }).subscribe({
      next: job => {
        this.jobs.update(jobs => [job, ...jobs]);
        this.showModal = false;
        this.creating  = false;
        this.quota.update(q => q ? { ...q, leads_used: q.leads_used + 1 } : q);
      },
      error: (err: any) => {
        this.creating = false;
        if (err.status === 402)      this.createError = 'Cota mensal esgotada.';
        else if (err.status === 409) this.createError = 'Você já tem uma geração de leads ativa.';
        else                         this.createError = 'Erro ao criar lista de leads.';
      },
    });
  }

  download(jobId: string) {
    this.jobsSvc.downloadCsv(jobId).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `leads-${jobId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }
}

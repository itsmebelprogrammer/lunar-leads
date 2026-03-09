import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { JobsService, Job, Lead, JobEvent } from '../../../core/services/jobs.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="job-detail">

      <div class="page-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <a routerLink="/jobs" class="btn btn--ghost btn--sm">← Voltar</a>
          <h2>Detalhes da Lista</h2>
        </div>
        @if (job() && job()!.status === 'DONE' && job()!.leads_found > 0) {
          <button class="btn btn--primary" (click)="download()">↓ Baixar CSV</button>
        }
      </div>

      @if (loading()) {
        <div style="padding:48px; text-align:center;">
          <div class="spinner spinner--lg" style="margin:0 auto;"></div>
        </div>
      } @else if (job()) {

        <div class="info-grid">
          <div>
            <!-- Info do job -->
            <div class="card" style="margin-bottom:20px;">
              <div class="card-header">
                <span class="card-title">Informações</span>
                <span [class]="'status-' + job()!.status.toLowerCase()">
                  <span class="badge-dot" [class.pulse]="job()!.status === 'RUNNING'"></span>
                  {{ statusLabel(job()!.status) }}
                </span>
              </div>

              <div style="display:flex; flex-direction:column; gap:12px; padding-top:4px;">
                <div class="info-row">
                  <span class="info-label">Mês</span>
                  <span style="font-family:var(--font-mono);">{{ job()!.job_month ?? '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Formato</span>
                  <span>{{ job()!.export_format }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Leads</span>
                  <span style="color:var(--green-light); font-family:var(--font-mono);">
                    {{ job()!.leads_found }} / {{ job()!.leads_limit }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Criado em</span>
                  <span style="font-size:13px; color:var(--text-muted);">
                    {{ job()!.created_at | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
                @if (job()!.finished_at) {
                  <div class="info-row">
                    <span class="info-label">Finalizado em</span>
                    <span style="font-size:13px; color:var(--text-muted);">
                      {{ job()!.finished_at | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                }
              </div>

              @if (job()!.error_message) {
                <div class="alert alert--error" style="margin-top:16px; font-size:13px;">
                  <span>{{ job()!.error_message }}</span>
                </div>
              }
            </div>

            <!-- Log de eventos -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">📡 Log de eventos</span>
                <span class="badge badge--gray">{{ events().length }}</span>
              </div>
              @if (events().length === 0) {
                <p style="color:var(--text-faint); font-size:13px; text-align:center; padding:16px;">
                  Nenhum evento ainda
                </p>
              } @else {
                <div class="events-list">
                  @for (ev of events(); track ev.id) {
                    <div [class]="'event-item event-item--' + ev.level.toLowerCase()">
                      <span class="event-level">{{ ev.level }}</span>
                      <span class="event-msg">{{ ev.message }}</span>
                      <span class="event-time">{{ ev.ts | date:'HH:mm:ss' }}</span>
                    </div>
                  }
                </div>
              }
            </div>

          </div>

          <!-- Leads -->
          @if (leads().length > 0) {
            <div class="card" style="margin-top:24px;">
              <div class="card-header">
                <span class="card-title">📞 Leads gerados</span>
                <span class="badge badge--green">{{ leads().length }}</span>
              </div>
              <div class="table-wrapper" style="border:none; border-radius:0;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Site</th>
                      <th>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (lead of leads(); track lead.id) {
                      <tr>
                        <td>{{ lead.name }}</td>
                        <td style="font-family:var(--font-mono); font-size:13px;">
                          {{ lead.phone_e164 ?? lead.phone_raw ?? '—' }}
                        </td>
                        <td>
                          @if (lead.website_url) {
                            <a [href]="lead.website_url" target="_blank"
                              style="color:var(--purple-light); font-size:13px;">Link ↗</a>
                          } @else {
                            <span style="color:var(--text-faint);">—</span>
                          }
                        </td>
                        <td>
                          @if (lead.whatsapp_url) {
                            <a [href]="lead.whatsapp_url" target="_blank"
                              class="btn btn--primary btn--sm">💬</a>
                          } @else {
                            <span style="color:var(--text-faint);">—</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`
    .job-detail { max-width: 1000px; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 20px;
    }
    .info-row {
      display: flex; justify-content: space-between;
      align-items: center; font-size: 14px;
    }
    .info-label {
      color: var(--text-muted); font-size: 12px;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .events-list {
      display: flex; flex-direction: column;
      gap: 6px; max-height: 320px; overflow-y: auto;
    }
    .event-item {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 8px 10px; border-radius: var(--radius-sm);
      font-size: 12px; background: var(--surface-2);
    }
    .event-item--info  { border-left: 3px solid var(--blue); }
    .event-item--warn  { border-left: 3px solid var(--yellow); }
    .event-item--error { border-left: 3px solid var(--red); }
    .event-level {
      font-family: var(--font-mono); font-weight: 700;
      font-size: 10px; min-width: 36px;
    }
    .event-msg  { flex: 1; color: var(--text-muted); line-height: 1.4; }
    .event-time { color: var(--text-faint); white-space: nowrap; font-family: var(--font-mono); }
    @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }
  `],
})
export class JobDetailComponent implements OnInit, OnDestroy {
  private route   = inject(ActivatedRoute);
  private jobsSvc = inject(JobsService);

  job     = signal<Job | null>(null);
  leads   = signal<Lead[]>([]);
  events  = signal<JobEvent[]>([]);
  loading = signal(true);

  private pollTimer: any;

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
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadAll(id);
  }

  loadAll(id: string) {
    this.jobsSvc.getJob(id).subscribe({
      next: job => {
        this.job.set(job);
        this.loading.set(false);
        clearInterval(this.pollTimer);
        if (['QUEUED', 'RUNNING'].includes(job.status)) {
          this.pollTimer = setInterval(() => this.loadAll(id), 5000);
        }
      },
      error: () => this.loading.set(false),
    });
    this.jobsSvc.getEvents(id).subscribe(evs  => this.events.set(evs));
    this.jobsSvc.getLeads(id).subscribe(leads => this.leads.set(leads));
  }

  download() {
    const id = this.job()!.id;
    this.jobsSvc.downloadCsv(id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `leads-${id.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  ngOnDestroy() { clearInterval(this.pollTimer); }
}

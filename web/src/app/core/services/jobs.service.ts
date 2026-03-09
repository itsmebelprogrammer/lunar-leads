import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Job {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED';
  job_month: string | null;
  state_id: number;
  niche_id: number;
  export_format: string;
  leads_found: number;
  leads_limit: number;
  created_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export interface JobCreate {
  state_id: number;
  niche_id: number;
  job_month: string;
  export_format?: string;
  selected_columns?: string[];
}

export interface Quota {
  month: string;
  leads_used: number;
  leads_limit: number;
}

export interface Lead {
  id: string;
  name: string;
  phone_raw: string | null;
  phone_e164: string | null;
  website_url: string | null;
  whatsapp_url: string | null;
}

export interface JobEvent {
  id: string;
  ts: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface State {
  id: number;
  name: string;
  uf: string;
}

export interface Niche {
  id: number;
  slug: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly api = environment.apiUrl;
  private http = inject(HttpClient);

  getStates() {
    return this.http.get<State[]>(`${this.api}/catalog/states`);
  }

  getNiches() {
    return this.http.get<Niche[]>(`${this.api}/catalog/niches`);
  }

  getQuota() {
    return this.http.get<Quota>(`${this.api}/jobs/quota`);
  }

  createJob(body: JobCreate) {
    return this.http.post<Job>(`${this.api}/jobs`, body);
  }

  listJobs() {
    return this.http.get<Job[]>(`${this.api}/jobs`);
  }

  getJob(id: string) {
    return this.http.get<Job>(`${this.api}/jobs/${id}`);
  }

  getEvents(id: string) {
    return this.http.get<JobEvent[]>(`${this.api}/jobs/${id}/events`);
  }

  getLeads(id: string) {
    return this.http.get<Lead[]>(`${this.api}/jobs/${id}/leads`);
  }

  downloadCsv(id: string) {
    return this.http.get(`${this.api}/jobs/${id}/download`, { responseType: 'blob' });
  }
}

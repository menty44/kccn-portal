import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

export type PortalRole = 'member' | 'administrator';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly baseUrl = signal('http://localhost:3000');
  readonly accessToken = signal('');
  readonly role = signal<PortalRole>('member');
  private expiryTimer?: ReturnType<typeof setTimeout>;

  startSession(accessToken: string, expiresIn?: number): void {
    this.logout();
    this.accessToken.set(accessToken);
    if (expiresIn && expiresIn > 0) {
      this.expiryTimer = setTimeout(() => {
        this.logout();
        void this.router.navigate(['/login']);
      }, expiresIn * 1000);
    }
  }

  logout(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    this.accessToken.set('');
    this.role.set('member');
  }

  get(path: string, requiresAuth = false): Observable<unknown> {
    const baseUrl = this.baseUrl().trim().replace(/\/$/, '');
    if (!baseUrl) {
      return throwError(() => new Error('Set the API base URL to load live data.'));
    }

    if (requiresAuth && !this.accessToken().trim()) {
      return throwError(() => new Error('This page requires a bearer access token.'));
    }

    const headers = requiresAuth
      ? new HttpHeaders({ Authorization: `Bearer ${this.accessToken().trim()}` })
      : undefined;

    return this.http.get(`${baseUrl}/v1${path}`, { headers });
  }

  post(path: string, body: unknown, requiresAuth = false): Observable<unknown> {
    return this.request('POST', path, body, requiresAuth);
  }

  patch(path: string, body: unknown, requiresAuth = true): Observable<unknown> {
    return this.request('PATCH', path, body, requiresAuth);
  }

  private request(method: 'POST' | 'PATCH', path: string, body: unknown, requiresAuth: boolean): Observable<unknown> {
    const baseUrl = this.baseUrl().trim().replace(/\/$/, '');
    if (!baseUrl) return throwError(() => new Error('Set the API base URL before submitting this form.'));
    if (requiresAuth && !this.accessToken().trim()) return throwError(() => new Error('This action requires a bearer access token.'));

    const headers = requiresAuth ? new HttpHeaders({ Authorization: `Bearer ${this.accessToken().trim()}` }) : undefined;
    return this.http.request(method, `${baseUrl}/v1${path}`, { body, headers });
  }
}

import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-account-page',
  imports: [JsonPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Member hub</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-white">My account</h1><p class="mt-2 text-slate-400">Manage your profile, preferences, activity, and saved content.</p></div>
        <button (click)="load()" [disabled]="loading()" class="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{{ loading() ? 'Refreshing…' : 'Refresh account' }}</button>
      </div>
      @if (error()) { <div class="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{{ error() }}</div> }
      <div class="grid gap-6 xl:grid-cols-3">
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5 xl:col-span-1"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Profile</p><h2 class="mt-1 text-xl font-bold text-white">{{ profileName() }}</h2><div class="mt-5 space-y-3 text-sm"><div class="rounded-xl bg-slate-950 p-3"><p class="text-xs text-slate-500">Email</p><p class="mt-1 text-slate-200">{{ field(profile(), 'email') || 'Not available' }}</p></div><div class="rounded-xl bg-slate-950 p-3"><p class="text-xs text-slate-500">Phone</p><p class="mt-1 text-slate-200">{{ field(profile(), 'phone') || 'Not available' }}</p></div></div></article>
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5 xl:col-span-2"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Your activity</p><h2 class="mt-1 text-xl font-bold text-white">Upcoming & saved</h2><div class="mt-4 grid gap-3 md:grid-cols-2"><div class="rounded-xl bg-slate-950 p-4"><p class="text-sm font-semibold text-white">My events</p><p class="mt-1 text-2xl font-bold text-emerald-300">{{ events().length }}</p><p class="text-xs text-slate-500">upcoming or attended</p></div><div class="rounded-xl bg-slate-950 p-4"><p class="text-sm font-semibold text-white">Saved content</p><p class="mt-1 text-2xl font-bold text-emerald-300">{{ favorites().length }}</p><p class="text-xs text-slate-500">favorites</p></div></div><div class="mt-5 border-t border-white/10 pt-4"><p class="text-sm font-semibold text-white">Preferences</p><pre class="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-400">{{ preferences() | json }}</pre></div></article>
      </div>
      <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Security</p><h2 class="mt-1 text-xl font-bold text-white">Recent account activity</h2><div class="mt-4 space-y-2">@for (entry of securityLog(); track $index) { <div class="rounded-lg border border-white/5 bg-slate-950 px-4 py-3 text-sm text-slate-300">{{ display(entry) }}</div> } @empty { <p class="py-4 text-sm text-slate-500">No security activity loaded yet.</p> }</div></article>
    </div>
  `,
})
export class AccountPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly loading = signal(false); readonly error = signal(''); readonly profile = signal<unknown>(null); readonly preferences = signal<unknown>({}); readonly favorites = signal<unknown[]>([]); readonly events = signal<unknown[]>([]); readonly securityLog = signal<unknown[]>([]);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ profile: this.api.get('/me', true), preferences: this.api.get('/me/preferences', true), favorites: this.api.get('/me/favorites', true), events: this.api.get('/me/events', true), securityLog: this.api.get('/me/security-log', true) }).subscribe({
      next: (data) => { this.profile.set(data.profile); this.preferences.set(data.preferences); this.favorites.set(this.asList(data.favorites)); this.events.set(this.asList(data.events)); this.securityLog.set(this.asList(data.securityLog)); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); },
    });
  }
  profileName(): string { return `${this.field(this.profile(), 'firstName')} ${this.field(this.profile(), 'lastName')}`.trim() || 'Your profile'; }
  field(value: unknown, key: string): string { const object = this.object(value); return typeof object?.[key] === 'string' ? object[key] as string : ''; }
  display(value: unknown): string { return typeof value === 'string' ? value : this.field(value, 'message') || this.field(value, 'action') || JSON.stringify(value); }
  private asList(value: unknown): unknown[] { if (Array.isArray(value)) return value; const object = this.object(value); return Array.isArray(object?.['data']) ? object['data'] : Array.isArray(object?.['items']) ? object['items'] : []; }
  private object(value: unknown): Record<string, unknown> | null { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }
}

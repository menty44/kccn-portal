import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-community-page',
  template: `
    <div class="space-y-6">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Together</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-white">Community</h1><p class="mt-2 text-slate-400">Connect through prayer, groups, and church updates.</p></div>
        <button (click)="load()" [disabled]="loading()" class="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{{ loading() ? 'Refreshing…' : 'Refresh community' }}</button>
      </div>
      @if (error()) { <div class="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{{ error() }}</div> }
      <div class="grid gap-6 xl:grid-cols-3">
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5 xl:col-span-2"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Prayer wall</p><h2 class="mt-1 text-xl font-bold text-white">Pray with the church</h2><div class="mt-4 space-y-3">@for (request of prayers(); track $index) { <div class="rounded-xl bg-slate-950 p-4"><p class="font-medium text-white">{{ text(request) }}</p><p class="mt-2 text-xs text-slate-500">{{ author(request) }}</p></div> } @empty { <p class="py-8 text-sm text-slate-500">No prayer requests loaded yet.</p> }</div></article>
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Updates</p><h2 class="mt-1 text-xl font-bold text-white">Notifications</h2><div class="mt-4 space-y-2">@for (item of notifications(); track $index) { <div class="rounded-lg border border-white/5 bg-slate-950 p-3 text-sm text-slate-300">{{ text(item) }}</div> } @empty { <p class="py-8 text-sm text-slate-500">No notifications loaded yet.</p> }</div></article>
      </div>
      <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Find your people</p><h2 class="mt-1 text-xl font-bold text-white">Groups</h2><div class="mt-4 grid gap-3 md:grid-cols-2">@for (group of groups(); track $index) { <div class="rounded-xl bg-slate-950 p-4"><p class="font-semibold text-white">{{ text(group) }}</p><p class="mt-1 text-sm text-slate-400">{{ detail(group) }}</p></div> } @empty { <p class="py-5 text-sm text-slate-500">No groups loaded yet.</p> }</div></article>
    </div>
  `,
})
export class CommunityPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly loading = signal(false); readonly error = signal(''); readonly prayers = signal<unknown[]>([]); readonly groups = signal<unknown[]>([]); readonly notifications = signal<unknown[]>([]);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ prayers: this.api.get('/prayer-wall', true), groups: this.api.get('/groups', true), notifications: this.api.get('/notifications', true) }).subscribe({
      next: (data) => { this.prayers.set(this.asList(data.prayers)); this.groups.set(this.asList(data.groups)); this.notifications.set(this.asList(data.notifications)); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); },
    });
  }
  text(value: unknown): string { return this.field(value, ['title', 'message', 'content', 'name']) || 'Community update'; }
  detail(value: unknown): string { return this.field(value, ['description', 'summary', 'category']) || 'Join this conversation and connect with others.'; }
  author(value: unknown): string { return this.field(value, ['author', 'submittedBy', 'createdAt']) || 'KCCN community'; }
  private field(value: unknown, keys: string[]): string { const object = this.object(value); for (const key of keys) if (typeof object?.[key] === 'string') return object[key] as string; return ''; }
  private asList(value: unknown): unknown[] { if (Array.isArray(value)) return value; const object = this.object(value); return Array.isArray(object?.['data']) ? object['data'] : Array.isArray(object?.['items']) ? object['items'] : []; }
  private object(value: unknown): Record<string, unknown> | null { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }
}

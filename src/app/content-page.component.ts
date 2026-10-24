import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-content-page',
  template: `
    <div class="space-y-6">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Discover</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-white">Content & events</h1><p class="mt-2 text-slate-400">Sermons, live services, and gatherings from your church.</p></div>
        <button (click)="load()" [disabled]="loading()" class="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{{ loading() ? 'Refreshing…' : 'Refresh content' }}</button>
      </div>
      @if (error()) { <div class="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{{ error() }}</div> }
      <div class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Featured</p><h2 class="mt-1 text-xl font-bold">Sermons</h2><div class="mt-4 space-y-3">@for (item of sermons(); track $index) { <div class="rounded-xl bg-slate-950 p-3"><p class="font-semibold text-white">{{ title(item) }}</p><p class="mt-1 text-sm text-slate-400">{{ description(item) }}</p></div> } @empty { <p class="py-8 text-sm text-slate-500">No sermon data loaded yet.</p> }</div></article>
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Happening now</p><h2 class="mt-1 text-xl font-bold">Live service</h2><div class="mt-4 rounded-xl bg-slate-950 p-4"><p class="font-semibold text-white">{{ title(live()) }}</p><p class="mt-1 text-sm text-slate-400">{{ description(live()) }}</p></div><p class="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming events</p><div class="mt-3 space-y-2">@for (item of events(); track $index) { <div class="flex justify-between gap-3 rounded-lg border border-white/5 p-3"><span class="text-sm font-medium text-white">{{ title(item) }}</span><span class="text-xs text-slate-400">{{ date(item) }}</span></div> } @empty { <p class="py-4 text-sm text-slate-500">No events loaded yet.</p> }</div></article>
      </div>
    </div>
  `,
})
export class ContentPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly loading = signal(false); readonly error = signal(''); readonly sermons = signal<unknown[]>([]); readonly live = signal<unknown>(null); readonly events = signal<unknown[]>([]);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ sermons: this.api.get('/sermons/featured'), live: this.api.get('/live/status'), events: this.api.get('/events') }).subscribe({
      next: ({ sermons, live, events }) => { this.sermons.set(this.asList(sermons)); this.live.set(live); this.events.set(this.asList(events)); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); },
    });
  }
  title(value: unknown): string { return this.field(value, ['title', 'name', 'message']) || 'No title available'; }
  description(value: unknown): string { return this.field(value, ['description', 'summary', 'status']) || 'Details will appear when connected to the API.'; }
  date(value: unknown): string { return this.field(value, ['date', 'startsAt', 'start_date']) || 'Date pending'; }
  private asList(value: unknown): unknown[] { return Array.isArray(value) ? value : this.object(value)?.['data'] as unknown[] ?? this.object(value)?.['items'] as unknown[] ?? []; }
  private field(value: unknown, keys: string[]): string { const object = this.object(value); for (const key of keys) { if (typeof object?.[key] === 'string') return object[key] as string; } return ''; }
  private object(value: unknown): Record<string, unknown> | null { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }
}

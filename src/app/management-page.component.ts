import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './api.service';

interface ManagementConfig { title: string; description: string; endpoint: string; createLabel: string; }
const configs: Record<string, ManagementConfig> = {
  users: { title: 'Users & roles', description: 'View members and manage account access.', endpoint: '/users', createLabel: 'Invite user' },
  sermons: { title: 'Sermons & series', description: 'Organize the sermon library and featured content.', endpoint: '/sermons', createLabel: 'Add sermon' },
  prayers: { title: 'Prayer requests', description: 'Moderate requests and support your church community.', endpoint: '/prayer-requests', createLabel: 'Create request' },
  events: { title: 'Events', description: 'Manage gatherings, RSVPs, and event details.', endpoint: '/events', createLabel: 'Create event' },
  giving: { title: 'Giving & funds', description: 'Configure giving funds and review contribution settings.', endpoint: '/giving/funds', createLabel: 'Add fund' },
  media: { title: 'Media library', description: 'Review uploaded media and begin new upload workflows.', endpoint: '/media', createLabel: 'Add media' },
  notifications: { title: 'Notifications', description: 'Publish and manage member communications.', endpoint: '/notifications', createLabel: 'New notification' },
};

@Component({
  selector: 'app-management-page',
  imports: [FormsModule],
  template: `
    <div class="space-y-6"><div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Administration</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-white">{{ config().title }}</h1><p class="mt-2 text-slate-400">{{ config().description }}</p></div><div class="flex gap-3"><button (click)="load()" class="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/5">Refresh</button><button (click)="showForm.set(!showForm())" class="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950">{{ config().createLabel }}</button></div></div>
    @if (error()) { <div class="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{{ error() }}</div> }
    @if (showForm()) { <form (ngSubmit)="create()" class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><label class="text-sm font-medium text-slate-300">Request data <span class="font-normal text-slate-500">(JSON)</span><textarea [(ngModel)]="payload" name="payload" rows="7" class="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 p-3 font-mono text-xs text-slate-200 outline-none focus:border-emerald-400"></textarea></label><div class="mt-4 flex gap-3"><button class="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">Submit</button><button type="button" (click)="showForm.set(false)" class="text-sm text-slate-400">Cancel</button></div></form> }
    <section class="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60"><div class="flex items-center justify-between border-b border-white/10 px-5 py-4"><p class="font-semibold">Records</p><span class="text-sm text-slate-400">{{ items().length }} loaded</span></div><div class="divide-y divide-white/10">@for (item of items(); track $index) { <div class="flex items-center justify-between gap-4 px-5 py-4"><div class="min-w-0"><p class="truncate font-medium text-white">{{ title(item) }}</p><p class="mt-1 truncate text-sm text-slate-400">{{ description(item) }}</p></div><button class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5">Manage</button></div> } @empty { <p class="px-5 py-12 text-center text-sm text-slate-500">{{ loading() ? 'Loading records…' : 'No records loaded. Connect the API and refresh this page.' }}</p> }</div></section></div>
  `,
})
export class ManagementPageComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute);
  readonly section = signal(this.route.snapshot.data['section'] as string); readonly config = computed(() => configs[this.section()]);
  readonly items = signal<unknown[]>([]); readonly loading = signal(false); readonly error = signal(''); readonly showForm = signal(false); payload = '{\n  \n}';
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.error.set(''); this.api.get(this.config().endpoint, true).subscribe({ next: data => { this.items.set(this.asList(data)); this.loading.set(false); }, error: (error: Error) => { this.error.set(error.message); this.loading.set(false); } }); }
  create(): void { try { this.api.post(this.config().endpoint, JSON.parse(this.payload), true).subscribe({ next: () => { this.showForm.set(false); this.load(); }, error: (error: Error) => this.error.set(error.message) }); } catch { this.error.set('Request data must contain valid JSON.'); } }
  title(item: unknown): string { return this.field(item, ['title', 'name', 'email', 'subject']) || 'Untitled record'; } description(item: unknown): string { return this.field(item, ['description', 'summary', 'status', 'role']) || 'No additional details'; }
  private field(item: unknown, keys: string[]): string { if (!item || typeof item !== 'object') return String(item ?? ''); const record = item as Record<string, unknown>; for (const key of keys) if (typeof record[key] === 'string') return record[key] as string; return ''; }
  private asList(value: unknown): unknown[] { if (Array.isArray(value)) return value; if (value && typeof value === 'object') { const object = value as Record<string, unknown>; if (Array.isArray(object['data'])) return object['data']; if (Array.isArray(object['items'])) return object['items']; } return []; }
}

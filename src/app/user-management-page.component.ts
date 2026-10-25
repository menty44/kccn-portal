import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  status: string;
}

@Component({
  selector: 'app-user-management-page',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Administration</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-white">Users & roles</h1><p class="mt-2 text-slate-400">View member profiles, update their details, and manage account access.</p></div>
        <button type="button" (click)="load()" [disabled]="loading()" class="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-60">{{ loading() ? 'Refreshing…' : 'Refresh users' }}</button>
      </div>
      @if (error()) { <div class="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{{ error() }}</div> }
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section class="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
          <div class="flex items-center justify-between border-b border-white/10 px-5 py-4"><p class="font-semibold">Members</p><span class="text-sm text-slate-400">{{ users().length }} loaded</span></div>
          <div class="divide-y divide-white/10">
            @for (user of users(); track user.id) {
              <div class="flex items-center justify-between gap-4 px-5 py-4">
                <div class="min-w-0"><p class="truncate font-medium text-white">{{ user.firstName }} {{ user.lastName }}</p><p class="mt-1 truncate text-sm text-slate-400">{{ user.email || user.phone || 'No contact details' }}</p></div>
                <div class="flex items-center gap-3"><span [class]="isBlocked(user) ? 'bg-rose-300/10 text-rose-200' : 'bg-emerald-300/10 text-emerald-200'" class="rounded-full px-2.5 py-1 text-xs font-semibold">{{ user.status || 'active' }}</span><button type="button" (click)="manage(user)" class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5">Manage</button></div>
              </div>
            } @empty { <p class="px-5 py-12 text-center text-sm text-slate-500">{{ loading() ? 'Loading members…' : 'No users loaded.' }}</p> }
          </div>
        </section>
        <section class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          @if (selectedUser()) {
            <p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Member profile</p><h2 class="mt-1 text-xl font-bold text-white">Manage {{ selectedUser()!.firstName }}</h2>
            <form (ngSubmit)="update()" class="mt-5 flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4"><label class="text-sm font-medium text-slate-300">First name<input [(ngModel)]="editUser.firstName" name="firstName" required class="field" /></label><label class="text-sm font-medium text-slate-300">Last name<input [(ngModel)]="editUser.lastName" name="lastName" required class="field" /></label></div>
              <label class="text-sm font-medium text-slate-300">Email<input [(ngModel)]="editUser.email" name="email" type="email" class="field" /></label>
              <label class="text-sm font-medium text-slate-300">Phone<input [(ngModel)]="editUser.phone" name="phone" class="field" /></label>
              <div class="grid grid-cols-2 gap-4"><label class="text-sm font-medium text-slate-300">Gender<input [(ngModel)]="editUser.gender" name="gender" class="field" /></label><label class="text-sm font-medium text-slate-300">Country<input [(ngModel)]="editUser.country" name="country" class="field" /></label></div>
              <button [disabled]="saving()" class="mt-1 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-60">{{ saving() ? 'Saving…' : 'Save changes' }}</button>
            </form>
            <button type="button" (click)="toggleBlock()" [disabled]="saving()" [class]="isBlocked(selectedUser()!) ? 'border-emerald-300/30 text-emerald-200 hover:bg-emerald-300/10' : 'border-rose-300/30 text-rose-200 hover:bg-rose-300/10'" class="mt-3 w-full rounded-lg border px-4 py-3 text-sm font-bold disabled:opacity-60">{{ isBlocked(selectedUser()!) ? 'Reactivate account' : 'Block account' }}</button>
          } @else { <p class="pt-20 text-center text-sm text-slate-500">Select <span class="font-semibold text-slate-300">Manage</span> to view and edit a member.</p> }
        </section>
      </div>
    </div>
  `,
  styles: ['.field { display:block; width:100%; margin-top:.4rem; border-radius:.5rem; border:1px solid rgb(255 255 255 / .1); background:#020617; padding:.7rem .8rem; color:white; outline:none; } .field:focus { border-color:#34d399; }'],
})
export class UserManagementPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly users = signal<UserRecord[]>([]);
  readonly selectedUser = signal<UserRecord | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  editUser: UserRecord = this.emptyUser();

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.get('/users', true).subscribe({
      next: (response) => { this.users.set(this.toUsers(response)); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); },
    });
  }

  manage(user: UserRecord): void {
    this.selectedUser.set(user);
    this.editUser = { ...user };
  }

  update(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.saving.set(true);
    this.error.set('');
    const { id, status, ...payload } = this.editUser;
    this.api.patch(`/users/${user.id}`, payload).subscribe({
      next: () => { this.replaceUser({ ...this.editUser, id: user.id, status }); this.saving.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.saving.set(false); },
    });
  }

  toggleBlock(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.saving.set(true);
    this.error.set('');
    const action = this.isBlocked(user) ? 'reactivate' : 'suspend';
    this.api.post(`/users/${user.id}/${action}`, {}, true).subscribe({
      next: () => {
        this.replaceUser({ ...user, status: action === 'suspend' ? 'suspended' : 'active' });
        this.saving.set(false);
      },
      error: (error: Error) => { this.error.set(error.message); this.saving.set(false); },
    });
  }

  isBlocked(user: UserRecord): boolean { return ['blocked', 'suspended', 'inactive'].includes(user.status.toLowerCase()); }

  private replaceUser(user: UserRecord): void {
    this.users.update((users) => users.map((item) => item.id === user.id ? user : item));
    this.selectedUser.set(user);
    this.editUser = { ...user };
  }

  private toUsers(value: unknown): UserRecord[] {
    const data = Array.isArray(value) ? value : value && typeof value === 'object'
      ? ((value as Record<string, unknown>)['data'] ?? (value as Record<string, unknown>)['items'])
      : [];
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const id = Number(record['id'] ?? record['userid']);
      if (!Number.isInteger(id) || id <= 0) return [];
      return [{
        id,
        firstName: this.string(record['firstName']),
        lastName: this.string(record['lastName']),
        email: this.string(record['email']),
        phone: this.string(record['phone']),
        gender: this.string(record['gender']),
        country: this.string(record['country']),
        status: this.string(record['status']) || 'active',
      }];
    });
  }

  private string(value: unknown): string { return typeof value === 'string' ? value : ''; }
  private emptyUser(): UserRecord { return { id: 0, firstName: '', lastName: '', email: '', phone: '', gender: '', country: '', status: '' }; }
}

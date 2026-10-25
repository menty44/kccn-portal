import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <main class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-white/10 bg-slate-950/90 px-5 py-4 backdrop-blur lg:px-8">
        <div class="mx-auto flex max-w-7xl items-center justify-between">
          <a routerLink="/content" class="flex items-center gap-3">
            <span
              class="grid size-10 place-items-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950"
              >K</span
            >
            <span
              ><span class="block text-sm font-bold tracking-wide text-white">KCCN Portal</span
              ><span class="block text-xs text-slate-400">Member services</span></span
            >
          </a>
          <div class="flex items-center gap-3">
            <!-- <span
              class="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200 sm:block"
              >Live API mode</span
            > -->
            <button
              type="button"
              (click)="logout()"
              class="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >Log out</button
            >
          </div>
        </div>
      </header>
      <div
        class="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8"
      >
        <aside class="rounded-2xl border border-white/10 bg-slate-900/60 p-3 lg:self-start">
          <p class="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            Explore
          </p>
          <a
            routerLink="/content"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >Content & events</a
          >
          <a
            routerLink="/audio-sermons"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >Audio Sermons</a
          >
          <a
            routerLink="/radio"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >Radio</a
          >
           <a
            routerLink="/giving"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >Giving</a
          >
          <a
            routerLink="/account"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >My account</a
          >
          <a
            routerLink="/community"
            routerLinkActive="bg-emerald-400 !text-slate-950"
            class="mb-4 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >Community</a
          >
          <div class="mb-4 border-t border-white/10 pt-4">
            <p class="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Administration
            </p>
            @if (api.role() === 'administrator') {
              <a
                routerLink="/manage/users"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Users & roles</a
              >
              <a
                routerLink="/manage/sermons"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Sermons & series</a
              >
              <a
                routerLink="/manage/prayers"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Prayer requests</a
              >
              <a
                routerLink="/manage/events"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Events</a
              >
              <a
                routerLink="/manage/giving"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Giving & funds</a
              >
              <a
                routerLink="/manage/media"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Media library</a
              >
              <a
                routerLink="/manage/notifications"
                routerLinkActive="bg-emerald-400 !text-slate-950"
                class="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >Notifications</a
              >
            } @else {
              <p class="px-3 text-xs leading-5 text-slate-500">
                Administrator tools are shown when your account has an administrator role.
              </p>
            }
          </div>
          <div class="border-t border-white/10 px-1 pt-4">
            <!-- <label class="block text-xs font-semibold text-slate-400"
              >API base URL
              <input
                [ngModel]="api.baseUrl()"
                (ngModelChange)="api.baseUrl.set($event)"
                name="baseUrl"
                placeholder="https://api.example.org"
                class="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />
            </label> -->
            <label class="mt-3 block text-xs font-semibold text-slate-400"
              >Portal role
              <select
                [ngModel]="api.role()"
                (ngModelChange)="api.role.set($event)"
                name="role"
                class="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
              >
                <option value="member">Member</option>
                <option value="administrator">Administrator</option>
              </select>
            </label>
            <!-- <label class="mt-3 block text-xs font-semibold text-slate-400"
              >Access token
              <input
                [ngModel]="api.accessToken()"
                (ngModelChange)="api.accessToken.set($event)"
                name="accessToken"
                type="password"
                autocomplete="off"
                placeholder="Bearer token"
                class="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />
            </label>
            <p class="mt-3 text-xs leading-5 text-slate-500">
              Tokens are used only for this tab and are never stored.
            </p>
            <button
              type="button"
              (click)="logout()"
              class="mt-4 w-full rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/20"
              >Log out</button
            > -->
          </div>
        </aside>
        <section><router-outlet /></section>
      </div>
    </main>
  `,
})
export class DashboardLayoutComponent {
  protected readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.api.logout();
    void this.router.navigate(['/login']);
  }
}

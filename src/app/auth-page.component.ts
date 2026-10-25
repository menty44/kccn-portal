import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';

type AuthMode = 'login' | 'register' | 'otp' | 'reset';

interface AuthConfig {
  title: string;
  description: string;
  endpoint: string;
  submit: string;
}

interface CountryOption {
  name: string;
  flag: string;
}

const countries: CountryOption[] = [
  { name: 'Uganda', flag: '🇺🇬' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'South Sudan', flag: '🇸🇸' },
  { name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' },
];

const configs: Record<AuthMode, AuthConfig> = {
  login: { title: 'Welcome back', description: 'Sign in to continue to your KCCN portal.', endpoint: '/auth/login', submit: 'Sign in' },
  register: { title: 'Create your account', description: 'Join the KCCN community and keep your church life connected.', endpoint: '/auth/register', submit: 'Create account' },
  otp: { title: 'Verify your account', description: 'Enter the verification code sent to your email or phone.', endpoint: '/auth/otp/verify', submit: 'Verify code' },
  reset: { title: 'Reset your password', description: 'We will send instructions to your registered email address.', endpoint: '/auth/reset-password', submit: 'Send reset link' },
};

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen bg-slate-950 px-5 py-8 text-slate-100 lg:grid-cols-2 lg:p-0">
      <section class="hidden flex-col justify-between bg-emerald-400 p-12 text-slate-950 lg:flex"><a routerLink="/content" class="flex items-center gap-3 font-bold"><span class="grid size-10 place-items-center rounded-xl bg-slate-950 text-lg text-emerald-300">K</span>KCCN Portal</a><div><p class="text-sm font-bold uppercase tracking-[0.18em]">Church, connected</p><h1 class="mt-4 max-w-md text-5xl font-black leading-tight">Everything your church needs in one place.</h1><p class="mt-5 max-w-md text-lg leading-8 text-slate-800">Discover sermons, join groups, manage your account, and stay connected with your community.</p></div><p class="text-sm font-medium">Kampala Christian Community Network</p></section>
      <section class="flex items-center justify-center"><div class="w-full max-w-md"><a routerLink="/content" class="mb-12 flex items-center gap-3 font-bold lg:hidden"><span class="grid size-10 place-items-center rounded-xl bg-emerald-400 text-lg text-slate-950">K</span>KCCN Portal</a><p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Secure access</p><h1 class="mt-2 text-3xl font-bold">{{ config().title }}</h1><p class="mt-2 text-slate-400">{{ config().description }}</p>
        @if (error()) { <div class="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{{ error() }}</div> }
        @if (success()) { <div class="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{{ success() }}</div> }
        <form (ngSubmit)="submit()" class="mt-8 flex flex-col gap-5">
          @if (mode() === 'register') { <div class="grid gap-5 sm:grid-cols-2"><label class="text-sm font-medium text-slate-300">First name<input [(ngModel)]="firstName" name="firstName" required class="field" /></label><label class="text-sm font-medium text-slate-300">Last name<input [(ngModel)]="lastName" name="lastName" required class="field" /></label></div> }
          @if (mode() === 'otp' || userId) {
            <input [(ngModel)]="userId" name="userId" type="hidden" />
            <label class="text-sm font-medium text-slate-300">Verification code<input [(ngModel)]="otp" name="otp" inputmode="numeric" maxlength="8" required class="field tracking-[0.45em]" /></label>
          } @else { <label class="text-sm font-medium text-slate-300">Email address<input [(ngModel)]="email" name="email" type="email" autocomplete="email" required class="field" /></label> }
          @if (mode() === 'register') {
            <label class="text-sm font-medium text-slate-300">Phone number<input [(ngModel)]="phone" name="phone" type="tel" required class="field" /></label>
            <div class="grid gap-5 sm:grid-cols-2">
              <label class="text-sm font-medium text-slate-300">Gender<select [(ngModel)]="gender" name="gender" required class="field"><option value="" disabled>Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
              <label class="text-sm font-medium text-slate-300">Country<select [(ngModel)]="country" name="country" required class="field"><option value="" disabled>Select country</option>@for (countryOption of countries; track countryOption.name) { <option [value]="countryOption.name">{{ countryOption.flag }} {{ countryOption.name }}</option> }</select></label>
            </div>
          }
          @if (mode() === 'login' || mode() === 'register') { <label class="text-sm font-medium text-slate-300">Password<input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" required class="field" /></label> }
          <button [disabled]="submitting()" class="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">{{ submitting() ? 'Submitting…' : config().submit }}</button>
          @if (mode() === 'otp' || userId) {
            <button type="button" (click)="resendOtp()" [disabled]="resending()" class="w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/5 disabled:opacity-60">{{ resending() ? 'Sending new code…' : 'Resend OTP' }}</button>
          }
        </form>
        <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">@if (mode() === 'login') { <a routerLink="/register" class="hover:text-emerald-300">Create account</a><a routerLink="/reset-password" class="hover:text-emerald-300">Forgot password?</a> } @else { <a routerLink="/login" class="hover:text-emerald-300">Back to sign in</a> } @if (mode() === 'register') { <a routerLink="/verify-otp" class="hover:text-emerald-300">Already have a code?</a> }</div>
      </div></section>
    </main>
  `,
  styles: ['.field { display:block; width:100%; margin-top:.4rem; border-radius:.5rem; border:1px solid rgb(255 255 255 / .1); background:#020617; padding:.7rem .8rem; color:white; outline:none; } .field:focus { border-color:#34d399; }'],
})
export class AuthPageComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly mode = signal<AuthMode>((this.route.snapshot.data['mode'] as AuthMode) ?? 'login');
  readonly config = computed(() => configs[this.mode()]);
  readonly submitting = signal(false); readonly error = signal(''); readonly success = signal('');
  readonly resending = signal(false);
  readonly countries = countries;
  firstName = ''; lastName = ''; email = ''; phone = ''; gender = ''; country = 'Uganda'; password = ''; otp = '';
  userId = this.route.snapshot.queryParamMap.get('userid') ?? '';
  submit(): void {
    this.submitting.set(true); this.error.set(''); this.success.set('');
    const mode = this.mode();
    if (mode === 'otp' && (!Number.isInteger(Number(this.userId)) || Number(this.userId) <= 0)) {
      this.error.set('Enter a valid numeric user ID.');
      this.submitting.set(false);
      return;
    }
    const body = mode === 'register'
      ? { firstName: this.firstName, lastName: this.lastName, email: this.email, phone: this.phone, gender: this.gender, country: this.country, password: this.password }
      : mode === 'otp' ? { code: this.otp, userid: Number(this.userId) } : mode === 'login' ? { email: this.email, password: this.password } : { email: this.email };
    this.api.post(this.config().endpoint, body).subscribe({
      next: (response) => {
        const token = this.token(response);
        if (token) this.api.accessToken.set(token);
        if (mode === 'register') {
          const userId = this.userIdFrom(response);
          if (!userId) {
            this.error.set('Registration succeeded, but the API response did not include a user ID for OTP verification.');
            this.submitting.set(false);
            return;
          }
          void this.router.navigate(['/verify-otp'], { queryParams: { userid: userId } });
          return;
        }
        if (mode === 'otp' && !this.isOtpValid(response)) {
          this.error.set('Invalid OTP.');
          this.submitting.set(false);
          return;
        }
        if (mode === 'otp') {
          void this.router.navigate(['/login']);
          return;
        }
        if (mode === 'login' && token) {
          void this.router.navigate(['/content']);
          return;
        }
        if (mode === 'login') {
          this.error.set('Login response did not include an access token.');
          this.submitting.set(false);
          return;
        }
        this.success.set('Request submitted successfully.');
        this.submitting.set(false);
      },
      error: (error: unknown) => { this.error.set(this.backendMessage(error)); this.submitting.set(false); },
    });
  }
  resendOtp(): void {
    if (!Number.isInteger(Number(this.userId)) || Number(this.userId) <= 0) {
      this.error.set('Enter a valid numeric user ID before requesting another OTP.');
      return;
    }
    this.resending.set(true);
    this.error.set('');
    this.success.set('');
    this.api.post('/auth/otp/request', { userid: Number(this.userId) }).subscribe({
      next: () => {
        this.success.set('A new verification code has been requested.');
        this.resending.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.backendMessage(error));
        this.resending.set(false);
      },
    });
  }
  private token(value: unknown): string {
    if (value === null || typeof value !== 'object') return '';
    const response = value as Record<string, unknown>;
    const data = response['data'] as Record<string, unknown> | undefined;
    const token = response['access_token'] ?? data?.['access_token'];
    return typeof token === 'string' ? token : '';
  }
  private userIdFrom(value: unknown): number | null {
    if (value === null || typeof value !== 'object') return null;
    const result = value as Record<string, unknown>;
    const data = result['data'] as Record<string, unknown> | undefined;
    const user = result['user'] as Record<string, unknown> | undefined;
    const candidate = result['userid'] ?? result['userId'] ?? result['id'] ?? user?.['id'] ?? data?.['userid'] ?? data?.['userId'] ?? data?.['id'];
    const parsed = typeof candidate === 'number' ? candidate : typeof candidate === 'string' ? Number(candidate) : Number.NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  private isOtpValid(value: unknown): boolean {
    if (value === null || typeof value !== 'object') return false;
    const data = (value as Record<string, unknown>)['data'];
    return data !== null && typeof data === 'object' && (data as Record<string, unknown>)['status'] === true;
  }
  private backendMessage(value: unknown): string {
    if (value !== null && typeof value === 'object') {
      const response = value as Record<string, unknown>;
      const body = response['error'];
      if (body !== null && typeof body === 'object') {
        const message = (body as Record<string, unknown>)['error'];
        if (message !== null && typeof message === 'object' && typeof (message as Record<string, unknown>)['message'] === 'string') {
          return (message as Record<string, string>)['message'];
        }
        if (typeof (body as Record<string, unknown>)['message'] === 'string') return (body as Record<string, string>)['message'];
      }
      if (typeof response['message'] === 'string') return response['message'] as string;
    }
    return 'Unable to complete this request. Please try again.';
  }
}

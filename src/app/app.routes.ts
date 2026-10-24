import { Routes } from '@angular/router';
import { AccountPageComponent } from './account-page.component';
import { adminGuard } from './admin.guard';
import { AuthPageComponent } from './auth-page.component';
import { CommunityPageComponent } from './community-page.component';
import { ContentPageComponent } from './content-page.component';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { ManagementPageComponent } from './management-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPageComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' } },
  { path: 'verify-otp', component: AuthPageComponent, data: { mode: 'otp' } },
  { path: 'reset-password', component: AuthPageComponent, data: { mode: 'reset' } },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'content', component: ContentPageComponent },
      { path: 'account', component: AccountPageComponent },
      { path: 'community', component: CommunityPageComponent },
      { path: 'manage/users', component: ManagementPageComponent, data: { section: 'users' }, canActivate: [adminGuard] },
      { path: 'manage/sermons', component: ManagementPageComponent, data: { section: 'sermons' }, canActivate: [adminGuard] },
      { path: 'manage/prayers', component: ManagementPageComponent, data: { section: 'prayers' }, canActivate: [adminGuard] },
      { path: 'manage/events', component: ManagementPageComponent, data: { section: 'events' }, canActivate: [adminGuard] },
      { path: 'manage/giving', component: ManagementPageComponent, data: { section: 'giving' }, canActivate: [adminGuard] },
      { path: 'manage/media', component: ManagementPageComponent, data: { section: 'media' }, canActivate: [adminGuard] },
      { path: 'manage/notifications', component: ManagementPageComponent, data: { section: 'notifications' }, canActivate: [adminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'content' },
    ],
  },
  { path: '**', redirectTo: 'content' },
];

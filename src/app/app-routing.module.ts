import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './helpers/auth.guard';
/* Pages (Routes) */
import { AdminComponent } from './pages/admin/admin.component';
import { DiscussionsComponent } from './pages/discussions/discussions.component';
import { HomeComponent } from './pages/home/home.component';
import { JobAdsComponent } from './pages/job-ads/job-ads.component';
import { LoginComponent } from './pages/login/login.component';
import { NetworkComponent } from './pages/network/network.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { adminOnly: true },
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'network',
    component: NetworkComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'job-ads',
    component: JobAdsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'discussions',
    redirectTo: 'discussions/',
    pathMatch: 'full',
  },
  {
    path: 'discussions/:userId',
    component: DiscussionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    redirectTo: 'profile/',
    pathMatch: 'full',
  },
  { path: 'profile/:userId', component: ProfileComponent },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    // BUG: Would use anchorScrolling, but it's broken as hell:
    // https://github.com/angular/angular/issues/30139
    // https://github.com/angular/angular/issues/33240
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* Pages (Routes) */
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NetworkComponent } from './pages/network/network.component';
import { JobAdsComponent } from './pages/job-ads/job-ads.component';
import { DiscussionsComponent } from './pages/discussions/discussions.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { AuthGuard } from './guards/auth.guard'

const routes: Routes = [
	{ path: '', redirectTo: "/home", pathMatch: "full" },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
	{ path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard] },
	{ path: 'network', component: NetworkComponent, canActivate: [AuthGuard] },
	{ path: 'job-ads', component: JobAdsComponent, canActivate: [AuthGuard] },
	{ path: 'discussions', component: DiscussionsComponent, canActivate: [AuthGuard] },
	{ path: 'discussions/:discussionId', component: DiscussionsComponent, canActivate: [AuthGuard] },
	{ path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: 'profile/:userId', component: ProfileComponent },
	{ path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }

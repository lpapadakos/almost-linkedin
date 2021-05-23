import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Angular Material */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
//TODO sidebar needed? (probably, yeah)
import { SidebarComponent } from './components/sidebar/sidebar.component';

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

import { ErrorInterceptor } from './interceptors/error.interceptor';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		SidebarComponent,
		HomeComponent,
		LoginComponent,
		RegisterComponent,
		NetworkComponent,
		JobAdsComponent,
		DiscussionsComponent,
		NotificationsComponent,
		ProfileComponent,
		SettingsComponent,
		NotFoundComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MatToolbarModule,
		MatTabsModule,
		MatInputModule,
		MatCardModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

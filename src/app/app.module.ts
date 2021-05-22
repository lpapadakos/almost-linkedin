import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; //TODO maybe reactive?
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Angular Material */
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';

import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
//TODO needed? (probably, yeah)
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

import { AuthGuard } from './guards/auth.guard';

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
		BrowserAnimationsModule,
		MatSliderModule,
		MatToolbarModule,
		MatTabsModule
	],
	providers: [AuthGuard],
	bootstrap: [AppComponent],
})
export class AppModule {}

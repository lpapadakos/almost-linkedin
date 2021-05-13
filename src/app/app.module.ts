import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';
import { NetworkComponent } from './network/network.component';
import { JobAdsComponent } from './job-ads/job-ads.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
	declarations: [
		AppComponent,
		WelcomeComponent,
		RegisterComponent,
		NetworkComponent,
		JobAdsComponent,
		DiscussionsComponent,
		NotificationsComponent,
		ProfileComponent,
		SettingsComponent,
	],
	imports: [BrowserModule, HttpClientModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}

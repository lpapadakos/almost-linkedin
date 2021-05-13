import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';
import { AppRoutingModule } from './app-routing.module';
@NgModule({
	declarations: [AppComponent, WelcomeComponent, RegisterComponent],
	imports: [BrowserModule, HttpClientModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}

import { registerLocaleData } from '@angular/common';
import localeEl from '@angular/common/locales/el';
import { LOCALE_ID, NgModule } from '@angular/core';
registerLocaleData(localeEl);

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* Angular Material */
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AlertComponent } from './components/alert/alert.component';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { NavComponent } from './components/nav/nav.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { FilterPipe } from './helpers/filter.pipe';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { SecurePipe } from './helpers/secure.pipe';
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

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AlertComponent,
    SidenavComponent,
    ArticleListComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NetworkComponent,
    JobAdsComponent,
    DiscussionsComponent,
    NotificationsComponent,
    ProfileComponent,
    SettingsComponent,
    NotFoundComponent,
    AdminComponent,
    SecurePipe,
    FilterPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
  ],
  providers: [
    SecurePipe,
    { provide: LOCALE_ID, useValue: 'el-GR' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
	{ path: '', component: WelcomeComponent },
	{ path: 'register', component: RegisterComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}

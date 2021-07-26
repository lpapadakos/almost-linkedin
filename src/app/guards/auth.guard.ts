import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(private router: Router, private authService: AuthService) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const user = this.authService.user;

		// Check if logged in
		if (!user) {
			this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
			return false;
		}

		// Check if authorized for this particular route.
		// Some pages are, for example, restricted to the admin
		if (route.data.adminOnly) {
			if (route.data.adminOnly == true && user.role != "admin") {
				this.router.navigate(['/']);
				return false;
			}
		} else if (user.role == "admin") {
			this.router.navigate(['/admin']);
			return false;
		}

		return true;
	}
}

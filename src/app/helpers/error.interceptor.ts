import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserService } from '../services/user.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	constructor(private router: Router, private route: ActivatedRoute, private userService: UserService) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(request).pipe(
			catchError((err) => {
				if (err.status === 401 && !this.router.url.startsWith('/login')) {
					// auto logout if 401 response returned from api
					this.userService.logout();
					location.reload(true);
				}

				const error =
					err.error.error ||
					(err.error.errors && err.error.errors[0].msg) ||
					err.error.message ||
					err.statusText ||
					'Κάτι πήγε στραβα...';
				return throwError(error);
			})
		);
	}
}

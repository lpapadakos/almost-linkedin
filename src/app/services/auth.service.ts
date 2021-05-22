import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	constructor(public jwtHelper: JwtHelperService) { }

	public isAuthenticated(): boolean {
		// Check yeet potential of the stored token
		const token = localStorage.getItem('token');
		return !this.jwtHelper.isTokenExpired(token);
	}
}

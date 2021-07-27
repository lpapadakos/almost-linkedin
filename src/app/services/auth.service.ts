import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private userSubject: BehaviorSubject<User>;
	public _user: Observable<User>;

	constructor(private http: HttpClient) {
		this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
		this._user = this.userSubject.asObservable();
	}

	get user(): User {
		return this.userSubject.value;
	}

	userEmitter(): Observable<User> {
		return this._user;
	}

	login(email: string, password: string) {
		return this.http.post<any>(`${environment.apiUrl}/users/login`, { email, password })
			.pipe(map(user => {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				localStorage.setItem('user', JSON.stringify(user));
				this.userSubject.next(user);
				return user;
			}));
	}

	logout() {
		// remove user from local storage to log user out
		localStorage.removeItem('user');
		this.userSubject.next(null);
	}

	register(user: User) {
		return this.http.post(`${environment.apiUrl}/users/register`, user);
	}

	/* TODO: Admin stuff */
	getAll() {
		if (this.user.role == "admin")
			return this.http.get<User[]>(`${environment.apiUrl}/users`);
	}

	getById(id: string) {
		if (this.user.role == "admin")
			return this.http.get<User[]>(`${environment.apiUrl}/users/${id}`);
	}

	update(id, params) {}

	delete(id: string) {}
}

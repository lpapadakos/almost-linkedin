import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService { // TODO Rename to user service?
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

	register(user: User, img: File) {
		const formData = new FormData();
		formData.append("user", JSON.stringify(user));

		if (img)
			formData.append("image", img);

		return this.http.post(`${environment.apiUrl}/users/register`, formData);
	}

	// To get profile info, etc
	getById(id: string) {
		return this.http.get<User[]>(`${environment.apiUrl}/users/${id}`);
	}
}

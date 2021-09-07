import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Entry, User, ContactRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
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

	// Custom validator: Compare password fields to see if they match
	matchControls(controlName: string, matchingControlName: string) {
		return (formGroup: FormGroup) => {
			const control = formGroup.controls[controlName];
			const matchingControl = formGroup.controls[matchingControlName];

			if (matchingControl.errors && !matchingControl.errors.mustMatch) {
				// return if another validator has already found an error on the matchingControl
				return;
			}

			// set error on matchingControl if validation fails
			if (control.value !== matchingControl.value) {
				matchingControl.setErrors({ mustMatch: true });
			} else {
				matchingControl.setErrors(null);
			}
		};
	}

	register(user: User, img: File) {
		const formData = new FormData();
		formData.append('user', JSON.stringify(user));

		if (img) formData.append('image', img);

		return this.http.post(`${environment.apiUrl}/users/register`, formData);
	}

	login(email: string, password: string) {
		return this.http
			.post<any>(`${environment.apiUrl}/users/login`, {
				email,
				password,
			})
			.pipe(
				map((user) => {
					// store user details and jwt token in local storage to keep user logged in between page refreshes
					localStorage.setItem('user', JSON.stringify(user));
					this.userSubject.next(user);
					return user;
				})
			);
	}

	logout() {
		// remove user from local storage to log user out
		localStorage.removeItem('user');
		this.userSubject.next(null);
	}

	// Profiles
	getAll() {
		return this.http.get<User[]>(`${environment.apiUrl}/users`);
	}

	getById(userId: string) {
		return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
	}

	update(changes: User, img: File) {
		const formData = new FormData();
		formData.append('user', JSON.stringify(changes));

		if (img) formData.append('image', img);

		return this.http.patch(`${environment.apiUrl}/users/${this.userSubject.value._id}`, formData);
	}

	addContactRequest(receiverId: string) {
		return this.http.post(`${environment.apiUrl}/users/${receiverId}/contact-requests`, {});
	}

	getContactRequests() {
		return this.http.get<ContactRequest[]>(
			`${environment.apiUrl}/users/${this.userSubject.value._id}/contact-requests`
		);
	}

	acceptContactRequest(requestId: string) {
		return this.http.patch(
			`${environment.apiUrl}/users/${this.userSubject.value._id}/contact-requests/${requestId}`,
			{}
		);
	}

	deleteContact(requestId: string) {
		return this.http.delete(
			`${environment.apiUrl}/users/${this.userSubject.value._id}/contact-requests/${requestId}`
		);
	}

	getContacts(userId: string) {
		return this.http.get<User[]>(`${environment.apiUrl}/users/${userId}/contacts`);
	}

	addEntry(entryType: string, entry: Entry) {
		return this.http.post(`${environment.apiUrl}/users/${this.userSubject.value._id}/${entryType}`, entry);
	}

	changeEntryStatus(entryType: string, isPublic: boolean) {
		return this.http.patch(`${environment.apiUrl}/users/${this.userSubject.value._id}/${entryType}`, {
			public: isPublic,
		});
	}

	deleteEntry(entryType: string, entryId: string) {
		return this.http.delete(
			`${environment.apiUrl}/users/${this.userSubject.value._id}/${entryType}/${entryId}`
		);
	}

	export(ids: string[], fileType: string) {
		if (this.userSubject.value.role == 'admin') {
			return this.http.post(`${environment.apiUrl}/users/export?type=${fileType}`, ids, {
				responseType: 'blob',
			});
		}
	}
}

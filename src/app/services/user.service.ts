import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Entry, User, ContactRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
	private userSubject: BehaviorSubject<User>;

	constructor(private http: HttpClient) {
		this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
	}

	get user() {
		return this.userSubject.value;
	}

	onUser() {
		return this.userSubject.asObservable();
	}

	// TODO Fix should sync one or other. Custom validator: Compare password fields to see if they match
	equivalentValidator = (firstControlName: string, secondControlName: string) => {
		return (formGroup: FormGroup) => {
			const firstControl = formGroup.get(firstControlName);
			const secondControl = formGroup.get(secondControlName);

			if (firstControl.value !== secondControl.value) {
				return secondControl.setErrors({ notEqual: true });
			}
		};
	};

	register(user: User, img: File) {
		const formData = new FormData();
		formData.append('user', JSON.stringify(user));

		if (img) formData.append('image', img);

		return this.http.post(`${environment.apiUrl}/users/register`, formData);
	}

	login(email: string, password: string) {
		return this.http.post<any>(`${environment.apiUrl}/users/login`, { email, password }).pipe(
			map((user) => {
				// store user details and jwt token in local storage
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

		return this.http.patch(`${environment.apiUrl}/users/${this.userSubject.value._id}`, formData).pipe(
			map((update) => {
				Object.assign(this.userSubject.value, update);

				// update user details and jwt token in local storage
				localStorage.setItem('user', JSON.stringify(this.userSubject.value));
			})
		);
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

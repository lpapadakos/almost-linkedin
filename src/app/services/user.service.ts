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

	private updateLocalStorage() {
		// As can be seen in the constructor, user details are kept up to date in localStorage
		localStorage.setItem('user', JSON.stringify(this.userSubject.value));
	}

	get user() {
		return this.userSubject.value;
	}

	set lastDiscussion(newLastDiscussionId: string) {
		if (this.userSubject.value.lastDiscussion !== newLastDiscussionId) {
			this.userSubject.value.lastDiscussion = newLastDiscussionId;
			this.updateLocalStorage();
		}
	}

	onUser() {
		return this.userSubject.asObservable();
	}

	// Custom validator: Compare password and repeat-password fields
	equivalentValidator(controlName: string, matchingControlName: string) {
		return (formGroup: FormGroup) => {
			const control = formGroup.get(controlName);
			const matchingControl = formGroup.get(matchingControlName);

			matchingControl.setErrors(control.value === matchingControl.value ? null : { mustMatch: true });
		};
	}

	register(user: User, img: File) {
		const formData = new FormData();
		formData.append('user', JSON.stringify(user));

		if (img) formData.append('image', img);

		return this.http.post(`${environment.apiUrl}/users/register`, formData);
	}

	login(email: string, password: string) {
		return this.http.post<any>(`${environment.apiUrl}/users/login`, { email, password }).pipe(
			map((user) => {
				this.userSubject.next(user);
				this.updateLocalStorage();

				return user;
			})
		);
	}

	logout() {
		this.userSubject.next(null);
		localStorage.removeItem('user');
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
				this.updateLocalStorage();

				return update;
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
		if (this.userSubject.value.role === 'admin') {
			return this.http.post(`${environment.apiUrl}/users/export?type=${fileType}`, ids, {
				responseType: 'blob',
			});
		}
	}
}

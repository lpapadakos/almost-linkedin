import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';

@Injectable({
	providedIn: 'root',
})
export class DiscussionService {
	constructor(private http: HttpClient) {}

	summary() {
		return this.http.get<User[]>(`${environment.apiUrl}/discussions`);
	}

	send(userId: string, text: string) {
		return this.http.post(`${environment.apiUrl}/discussions/${userId}`, { text });
	}

	get(userId: string) {
		return this.http.get<Message[]>(`${environment.apiUrl}/discussions/${userId}`);
	}

	getSince(userId: string, moment: number) {
		return this.http.get<Message[]>(`${environment.apiUrl}/discussions/${userId}?since=${moment}`);
	}
}

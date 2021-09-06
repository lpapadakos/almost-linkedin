import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	constructor(private http: HttpClient, private userService: UserService) {}

	getAll() {
		if (this.userService.user.role == 'admin') return this.http.get<User[]>(`${environment.apiUrl}/users`);
	}

	export(ids: string[], fileType: string) {
		if (this.userService.user.role == 'admin') {
			return this.http.post(
				`${environment.apiUrl}/users/export?type=${fileType}`,
				ids,
				{ responseType: 'blob' }
			);
		}
	}
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	constructor(private http: HttpClient, private userService: UserService) {}

	getAll() {
		if (this.userService.user.role == "admin")
			return this.http.get<User[]>(`${environment.apiUrl}/admin/list`);
	}
}

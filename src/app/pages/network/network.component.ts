import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-network',
	templateUrl: './network.component.html',
	styleUrls: ['./network.component.css'],
})
export class NetworkComponent implements OnInit {
	error = '';
	user: User;
	otherUsers: User[];
	contacts: User[];
	searchText: string;

	constructor(private userService: UserService) {}

	ngOnInit(): void {
		this.userService.userEmitter().subscribe((user) => (this.user = user));
		this.userService.getAll().subscribe((users) => {
			this.otherUsers = users;
			this.contacts = this.otherUsers.filter(u => u.contact && u.contact.accepted);
		});
	}
}

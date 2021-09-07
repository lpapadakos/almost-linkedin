import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';

import { AlertService } from '../../services/alert.service';

import { User, ContactRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnChanges {
	@Input() viewedUser: User;

	user: User = this.userService.user;
	topContacts: User[];

	constructor(private alertService: AlertService, private userService: UserService) {}

	ngOnChanges(changes: SimpleChanges) {
		this.userService.getContacts(this.viewedUser._id).subscribe({
			next: (contacts) => {
				this.topContacts = contacts.splice(0, 5);
			},
			error: (error) => {
				this.topContacts = null;
			},
		});
	}

	addContactRequest() {
		this.userService.addContactRequest(this.viewedUser._id).subscribe({
			next: (request: ContactRequest) => {
				this.viewedUser.contact = {
					_id: request._id,
					accepted: false,
				};
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	_deleteContact() {
		this.userService.deleteContact(this.viewedUser.contact._id).subscribe({
			next: () => {
				this.viewedUser.contact = null;
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}
}

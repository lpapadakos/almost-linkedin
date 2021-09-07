import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';

import { User, ContactRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnChanges {
	user: User = this.userService.user;
	topContacts: User[];
	@Input() viewedUser: User;
	@Output() errorEvent = new EventEmitter<string>();

	constructor(private userService: UserService) {}

	ngOnChanges(changes: SimpleChanges): void {
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
				this.errorEvent.emit(error);
			},
		});
	}

	_deleteContact() {
		console.log('delete run');
		this.userService.deleteContact(this.viewedUser.contact._id).subscribe({
			next: () => {
				this.viewedUser.contact = null;
			},
			error: (error) => {
				this.errorEvent.emit(error);
			},
		});
	}
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { User, ContactRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {
	topContacts: User[];
	@Input() user: User;
	@Input() viewedUser: User;
	@Output() errorEvent = new EventEmitter<string>();

	constructor(private userService: UserService) {}

	ngOnInit(): void {
		if (this.viewedUser)
			this.userService.getContacts(this.viewedUser._id).subscribe((contacts) => (this.topContacts = contacts.splice(0, 5)));
	}

	addContactRequest() {
		this.userService.addContactRequest(this.viewedUser._id).subscribe({
			next: (obj) => {
				let contactRequest = <ContactRequest> obj;
				this.viewedUser.contact = { _id: contactRequest._id, accepted: false };
			},
			error: (error) => {
				this.errorEvent.emit(error);
			},
		});
	}

	_deleteContact() {
		console.log("delete run");
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

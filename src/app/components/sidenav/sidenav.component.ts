import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { User } from '../../models/user.model';
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
		this.userService.getContacts().subscribe((contacts) => (this.topContacts = contacts.splice(0, 5)));
	}
}

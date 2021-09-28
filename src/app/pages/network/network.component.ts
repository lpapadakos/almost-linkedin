import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AlertService } from '../../services/alert.service';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-network',
	templateUrl: './network.component.html',
	styleUrls: ['./network.component.css'],
})
export class NetworkComponent implements OnInit {
	user: User = this.userService.user;
	allUsers: User[];
	contacts: User[] = [];
	searchText: string;

	constructor(private titleService: Title, private alertService: AlertService, private userService: UserService) {
		this.titleService.setTitle('Δίκτυο - AlmostLinkedIn');
	}

	ngOnInit() {
		this.userService.getAll().subscribe({
			next: (users) => {
				this.allUsers = users;

				this.allUsers.forEach((user) => {
					if (user.contact && user.contact.accepted) {
						this.contacts.push(user);
					}

					let toYear: number;
					const currentYear = new Date().getFullYear();

					// Get latest entry (work or alternatively, education)
					let currentStatus = user.experience.entries && user.experience.entries.pop();

					// Let's see if this is the status right now
					if (currentStatus) {
						toYear = currentStatus.toYear || 9999;
						if (currentStatus.fromYear <= currentYear && currentYear <= toYear) {
							user.currentStatus = currentStatus;
							return;
						}
					}

					currentStatus = user.education.entries && user.education.entries.pop();

					if (currentStatus) {
						toYear = currentStatus.toYear || 9999;
						if (currentStatus.fromYear <= currentYear && currentYear <= toYear) {
							user.currentStatus = currentStatus;
							return;
						}
					}

					// If we reach here, we cannot determine the current status
				});
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}
}

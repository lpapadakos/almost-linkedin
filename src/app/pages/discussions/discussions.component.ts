import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Message } from '../../models/message.model';
import { DiscussionService } from '../../services/discussion.service';
@Component({
	selector: 'app-discussions',
	templateUrl: './discussions.component.html',
	styleUrls: ['./discussions.component.css'],
})
export class DiscussionsComponent implements OnInit {
	error = '';
	user: User = this.userService.user;
	newDiscussion = false;
	searchText = '';
	contacts: User[];
	discussions: User[];
	viewedDiscussion: User;

	constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private discussionService: DiscussionService) {}

	ngOnInit(): void {
		this.userService.getContacts(this.user._id).subscribe({
			next: (contacts) => {
				this.contacts = contacts;
			},
			error: (error) => {
				this.onError(error);
			},
		});

		this.discussionService.summary().subscribe({
			next: (discussions) => {
				this.discussions = discussions;

				this.route.paramMap.subscribe((paramMap) => {
					let viewedDiscussionId = paramMap.get('userId');

					if (!viewedDiscussionId) viewedDiscussionId = this.user.lastDiscussion;

					if (viewedDiscussionId) {
						this.viewedDiscussion = this.discussions.find((user) => user._id === viewedDiscussionId);

						// If userId not found in established discussions, create entry for it
						if (!this.viewedDiscussion) {
							this.userService.getById(viewedDiscussionId).subscribe({
								next: (user) => {
									this.viewedDiscussion = user;
									this.discussions.push(user);
								},
								error: (error) => {
									this.onError(error);
								},
							});
						}
					}
				});
			},
			error: (error) => {
				this.onError(error);
			},
		});
	}

	onError(error: string) {
		this.error = error;
	}
}

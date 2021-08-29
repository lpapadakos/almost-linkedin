import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Message } from '../../models/message.model';
import { DiscussionService } from '../../services/discussion.service';

@Component({
	selector: 'app-discussions',
	templateUrl: './discussions.component.html',
	styleUrls: ['./discussions.component.css'],
})
export class DiscussionsComponent implements OnInit, OnDestroy {
	private intervalId;
	private lastUpdate: number;

	error = '';
	user: User = this.userService.user;

	newDiscussion = false;
	searchText = '';
	contacts: User[];

	discussions: User[];
	viewedDiscussion: User;
	messages: Message[] = [];
	message: string;

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

					if (viewedDiscussionId && viewedDiscussionId !== '') {
						this.viewedDiscussion = this.discussions.find((user) => user._id === viewedDiscussionId);

						// If userId not found in established discussions, create entry for it
						if (this.viewedDiscussion) {
							this.onDiscussion();
						} else {
							this.userService.getById(viewedDiscussionId).subscribe({
								next: (user) => {
									this.viewedDiscussion = user;
									this.discussions.unshift(user);

									this.onDiscussion();
								},
								error: (error) => {
									this.onError(error);
									this.router.navigate(['/404'], { skipLocationChange: true });
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

	private scrollToBottom() {
		setTimeout(() => window.scrollTo(0, document.scrollingElement.scrollHeight), 500);
	}

	onDiscussion() {
		this.discussionService.get(this.viewedDiscussion._id).subscribe({
			next: (messages) => {
				this.lastUpdate = Date.now();

				messages.forEach((message) => (message.sender = message.sender === this.user._id ? this.user : this.viewedDiscussion));
				this.messages = messages;

				this.scrollToBottom();
			},
			error: (error) => {
				this.onError(error);
			},
		});

		// Update conversation with received messages
		this.intervalId = setInterval(() => {
			this.discussionService.getSince(this.viewedDiscussion._id, this.lastUpdate).subscribe({
				next: (messages) => {
					this.lastUpdate = Date.now();

					if (messages && messages.length > 0) {
						messages.forEach((message) => (message.sender = message.sender === this.user._id ? this.user : this.viewedDiscussion));
						this.messages.push.apply(this.messages, messages);
						this.viewedDiscussion.lastMessage = this.messages[this.messages.length - 1].text;

						this.scrollToBottom();
					}
				},
				error: (error) => {
					this.onError(error);
				},
			});
		}, 2000);
	}

	sendMessage() {
		this.discussionService.send(this.viewedDiscussion._id, this.message).subscribe({
			next: (obj) => {
				let message = <Message>obj;
				message.sender = this.user;
				this.messages.push(message);
				this.viewedDiscussion.lastMessage = message.text;

				this.user.lastDiscussion = this.viewedDiscussion._id;

				this.message = '';
				this.scrollToBottom();
			},
			error: (error) => {
				this.onError(error);
			},
		});
	}

	onError(error: string) {
		this.error = error;
	}

	ngOnDestroy() {
		clearInterval(this.intervalId);
	}
}

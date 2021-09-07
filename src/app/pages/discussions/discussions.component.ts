import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertService } from '../../services/alert.service';

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
	private subscription: Subscription;

	user: User = this.userService.user;

	newDiscussion = false;
	searchText = '';
	contacts: User[];

	discussions: User[];
	viewedDiscussion: User;
	messages: Message[] = [];
	message: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private userService: UserService,
		private discussionService: DiscussionService
	) {}

	private scrollToBottom() {
		setTimeout(() => window.scrollTo(0, document.scrollingElement.scrollHeight), 500);
	}

	ngOnInit() {
		//TODO load images only twice?
		// TODO add contact field for warning on message line

		this.discussionService.summary().subscribe({
			next: (discussions) => {
				this.discussions = discussions;

				this.route.paramMap.subscribe((paramMap) => {
					let viewedDiscussionId = paramMap.get('userId');

					if (!viewedDiscussionId) viewedDiscussionId = this.user.lastDiscussion;

					if (viewedDiscussionId && viewedDiscussionId !== '') {
						this.viewedDiscussion = this.discussions.find(
							(user) => user._id === viewedDiscussionId
						);

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
									this.alertService.error(error);
									this.router.navigate(['/404'], {
										skipLocationChange: true,
									});
								},
							});
						}
					}
				});
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});

		this.subscription = this.router.events.subscribe((event) => {
			if (event instanceof NavigationStart) {
				clearInterval(this.intervalId);
			}
		});
	}

	startDiscussion() {
		this.userService.getContacts(this.user._id).subscribe({
			next: (contacts) => {
				this.contacts = contacts;
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});

		this.newDiscussion = true;
	}

	onDiscussion() {
		this.discussionService.get(this.viewedDiscussion._id).subscribe({
			next: (messages) => {
				this.lastUpdate = Date.now();

				messages.forEach(
					(message) =>
						(message.sender =
							message.sender === this.user._id
								? this.user
								: this.viewedDiscussion)
				);
				this.messages = messages;

				this.scrollToBottom();
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});

		// Update conversation with received messages
		this.intervalId = setInterval(() => {
			this.discussionService.getSince(this.viewedDiscussion._id, this.lastUpdate).subscribe({
				next: (messages) => {
					this.lastUpdate = Date.now();

					if (messages && messages.length) {
						messages.forEach(
							(message) =>
								(message.sender =
									message.sender === this.user._id
										? this.user
										: this.viewedDiscussion)
						);
						this.messages.push.apply(this.messages, messages);
						this.viewedDiscussion.lastMessage =
							this.messages[this.messages.length - 1].text;

						this.scrollToBottom();
					}
				},
				error: (error) => {
					this.alertService.error(error);
				},
			});
		}, 3000);
	}

	sendMessage() {
		this.discussionService.send(this.viewedDiscussion._id, this.message).subscribe({
			next: (message: Message) => {
				message.sender = this.user;
				this.messages.push(message);
				this.viewedDiscussion.lastMessage = message.text;

				this.user.lastDiscussion = this.viewedDiscussion._id;

				this.message = '';
				this.scrollToBottom();
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	ngOnDestroy() {
		clearInterval(this.intervalId);
		this.subscription.unsubscribe();
	}
}

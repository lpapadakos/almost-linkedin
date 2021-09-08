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

	discussionPartner: User;
	discussions: User[];
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

		this.discussionService.summary().subscribe({
			next: (discussions) => {
				this.discussions = discussions;

				this.route.paramMap.subscribe((paramMap) => {
					let discussionPartnerId = paramMap.get('userId') || this.user.lastDiscussion;

					if (!discussionPartnerId) return;

					this.discussionPartner = this.discussions.find((u) => u._id == discussionPartnerId);

					if (this.discussionPartner) { // Established discussion thread
						this.onDiscussion();
					} else {                      // First time conversing with this user
						this.userService.getById(discussionPartnerId).subscribe({
							next: (user) => {
								this.discussionPartner = user;
								this.discussions.unshift(user);

								this.onDiscussion();
							},
							error: (error) => {
								this.router.navigate(['/404'], { skipLocationChange: true });
							},
						});
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
		if (this.contacts) {
			this.newDiscussion = true;
			return;
		}

		this.userService.getContacts(this.user._id).subscribe({
			next: (contacts) => {
				this.contacts = contacts;
				this.newDiscussion = true;
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	onDiscussion() {
		this.discussionService.get(this.discussionPartner._id).subscribe({
			next: (messages) => {
				this.lastUpdate = Date.now();

				messages.forEach(
					(message) =>
						(message.sender =
							message.sender === this.user._id
								? this.user
								: this.discussionPartner)
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
			this.discussionService.getSince(this.discussionPartner._id, this.lastUpdate).subscribe({
				next: (messages) => {
					this.lastUpdate = Date.now();

					if (messages && messages.length) {
						messages.forEach(
							(message) =>
								(message.sender =
									message.sender === this.user._id
										? this.user
										: this.discussionPartner)
						);
						this.messages.push.apply(this.messages, messages);
						this.discussionPartner.lastMessage =
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
		this.discussionService.send(this.discussionPartner._id, this.message).subscribe({
			next: (message: Message) => {
				message.sender = this.user;
				this.messages.push(message);
				this.discussionPartner.lastMessage = message.text;

				this.userService.lastDiscussion = this.discussionPartner._id;

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

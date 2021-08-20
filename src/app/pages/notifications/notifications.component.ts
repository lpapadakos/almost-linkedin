import { Component, OnInit } from '@angular/core';

import { User, ContactRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Article, Comment } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
	user: User = this.userService.user;
	requests: ContactRequest[];
	recentArticles: Article[];
	error = '';

	constructor(private userService: UserService, private articleService: ArticleService) {}

	ngOnInit(): void {
		this.userService.getContactRequests().subscribe((requests) => (this.requests = requests));

		this.articleService.getFromUser(this.user._id).subscribe((articles) => {
			// Use the 10 most recently updated articles (sorted by activity, essentially)
			this.recentArticles = articles.splice(0, 10);
		});
	}

	acceptContactRequest(request: ContactRequest) {
		this.userService.acceptContactRequest(request._id).subscribe({
			next: () => {
				const index = this.requests.findIndex((r) => r._id === request._id);
				if (index > -1) this.requests.splice(index, 1);
			},
			error: (error) => {
				this.onError(error);
			},
		});
	}

	deleteContact(request: ContactRequest) {
		this.userService.deleteContact(request._id).subscribe({
			next: () => {
				const index = this.requests.findIndex((r) => r._id === request._id);
				if (index > -1) this.requests.splice(index, 1);
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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
	error = '';
	user: User;
	viewedUser: User;
	articles: Article[];

	constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private articleService: ArticleService) {}

	ngOnInit(): void {
		this.userService.userEmitter().subscribe((user) => this.user = user);

		this.route.paramMap.subscribe(paramMap => {
			let viewedUserId = paramMap.get('userId');

			if (!viewedUserId)
				viewedUserId = this.user._id;

			this.userService.getById(viewedUserId).subscribe({
				next: (user) => {
					this.viewedUser = user;
					this.articleService.getFromUser(this.viewedUser._id).subscribe((articles) => (this.articles = articles));
				},
				error: (error) => {
					this.onError(error);
					this.router.navigate(['/404']);
				}
			});
		});
	}

	onError(error: string) {
		this.error = error;
	}
}

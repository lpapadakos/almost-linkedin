import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Article, Comment } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	environment = environment;
	articleForm: FormGroup;
	files: File[];
	error = '';
	user: User;
	articles: Article[];

	constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private userService: UserService, private articleService: ArticleService) {}

	ngOnInit(): void {
		this.articleForm = this.formBuilder.group({
			text: ['', Validators.required],
			media: [''],
		});

		this.userService.userEmitter().subscribe((user) => (this.user = user));
		this.articleService.get().subscribe((articles) => (this.articles = articles));
	}

	onFileChange(event) {
		this.files = [];
		for (var i = 0; i < event.target.files.length; i++) {
			this.files.push(event.target.files[i]);
		}
	}

	onPost(): void {
		if (this.articleForm.invalid)
			return;

		this.articleService.post(this.articleForm.get('text').value, this.files).subscribe({
			next: (obj) => {
				let article = <Article> obj;
				article.poster = this.user;
				this.articles.unshift(article);

				this.articleForm.reset();
				this.error = '';
			},
			error: (error) => {
				this.error = error;
			},
		});
	}

	isInterested(user: User, article: Article): boolean {
		return article.interestNotes.find(u => u._id === user._id) != undefined;
	}

	toggleInterest(article: Article) {
		const interestFlag = !this.isInterested(this.user, article);

	// 	this.articleService.like(article._id, interestflag).subscribe({
	// 		next: () => {
				if (interestFlag) {
					article.interestNotes.push(this.user);
				} else {
					const index = article.interestNotes.findIndex(u => u._id === this.user._id);
					if (index > -1)
						article.interestNotes.splice(index, 1);
				}

	// 		},
	// 		error: (error) => {
	// 			this.error = error;
	// 		},
	// 	});
	}

	// comment(article: Article, text: string) {
	// 	this.articleService.comment(article._id, text).subscribe({
	// 		next: (obj) => {
	// 			let comment = <Comment> obj;
	// 			comment.poster = this.user;
 	// 			article.comments.push(comment);
	// 		},
	// 		error: (error) => {
	// 			this.error = error;
	// 		},
	// 	});
	// }
}

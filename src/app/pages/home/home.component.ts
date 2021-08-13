import { Component, OnInit } from '@angular/core';
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
	topContacts: User[];
	articles: Article[];

	constructor(private formBuilder: FormBuilder, private userService: UserService, private articleService: ArticleService) {}

	ngOnInit(): void {
		this.articleForm = this.formBuilder.group({
			text: ['', Validators.required],
			media: [''],
		});

		this.userService.userEmitter().subscribe((user) => (this.user = user));
		this.userService.getContacts().subscribe((contacts) => (this.topContacts = contacts.splice(0, 5)));
		this.articleService.getAll().subscribe((articles) => (this.articles = articles));
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

		this.articleService.post(this.articleForm.get('text').value.trim(), this.files).subscribe({
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

	delete(article: Article) {
		this.articleService.delete(article._id).subscribe({
			next: (obj) => {
				const index = this.articles.findIndex(a => a._id === article._id);
				if (index > -1)
					this.articles.splice(index, 1);
			},
			error: (error) => {
				this.error = error;
			},
		});
	}

	isInterested(user: User, article: Article): boolean {
		return article.interestNotes.find(u => u._id === user._id) != undefined;
	}

	// TODO Like, comment, delete post
	toggleInterest(article: Article) {
		const interestFlag = !this.isInterested(this.user, article);

		if (interestFlag) {
			this.articleService.like(article._id).subscribe({
				next: () => {
					article.interestNotes.push(this.user);
				},
				error: (error) => {
					this.error = error;
				},
			});
		} else {
			this.articleService.unlike(article._id).subscribe({
				next: () => {
					const index = article.interestNotes.findIndex(u => u._id === this.user._id);
					if (index > -1)
						article.interestNotes.splice(index, 1);
				},
				error: (error) => {
					this.error = error;
				},
			});
		}
	}

	comment(article: Article, text: string) {
		text = text.trim();

		if (!text)
			return;

		this.articleService.comment(article._id, text).subscribe({
			next: (obj) => {
				let comment = <Comment> obj;
				comment.poster = this.user;
 				article.comments.push(comment);

				article.commentDraft = '';
			},
			error: (error) => {
				this.error = error;
			},
		});
	}

	deleteComment(article: Article, comment: Comment) {
		this.articleService.deleteComment(article._id, comment._id).subscribe({
			next: (obj) => {
				const index = article.comments.findIndex(c => c._id === comment._id);
				if (index > -1)
					article.comments.splice(index, 1);
			},
			error: (error) => {
				this.error = error;
			},
		});
	}
}

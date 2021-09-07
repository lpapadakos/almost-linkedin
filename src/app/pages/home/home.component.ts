import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

import { AlertService } from '../../services/alert.service';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	user: User = this.userService.user;

	articleForm: FormGroup;
	files: File[];

	articles: Article[];

	constructor(
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private userService: UserService,
		private articleService: ArticleService
	) {}

	ngOnInit() {
		this.articleForm = this.formBuilder.group({
			text: ['', Validators.required],
		});

		this.articleService.getAll().subscribe({
			next: (articles) => {
				this.articles = articles;
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	onFileChange(event) {
		this.files = [].slice.call(event.target.files);
	}

	onPost(formDirective: FormGroupDirective) {
		if (this.articleForm.invalid) return;

		this.articleService.post(this.articleForm.get('text').value.trim(), this.files).subscribe({
			next: (article: Article) => {
				article.poster = this.user;
				this.articles.unshift(article);

				formDirective.resetForm();
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}
}

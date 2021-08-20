import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
	articleForm: FormGroup;
	files: File[];
	error = ''; // TODO error alert service?
	user: User = this.userService.user;
	articles: Article[];

	constructor(private formBuilder: FormBuilder, private userService: UserService, private articleService: ArticleService) {}

	ngOnInit(): void {
		this.articleForm = this.formBuilder.group({
			text: ['', Validators.required],
			media: [''],
		});

		this.articleService.getAll().subscribe((articles) => (this.articles = articles));
	}

	onFileChange(event) {
		this.files = [];
		for (var i = 0; i < event.target.files.length; i++) {
			this.files.push(event.target.files[i]);
		}
	}

	onPost(): void {
		if (this.articleForm.invalid) return;

		this.articleService.post(this.articleForm.get('text').value.trim(), this.files).subscribe({
			next: (obj) => {
				let article = <Article>obj;
				article.poster = this.user;
				this.articles.unshift(article);

				this.articleForm.reset();
				this.error = '';
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

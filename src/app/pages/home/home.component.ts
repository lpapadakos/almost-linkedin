import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
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
		this.articleService.getArticles().subscribe((articles) => (this.articles = articles));
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

		this.articleService.postArticle(this.articleForm.get('text').value, this.files).subscribe({
			next: () => {
				location.reload();
			},
			error: (error) => {
				this.error = error;
			},
		});
	}
}

import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Article } from '../../models/article.model';
import { User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { ArticleService } from '../../services/article.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user: User = this.userService.user;

  articleForm: UntypedFormGroup;
  files: Array<File>;

  articles: Array<Article>;

  constructor(
    private UntypedFormBuilder: UntypedFormBuilder,
    private titleService: Title,
    private alertService: AlertService,
    private userService: UserService,
    private articleService: ArticleService
  ) {
    this.titleService.setTitle('Αρχική Σελίδα - AlmostLinkedIn');
  }

  ngOnInit() {
    this.articleForm = this.UntypedFormBuilder.group({
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

    this.articleService
      .post(this.articleForm.get('text').value.trim(), this.files)
      .subscribe({
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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Article, Comment } from '../../models/article.model';
import { User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { ArticleService } from '../../services/article.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css'],
})
export class ArticleListComponent implements OnInit {
  user: User = this.userService.user;

  @Input() articles: Array<Article>;
  fragment: string;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userService: UserService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => (this.fragment = fragment));
  }

  delete(article: Article) {
    this.articleService.delete(article._id).subscribe({
      next: () => {
        const index = this.articles.findIndex((a) => a._id === article._id);
        if (index > -1) this.articles.splice(index, 1);
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  isInterested(user: User, article: Article) {
    return article.interestNotes.some((u) => u._id === user._id);
  }

  toggleInterest(article: Article) {
    if (this.isInterested(this.user, article)) {
      this.articleService.unlike(article._id).subscribe({
        next: () => {
          const index = article.interestNotes.findIndex(
            (u) => u._id === this.user._id
          );
          if (index > -1) article.interestNotes.splice(index, 1);
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
    } else {
      this.articleService.like(article._id).subscribe({
        next: () => {
          article.interestNotes.push(this.user);
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
    }
  }

  comment(article: Article) {
    const text = article.commentDraft && article.commentDraft.trim();

    if (!text) return;

    this.articleService.comment(article._id, text).subscribe({
      next: (comment: Comment) => {
        comment.poster = this.user;
        article.comments.push(comment);

        article.commentDraft = '';
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  deleteComment(article: Article, comment: Comment) {
    this.articleService.deleteComment(article._id, comment._id).subscribe({
      next: () => {
        const index = article.comments.findIndex((c) => c._id === comment._id);
        if (index > -1) article.comments.splice(index, 1);
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }
}

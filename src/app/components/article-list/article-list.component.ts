import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { User } from '../../models/user.model';

import { Article, Comment } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-article-list',
	templateUrl: './article-list.component.html',
	styleUrls: ['./article-list.component.css'],
})
export class ArticleListComponent implements AfterViewInit {
	@Input() user: User;
	@Input() articles: Article[];
	@Output() errorEvent = new EventEmitter<string>();
	fragment: string;

	constructor(private route: ActivatedRoute, private router: Router, private viewportScroller: ViewportScroller, private articleService: ArticleService) {}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.route.fragment.subscribe((fragment) => {
				if (fragment) this.viewportScroller.scrollToAnchor(fragment);
			});
		}, 500);
	}

	delete(article: Article) {
		this.articleService.delete(article._id).subscribe({
			next: () => {
				const index = this.articles.findIndex((a) => a._id === article._id);
				if (index > -1) this.articles.splice(index, 1);
			},
			error: (error) => {
				this.errorEvent.emit(error);
			},
		});
	}

	isInterested(user: User, article: Article): boolean {
		return article.interestNotes.find((u) => u._id === user._id) != undefined;
	}

	toggleInterest(article: Article) {
		if (this.isInterested(this.user, article)) {
			this.articleService.unlike(article._id).subscribe({
				next: () => {
					const index = article.interestNotes.findIndex((u) => u._id === this.user._id);
					if (index > -1) article.interestNotes.splice(index, 1);
				},
				error: (error) => {
					this.errorEvent.emit(error);
				},
			});
		} else {
			this.articleService.like(article._id).subscribe({
				next: () => {
					article.interestNotes.push(this.user);
				},
				error: (error) => {
					this.errorEvent.emit(error);
				},
			});
		}
	}

	comment(article: Article, text: string) {
		text = text.trim();

		if (!text) return;

		this.articleService.comment(article._id, text).subscribe({
			next: (obj) => {
				let comment = <Comment>obj;
				comment.poster = this.user;
				article.comments.push(comment);

				article.commentDraft = '';
			},
			error: (error) => {
				this.errorEvent.emit(error);
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
				this.errorEvent.emit(error);
			},
		});
	}
}

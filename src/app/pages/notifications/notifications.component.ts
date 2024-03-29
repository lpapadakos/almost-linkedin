import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Article } from '../../models/article.model';
import { ContactRequest, User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { ArticleService } from '../../services/article.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  user: User = this.userService.user;
  requests: Array<ContactRequest>;
  recentArticles: Array<Article>;

  constructor(
    private titleService: Title,
    private alertService: AlertService,
    private userService: UserService,
    private articleService: ArticleService
  ) {
    this.titleService.setTitle('Ειδοποιήσεις - AlmostLinkedIn');
  }

  ngOnInit() {
    this.userService.getContactRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });

    this.articleService.getFromUser(this.user._id).subscribe({
      next: (articles) => {
        // Use the 10 most recently updated articles (sorted by activity, essentially)
        this.recentArticles = articles.splice(0, 10);
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  acceptContactRequest(request: ContactRequest) {
    this.userService.acceptContactRequest(request._id).subscribe({
      next: () => {
        const index = this.requests.findIndex((r) => r._id === request._id);
        if (index > -1) this.requests.splice(index, 1);
      },
      error: (error) => {
        this.alertService.error(error);
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
        this.alertService.error(error);
      },
    });
  }
}

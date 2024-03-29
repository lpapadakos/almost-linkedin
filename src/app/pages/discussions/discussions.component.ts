import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SecurePipe } from 'src/app/helpers/secure.pipe';

import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { DiscussionService } from '../../services/discussion.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.css'],
})
export class DiscussionsComponent implements OnInit, OnDestroy {
  private intervalId;
  private lastUpdate: number;
  private subscription: Subscription;

  user: User = this.userService.user;

  newDiscussion = false;
  searchText = '';
  contacts: Array<User>;

  discussionPartner: User;
  discussions: Array<User>;
  messages: Array<Message> = [];
  messageDraft: string;

  constructor(
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private securePipe: SecurePipe,
    private alertService: AlertService,
    private userService: UserService,
    private discussionService: DiscussionService
  ) {
    this.titleService.setTitle('Συζητήσεις - AlmostLinkedIn');
  }

  private scrollToBottom() {
    setTimeout(
      () => window.scrollTo(0, document.scrollingElement.scrollHeight),
      500
    );
  }

  ngOnInit() {
    // load images only twice, use for messages
    this.securePipe
      .transform(this.user.img)
      .pipe(first())
      .subscribe((safeUrl) => (this.user.imgBlob = safeUrl));

    this.discussionService.summary().subscribe({
      next: (discussions) => {
        this.discussions = discussions;

        this.route.paramMap.subscribe((paramMap) => {
          const discussionPartnerId =
            paramMap.get('userId') || this.user.lastDiscussion;

          if (!discussionPartnerId) return;

          this.discussionPartner = this.discussions.find(
            (u) => u._id === discussionPartnerId
          );

          if (this.discussionPartner) {
            // Established discussion thread
            this.onDiscussion();
          } else {
            // First time conversing with this user
            this.userService.getById(discussionPartnerId).subscribe({
              next: (user) => {
                this.discussionPartner = user;
                this.discussions.unshift(user);

                this.onDiscussion();
              },
              error: (error) => {
                this.router.navigate(['/404'], {
                  skipLocationChange: true,
                });
              },
            });
          }
        });
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });

    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearInterval(this.intervalId);
      }
    });
  }

  startDiscussion() {
    if (this.contacts) {
      this.newDiscussion = true;
      return;
    }

    this.userService.getContacts(this.user._id).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.newDiscussion = true;
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  onDiscussion() {
    this.titleService.setTitle(
      this.discussionPartner.name + ' - Συζητήσεις - AlmostLinkedIn'
    );

    this.securePipe
      .transform(this.discussionPartner.img)
      .pipe(first())
      .subscribe((safeUrl) => (this.discussionPartner.imgBlob = safeUrl));

    this.discussionService.get(this.discussionPartner._id).subscribe({
      next: (messages) => {
        this.lastUpdate = Date.now();

        messages.forEach(
          (message) =>
            (message.sender =
              message.sender === this.user._id
                ? this.user
                : this.discussionPartner)
        );
        this.messages = messages;

        this.scrollToBottom();
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });

    // Watch for new messages, but only if we can talk with that person
    if (
      !this.discussionPartner.contact ||
      !this.discussionPartner.contact.accepted
    )
      return;

    // Update conversation with received messages
    this.intervalId = setInterval(() => {
      this.discussionService
        .getSince(this.discussionPartner._id, this.lastUpdate)
        .subscribe({
          next: (messages) => {
            this.lastUpdate = Date.now();

            if (messages && messages.length) {
              messages.forEach(
                (message) =>
                  (message.sender =
                    message.sender === this.user._id
                      ? this.user
                      : this.discussionPartner)
              );
              this.messages.push.apply(this.messages, messages);
              this.discussionPartner.lastMessage =
                this.messages[this.messages.length - 1].text;

              this.scrollToBottom();
            }
          },
          error: (error) => {
            this.alertService.error(error);
          },
        });
    }, 3000);
  }

  sendMessage() {
    this.discussionService
      .send(this.discussionPartner._id, this.messageDraft)
      .subscribe({
        next: (message: Message) => {
          message.sender = this.user;
          this.messages.push(message);
          this.discussionPartner.lastMessage = message.text;

          this.userService.lastDiscussion = this.discussionPartner._id;

          this.messageDraft = '';
          this.scrollToBottom();
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.subscription.unsubscribe();
  }
}

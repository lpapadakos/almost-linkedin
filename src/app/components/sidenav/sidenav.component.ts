import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ContactRequest, User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnChanges {
  user: User = this.userService.user;

  @Input() viewedUser: User;
  topContacts: Array<User>;

  constructor(
    private alertService: AlertService,
    private userService: UserService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.userService.getContacts(this.viewedUser._id).subscribe({
      next: (contacts) => {
        this.topContacts = contacts.splice(0, 5);
      },
      error: (error) => {
        this.topContacts = null;
      },
    });
  }

  addContactRequest() {
    this.userService.addContactRequest(this.viewedUser._id).subscribe({
      next: (request: ContactRequest) => {
        this.viewedUser.contact = {
          _id: request._id,
          accepted: false,
        };
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }

  deleteContact() {
    this.userService.deleteContact(this.viewedUser.contact._id).subscribe({
      next: () => {
        delete this.viewedUser.contact;
        this.viewedUser.delete = false;
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }
}

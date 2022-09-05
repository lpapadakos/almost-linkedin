import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { User } from '../../models/user.model';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  user: User = this.userService.user;
  updateForm: UntypedFormGroup;
  userImage: File | null = null;
  imageData: any;

  constructor(
    private UntypedFormBuilder: UntypedFormBuilder,
    private titleService: Title,
    private alertService: AlertService,
    private userService: UserService
  ) {
    this.titleService.setTitle('Ρυθμίσεις - AlmostLinkedIn');
  }

  ngOnInit() {
    this.updateForm = this.UntypedFormBuilder.group(
      {
        name: [this.user.name, Validators.required],
        email: [this.user.email, [Validators.required, Validators.email]],
        phone: [this.user.phone, Validators.pattern('[- +()0-9]+')],
        bio: [this.user.bio],
        password: ['', Validators.required],
        new_password: ['', Validators.minLength(8)],
        repeat_new_password: [''],
      },
      {
        validator: this.userService.equivalentValidator(
          'new_password',
          'repeat_new_password'
        ),
      }
    );
  }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      this.userImage = event.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => (this.imageData = reader.result);

      reader.readAsDataURL(this.userImage);
    }
  }

  onSubmit() {
    if (this.updateForm.invalid) return;

    this.userService.update(this.updateForm.value, this.userImage).subscribe({
      next: () => {
        this.alertService.success('Επιτυχής ενημέρωση στοιχείων χρήστη');
      },
      error: (error) => {
        this.alertService.error(error);
      },
    });
  }
}

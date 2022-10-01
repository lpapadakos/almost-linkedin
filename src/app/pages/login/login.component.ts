import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private returnUrl: string = this.route.snapshot.queryParams.returnUrl || '/';
  loginForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userService: UserService
  ) {
    this.titleService.setTitle('Σύνδεση - AlmostLinkedIn');
  }

  ngOnInit() {
    // Don't be here if you're logged in, boi
    if (this.userService.user) this.router.navigate([this.returnUrl]);

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.email],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.userService
      .login(
        this.loginForm.get('email').value,
        this.loginForm.get('password').value
      )
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }
}

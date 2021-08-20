import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
	private returnUrl: string;
	loginForm: FormGroup;
	error = '';

	constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private userService: UserService) {
		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
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

		this.userService.login(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value).subscribe({
			next: () => {
				this.router.navigate([this.returnUrl]);
			},
			error: (error) => {
				this.error = error;
			},
		});
	}
}

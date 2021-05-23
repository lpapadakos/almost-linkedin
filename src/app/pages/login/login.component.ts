import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
	loginForm: FormGroup;
	submitted = false;
	error = '';
	private returnUrl: string;

	constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private authService: AuthService) {
		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
	}

	ngOnInit() {
		// Don't be here if you're logged in, boi
		if (this.authService.user) this.router.navigate([this.returnUrl]);

		this.loginForm = this.formBuilder.group({
			email: ['', Validators.email],
			password: ['', Validators.required],
		});
	}

	onSubmit() {
		this.submitted = true;

		if (this.loginForm.invalid)
			return;

		this.authService.login(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value)
			.pipe(first())
			.subscribe({
				next: () => {
					this.router.navigate([this.returnUrl]);
				},
				error: (error) => {
					this.error = error;
				},
			});
	}
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
	public registerForm: FormGroup;
	public error = '';
	//TODO returnurl needed?
	private returnUrl: string;

	constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private authService: AuthService) {
		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
	}

	// Custom validator: Compare password fields to see if they match
	private matchControls(controlName: string, matchingControlName: string) {
		return (formGroup: FormGroup) => {
			const control = formGroup.controls[controlName];
			const matchingControl = formGroup.controls[matchingControlName];

			if (matchingControl.errors && !matchingControl.errors.mustMatch) {
				// return if another validator has already found an error on the matchingControl
				return;
			}

			// set error on matchingControl if validation fails
			if (control.value !== matchingControl.value) {
				matchingControl.setErrors({ mustMatch: true });
			} else {
				matchingControl.setErrors(null);
			}
		}
	}

	ngOnInit() {
		this.registerForm = this.formBuilder.group({
			name: ['',  Validators.required],
			email: ['', [Validators.required, Validators.email]],
 			phone: ['', Validators.pattern('[- +()0-9]+')],
			password: ['', [Validators.required, Validators.minLength(8)]],
			repeat_password: ['', Validators.required]
		}, {
			validator: this.matchControls('password', 'repeat_password')
		});
	}

	onSubmit() {
		if (this.registerForm.invalid)
			return;

		// TODO Fix next() not happening
		this.authService.register(this.registerForm.value)
			.pipe(first())
			.subscribe({
				next: () => {
					this.router.navigate(['/login']);
				},
				error: (error) => {
					this.error = error;
				}
			});
	}
}

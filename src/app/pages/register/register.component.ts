import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
	registerForm: FormGroup;
	error = '';
	userImage: File | null = null;
	imageData: any;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private userService: UserService
	) {}



	ngOnInit() {
		this.registerForm = this.formBuilder.group(
			{
				name: ['', Validators.required],
				email: ['', [Validators.required, Validators.email]],
				phone: ['', Validators.pattern('[- +()0-9]+')],
				password: ['', [Validators.required, Validators.minLength(8)]],
				repeat_password: ['', Validators.required],
			},
			{
				validator: this.userService.matchControls('password', 'repeat_password'),
			}
		);
	}

	onFileChange(event): void {
		if (event.target.files && event.target.files[0]) {
			this.userImage = event.target.files[0];

			const reader = new FileReader();
			reader.onload = (e) => (this.imageData = reader.result);

			reader.readAsDataURL(this.userImage);
		}
	}

	onSubmit() {
		if (this.registerForm.invalid) return;

		this.userService.register(this.registerForm.value, this.userImage).subscribe({
			next: () => {
				this.router.navigate(['/login']);
			},
			error: (error) => {
				this.error = error;
			},
		});
	}
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
	registerForm: FormGroup;
	userImage: File | null = null;
	imageData: any;

	constructor(
		private formBuilder: FormBuilder,
		private titleService: Title,
		private router: Router,
		private alertService: AlertService,
		private userService: UserService
	) {
		this.titleService.setTitle('Εγγραφή - AlmostLinkedIn');
	}

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
				validator: this.userService.equivalentValidator('password', 'repeat_password'),
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
		if (this.registerForm.invalid) return;

		this.userService.register(this.registerForm.value, this.userImage).subscribe({
			next: () => {
				this.router.navigate(['/login']);
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}
}

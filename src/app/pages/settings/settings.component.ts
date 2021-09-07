import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
	user: User = this.userService.user;
	updateForm: FormGroup;
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
		this.updateForm = this.formBuilder.group(
			{
				name: [this.user.name, Validators.required],
				email: [this.user.email, [Validators.required, Validators.email]],
				phone: [this.user.phone, Validators.pattern('[- +()0-9]+')],
				bio: [this.user.bio],
				password: [, Validators.required],
				new_password: [, Validators.minLength(8)],
				repeat_new_password: [],
			},
			{
			 	// validator: this.userService.matchControls('new_password', 'new_repeat_password'),
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
		if (this.updateForm.invalid) return;

		this.userService.update(this.updateForm.value, this.userImage).subscribe({
			next: (res: {message: string}) => {
				this.error = res.message + ". Οι αλλαγές θα ισχύσουν από την επόμενη σύνδεση";
			},
			error: (error) => {
				this.error = error;
			},
		});
	}
}

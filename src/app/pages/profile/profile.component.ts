import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../services/alert.service';

import { Entry, User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
	user: User = this.userService.user;
	viewedUser: User;

	articles: Article[];

	form = {};
	entryTypes = [
		{
			name: 'experience',
			label: 'Επαγγελματική εμπειρία',
			form: 'Εισαγωγή επαγγελματικής εμπειρίας',
			form_what: 'Τίτλος Θέσης',
			form_where: 'Επωνυμία Εταιρίας/Οργανισμού',
		},
		{
			name: 'education',
			label: 'Εκπαίδευση',
			form: 'Εισαγωγή εκπαίδευσης',
			form_where: 'Όνομα ιδρύματος/σχολής',
		},
		{
			name: 'skills',
			label: 'Δεξιότητες',
			form: 'Εισαγωγή δεξιότητας',
			form_what: 'Δεξιότητα',
		},
	];

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private userService: UserService,
		private articleService: ArticleService
	) {}

	// Custom validator: Compare From and To Fields for correct time interval
	private validateInterval(fromControlName: string, toControlName: string) {
		return (formGroup: FormGroup) => {
			const fromControl = formGroup.controls[fromControlName];
			const toControl = formGroup.controls[toControlName];

			if (toControl.errors && !toControl.errors.mustBeInterval) {
				// return if another validator has already found an error on the mustBeInterval
				return;
			}

			// set error on mustBeInterval if validation fails
			if (toControl.value && fromControl.value > toControl.value) {
				toControl.setErrors({ mustBeInterval: true });
			} else {
				toControl.setErrors(null);
			}
		};
	}

	ngOnInit() {
		this.route.paramMap.subscribe((paramMap) => {
			let viewedUserId = paramMap.get('userId');

			if (!viewedUserId) viewedUserId = this.user._id;

			this.userService.getById(viewedUserId).subscribe({
				next: (user) => {
					this.viewedUser = user;
					this.articleService.getFromUser(this.viewedUser._id).subscribe({
						next: (articles) => {
							this.articles = articles;
						},
						error: (error) => {
							this.alertService.error(error);
						},
					});
				},
				error: (error) => {
					this.router.navigate(['/404'], { skipLocationChange: true });
				},
			});
		});

		this.form['experience'] = this.formBuilder.group(
			{
				what: ['', Validators.required],
				where: ['', Validators.required],
				fromYear: ['', Validators.required],
				toYear: [''],
			},
			{
				validator: this.validateInterval('fromYear', 'toYear'),
			}
		);

		this.form['education'] = this.formBuilder.group(
			{
				where: ['', Validators.required],
				fromYear: ['', Validators.required],
				toYear: [''],
			},
			{
				validator: this.validateInterval('fromYear', 'toYear'),
			}
		);

		this.form['skills'] = this.formBuilder.group({
			what: ['', Validators.required],
		});
	}

	onSubmit(entryType: string) {
		let form = this.form[entryType];
		let array: Entry[] = this.viewedUser[entryType].entries;

		if (form.invalid) return;

		this.userService.addEntry(entryType, form.value).subscribe({
			next: (entry: Entry) => {
				array.push(entry);

				// Sort results by fromYear descending
				if (entryType !== 'skills') {
					array.sort((e1, e2) => e2.fromYear - e1.fromYear);
				}

				form.reset();
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	onStatusChange(entryType: string, isPublic: boolean) {
		this.userService.changeEntryStatus(entryType, isPublic).subscribe({
			next: (res: { message: string }) => {
				this.alertService.success(res.message);
			},
			error: (error) => {
				// revert check on error
				this.viewedUser[entryType].public = !isPublic;
				this.alertService.error(error);
			},
		});
	}

	deleteEntry(entryType: string, entry: Entry) {
		let array = this.viewedUser[entryType].entries;

		this.userService.deleteEntry(entryType, entry._id).subscribe({
			next: () => {
				const index = array.findIndex((e) => e._id === entry._id);
				if (index > -1) array.splice(index, 1);
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}
}

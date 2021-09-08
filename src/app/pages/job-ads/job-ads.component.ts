import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AlertService } from '../../services/alert.service';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { JobAd } from '../../models/job-ad.model';
import { JobAdService } from '../../services/job-ad.service';

@Component({
	selector: 'app-job-ads',
	templateUrl: './job-ads.component.html',
	styleUrls: ['./job-ads.component.css'],
})
export class JobAdsComponent implements OnInit {
	user: User = this.userService.user;

	jobAdForm: FormGroup;

	jobAds: JobAd[];
	fragment: string;

	constructor(
		private viewportScroller: ViewportScroller,
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private userService: UserService,
		private jobAdService: JobAdService
	) {}

	ngOnInit() {
		this.jobAdForm = this.formBuilder.group({
			what: ['', Validators.required],
			where: ['', Validators.required],
			description: ['', Validators.required],
		});

		this.jobAdService.getAll().subscribe({
			next: (jobAds) => {
				this.jobAds = jobAds;
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.route.fragment.subscribe((fragment) => {
				if (fragment) {
					this.fragment = fragment;
					this.viewportScroller.scrollToAnchor(fragment);
				}
			});
		}, 500);
	}

	onPost(formDirective: FormGroupDirective) {
		if (this.jobAdForm.invalid) return;

		this.jobAdService.post(this.jobAdForm.value).subscribe({
			next: (jobAd: JobAd) => {
				jobAd.poster = this.user;
				this.jobAds.unshift(jobAd);

				formDirective.resetForm();
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	delete(jobAd: JobAd) {
		this.jobAdService.delete(jobAd._id).subscribe({
			next: () => {
				const index = this.jobAds.findIndex((a) => a._id === jobAd._id);
				if (index > -1) this.jobAds.splice(index, 1);
			},
			error: (error) => {
				this.alertService.error(error);
			},
		});
	}

	hasApplied(user: User, jobAd: JobAd) {
		return jobAd.applications.some((u) => u._id === user._id);
	}

	toggleApply(jobAd: JobAd) {
		if (this.hasApplied(this.user, jobAd)) {
			this.jobAdService.cancelApply(jobAd._id).subscribe({
				next: () => {
					const index = jobAd.applications.findIndex((u) => u._id === this.user._id);
					if (index > -1) jobAd.applications.splice(index, 1);
				},
				error: (error) => {
					this.alertService.error(error);
				},
			});
		} else {
			this.jobAdService.apply(jobAd._id).subscribe({
				next: () => {
					jobAd.applications.push(this.user);
				},
				error: (error) => {
					this.alertService.error(error);
				},
			});
		}
	}
}

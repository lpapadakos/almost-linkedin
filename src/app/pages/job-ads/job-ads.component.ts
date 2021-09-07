import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

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
	jobAdForm: FormGroup;
	error = '';
	user: User = this.userService.user;
	jobAds: JobAd[];
	fragment: string;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		private userService: UserService,
		private jobAdService: JobAdService,
		private viewportScroller: ViewportScroller
	) {}

	ngOnInit(): void {
		this.jobAdForm = this.formBuilder.group({
			what: ['', Validators.required],
			where: ['', Validators.required],
			description: ['', Validators.required],
		});

		this.jobAdService.getAll().subscribe((jobAds) => (this.jobAds = jobAds));
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.route.fragment.subscribe((fragment) => {
				if (fragment) {
					this.fragment = fragment;
					this.viewportScroller.scrollToAnchor(fragment);
				}
			});
		}, 500);
	}

	onPost(): void {
		if (this.jobAdForm.invalid) return;

		this.jobAdService.post(this.jobAdForm.value).subscribe({
			next: (jobAd: JobAd) => {
				jobAd.poster = this.user;
				this.jobAds.unshift(jobAd);

				this.jobAdForm.reset();
				this.error = '';
			},
			error: (error) => {
				this.onError(error);
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
				this.onError(error);
			},
		});
	}

	hasApplied(user: User, jobAd: JobAd): boolean {
		return jobAd.applications.find((u) => u._id === user._id) != undefined;
	}

	toggleApply(jobAd: JobAd) {
		if (this.hasApplied(this.user, jobAd)) {
			this.jobAdService.cancelApply(jobAd._id).subscribe({
				next: () => {
					const index = jobAd.applications.findIndex((u) => u._id === this.user._id);
					if (index > -1) jobAd.applications.splice(index, 1);
				},
				error: (error) => {
					this.onError(error);
				},
			});
		} else {
			this.jobAdService.apply(jobAd._id).subscribe({
				next: () => {
					jobAd.applications.push(this.user);
				},
				error: (error) => {
					this.onError(error);
				},
			});
		}
	}

	onError(error: string) {
		this.error = error;
	}
}

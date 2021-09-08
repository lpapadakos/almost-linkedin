import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { User } from '../../models/user.model';

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	pages: any[];
	user: User;

	constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {
		this.pages = [
			{
				icon: 'home',
				label: 'Αρχική Σελίδα',
				link: '/home',
			},
			{
				icon: 'contacts',
				label: 'Δίκτυο',
				link: '/network',
			},
			{
				icon: 'business',
				label: 'Αγγελίες',
				link: '/job-ads',
			},
			{
				icon: 'chat',
				label: 'Συζητήσεις',
				link: '/discussions',
			},
			{
				icon: 'notifications',
				label: 'Ειδοποιήσεις',
				link: '/notifications',
			},
			{
				icon: 'account_circle',
				label: 'Προφίλ',
				link: '/profile',
			},
			{
				icon: 'settings',
				label: 'Ρυθμίσεις',
				link: '/settings',
			},
		];
	}

	ngOnInit() {
		this.subscription = this.userService.onUser().subscribe((user) => (this.user = user));
	}

	logout() {
		this.userService.logout();
		this.router.navigate(['/login']);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}

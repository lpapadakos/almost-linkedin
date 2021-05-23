import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
	pages: any[];
	user: User;

	constructor(private authService: AuthService) {
		this.pages = [
			{
				label: "Αρχική Σελίδα",
				link: ""
			},
			{
				label: "Δίκτυο",
				link: "/network"
			},
			{
				label: "Αγγελίες",
				link: "/job-ads"
			},
			{
				label: "Συζητήσεις",
				link: "/discussions"
			},
			{
				label: "Ειδοποιήσεις",
				link: "/notifications"
			},
			{
				label: "Προσωπικά Στοιχεία",
				link: "/profile"
			},
			{
				label: "Ρυθμίσεις",
				link: "/settings"
			},
		];
	}

	ngOnInit(): void {
		this.user = this.authService.user;
	}
}

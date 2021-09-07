import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertType, Alert } from '../../models/alert.model';
import { AlertService } from '../../services/alert.service';

@Component({
	selector: 'app-alert',
	templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit, OnDestroy {
	alerts: Alert[] = [];
	subscriptions: Subscription[] = [];

	constructor(private router: Router, private alertService: AlertService) {}

	get AlertType() {
		return AlertType;
	}

	ngOnInit() {
		this.subscriptions.push(
			this.alertService.onAlert().subscribe((alert) => {
				if (alert) {
					this.alerts.push(alert);
					setTimeout(() => this.remove(alert), 5000);
				}
			})
		);

		// TODO Clear alert on navigation change
		this.subscriptions.push(
			this.router.events.subscribe((event) => {
				if (event instanceof NavigationStart) {
					this.alertService.clear();
				}
			})
		);
	}

	remove(alert: Alert) {
		const index = this.alerts.findIndex((a) => a === alert);
		if (index > -1) this.alerts.splice(index, 1);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}

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
	private subscriptions: Subscription[] = [];
	alerts: Alert[] = [];

	constructor(private router: Router, private alertService: AlertService) {}

	get AlertType() {
		return AlertType;
	}

	ngOnInit() {
		this.subscriptions.push(
			this.alertService.onAlert().subscribe((alert) => {
				if (alert) {
					this.alerts.push(alert);
					setTimeout(() => this.remove(alert), 8000);
				}
			})
		);

		// Clear alert on navigation change
		this.subscriptions.push(
			this.router.events.subscribe((event) => {
				if (event instanceof NavigationStart) {
					this.alertService.clear();
					this.alerts = [];
				}
			})
		);
	}

	cssClass(alert: Alert) {
		switch (alert.type) {
			case AlertType.Success:
				return 'success';
			case AlertType.Warning:
				return 'warning';
			case AlertType.Error:
				return 'error';
			default:
				return 'info';
		}
	}

	matIcon(alert: Alert) {
		switch (alert.type) {
			case AlertType.Success:
				return 'check_circle';
			case AlertType.Warning:
				return 'warning';
			case AlertType.Error:
				return 'error';
			default:
				return 'info';
		}
	}

	remove(alert: Alert) {
		const index = this.alerts.findIndex((a) => a === alert);
		if (index > -1) this.alerts.splice(index, 1);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}

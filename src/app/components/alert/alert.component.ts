import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Alert, AlertType } from '../../models/alert.model';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit, OnDestroy {
  private subscriptions: Array<Subscription> = [];
  alerts: Array<Alert> = [];

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.alertService.onAlert().subscribe((alert) => {
        this.alerts.push(alert);
        setTimeout(() => this.remove(alert), 8000);
      })
    );

    // Clear alerts on navigation change
    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
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

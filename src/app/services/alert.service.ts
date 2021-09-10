import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AlertType, Alert } from '../models/alert.model';

@Injectable({
	providedIn: 'root',
})
export class AlertService {
	private alertSubject = new Subject<Alert>();

	onAlert() {
		return this.alertSubject.asObservable();
	}

	success(message: string) {
		this.alertSubject.next(new Alert({ type: AlertType.Success, message }));
	}

	info(message: string) {
		this.alertSubject.next(new Alert({ type: AlertType.Info, message }));
	}

	warn(message: string) {
		this.alertSubject.next(new Alert({ type: AlertType.Warning, message }));
	}

	error(message: string) {
		this.alertSubject.next(new Alert({ type: AlertType.Error, message }));
	}
}

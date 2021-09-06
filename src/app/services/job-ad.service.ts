import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { JobAd } from '../models/job-ad.model';

@Injectable({
	providedIn: 'root',
})
export class JobAdService {
	constructor(private http: HttpClient) {}

	post(jobAd: JobAd) {
		return this.http.post(`${environment.apiUrl}/job-ads`, jobAd);
	}

	getById(jobAdId: String) {
		return this.http.get<JobAd>(`${environment.apiUrl}/job-ads/${jobAdId}`);
	}

	getFromUser(posterId: string) {
		return this.http.get<JobAd[]>(`${environment.apiUrl}/job-ads?from=${posterId}`);
	}

	getAll() {
		return this.http.get<JobAd[]>(`${environment.apiUrl}/job-ads`);
	}

	delete(jobAdId: string) {
		return this.http.delete(`${environment.apiUrl}/job-ads/${jobAdId}`);
	}

	apply(jobAdId: string) {
		return this.http.post(`${environment.apiUrl}/job-ads/${jobAdId}/apply`, {});
	}

	cancelApply(jobAdId: string) {
		return this.http.delete(`${environment.apiUrl}/job-ads/${jobAdId}/apply`);
	}
}

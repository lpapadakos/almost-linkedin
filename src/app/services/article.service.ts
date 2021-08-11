import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';

@Injectable({
	providedIn: 'root',
})
export class ArticleService {
	constructor(private http: HttpClient) {}

	get(): Observable<any> {
		return this.http.get(`${environment.apiUrl}/article`);
	}

	post(text: string, files: File[]) {
		const formData = new FormData();

		formData.append("text", text);

		if (files)
			files.forEach(file => formData.append("media", file));

		return this.http.post(`${environment.apiUrl}/article`, formData);
	}

	// like(articleId: string) {
	// 	return this.http.put(`${environment.apiUrl}/article/${articleId}/like`);
	// }
}

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

	post(text: string, files: File[]) {
		const formData = new FormData();

		formData.append("text", text);

		if (files)
			files.forEach(file => formData.append("media", file));

		return this.http.post(`${environment.apiUrl}/articles`, formData);
	}

	getAll(): Observable<any> {
		return this.http.get(`${environment.apiUrl}/articles`);
	}

	delete(articleId: string) {
		return this.http.delete(`${environment.apiUrl}/articles/${articleId}`);
	}

	like(articleId: string) {
	 	return this.http.post(`${environment.apiUrl}/articles/${articleId}/like`, {});
	}

	unlike(articleId: string) {
		return this.http.delete(`${environment.apiUrl}/articles/${articleId}/like`);
	}

	comment(articleId: string, text: string) {
		return this.http.post(`${environment.apiUrl}/articles/${articleId}/comment`, { text });
	}

	deleteComment(articleId: string, commentId: string) {
		return this.http.delete(`${environment.apiUrl}/articles/${articleId}/comment/${commentId}`);
	}
}

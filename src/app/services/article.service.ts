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

	getArticles(): Observable<any> {
		return this.http.get(`${environment.apiUrl}/article`);
	}

	postArticle(text: string, files: File[]) {
		const formData = new FormData();

		formData.append("text", text);

		if (files)
			files.forEach(file => formData.append("media", file));

		return this.http.post(`${environment.apiUrl}/article`, formData);
	}
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  constructor(private http: HttpClient) {}

  post(text: string, files: Array<File>) {
    const formData = new FormData();

    formData.append('text', text);

    if (files) files.forEach((file) => formData.append('media', file));

    return this.http.post(`${environment.apiUrl}/articles`, formData);
  }

  getById(articleId: String) {
    return this.http.get<Article>(
      `${environment.apiUrl}/articles/${articleId}`
    );
  }

  getFromUser(posterId: string) {
    return this.http.get<Array<Article>>(
      `${environment.apiUrl}/articles?from=${posterId}`
    );
  }

  getAll() {
    return this.http.get<Array<Article>>(`${environment.apiUrl}/articles`);
  }

  delete(articleId: string) {
    return this.http.delete(`${environment.apiUrl}/articles/${articleId}`);
  }

  like(articleId: string) {
    return this.http.post(
      `${environment.apiUrl}/articles/${articleId}/like`,
      {}
    );
  }

  unlike(articleId: string) {
    return this.http.delete(`${environment.apiUrl}/articles/${articleId}/like`);
  }

  comment(articleId: string, text: string) {
    return this.http.post(
      `${environment.apiUrl}/articles/${articleId}/comment`,
      { text }
    );
  }

  deleteComment(articleId: string, commentId: string) {
    return this.http.delete(
      `${environment.apiUrl}/articles/${articleId}/comment/${commentId}`
    );
  }
}

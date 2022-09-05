import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class DiscussionService {
  constructor(private http: HttpClient) {}

  summary() {
    return this.http.get<Array<User>>(`${environment.apiUrl}/discussions`);
  }

  send(userId: string, text: string) {
    return this.http.post(`${environment.apiUrl}/discussions/${userId}`, {
      text,
    });
  }

  get(userId: string) {
    return this.http.get<Array<Message>>(
      `${environment.apiUrl}/discussions/${userId}`
    );
  }

  getSince(userId: string, moment: number) {
    return this.http.get<Array<Message>>(
      `${environment.apiUrl}/discussions/${userId}?since=${moment}`
    );
  }
}

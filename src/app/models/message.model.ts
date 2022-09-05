import { User } from './user.model';

export class Message {
  sender: string | User;
  text: string;
  createdAt: Date;
}

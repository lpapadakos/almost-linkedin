import { User } from './user.model';

export class Message {
	sender: User;
	receiver: User;
	text: string;
	createdAt: Date;
}

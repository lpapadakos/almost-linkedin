import { User } from './user.model';

export class Comment {
	_id: string;
	poster: User;
	text: string;
	createdAt: Date;
}

export class Article {
	_id: string;
	poster: User;
	text: string;
	media: [
		{
			id: string;
			type: string;
		}
	];
	createdAt: Date;
	interestNotes: [User];
	comments: [Comment];
	commentDraft: string;
}

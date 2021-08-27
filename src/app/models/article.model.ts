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
	interestNotes: [User];
	comments: [Comment];
	createdAt: Date;
	updatedAt: Date;

	// helper fields
	commentDraft: string;
}

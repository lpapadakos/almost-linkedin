import { User } from './user.model';

export class Comment {
	_id: string;
	poster: User;
	text: string;
	postDate: Date;
}

export class Article {
	_id: string;
 	poster: User;
	text: string;
	media: [{
		id: string,
		type: string
	}];
	postDate: Date;
	interestNotes: [User];
	comments: [Comment];
}

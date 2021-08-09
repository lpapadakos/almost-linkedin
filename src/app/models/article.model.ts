import { User } from './user.model';

export class Comment {
	poster: User;
	text: string;
	postDate: Date;
}

export class Article {
 	poster: User;
	text: string;
	media: [string];
	postDate: Date;
	interestNotes: [User];
	comments: [Comment];
}

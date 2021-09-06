import { User } from './user.model';

export class JobAd {
	_id: string;
	poster: User;
	what: string;
	where: string;
	description: string;
	applications: [User];
	createdAt: Date;
}

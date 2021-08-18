export class Entry {
	_id: string;
	where: string;
	what: string;
	fromYear: number;
	toYear: number;
};
export class User {
	_id: string;
	token?: string;
	name: string;
	email: string;
	img: string;
	role: string;
	createdAt: Date;
	experience: [Entry];
	education: [Entry];
	skills: [string];
	contact: {
		_id: string;
		accepted: boolean;
	};
}

export class ContactRequest {
	_id: string;
	sender: User;
}

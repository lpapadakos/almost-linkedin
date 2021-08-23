export class Entry {
	_id: string;
	where: string;
	what: string;
	fromYear: number;
	toYear: number;
}
export class User {
	_id: string;
	token?: string;
	name: string;
	email: string;
	img: string;
	role: string;
	createdAt: Date;
	experience: {
		public: boolean;
		entries: [Entry];
	};
	education: {
		public: boolean;
		entries: [Entry];
	};
	skills: {
		public: boolean;
		entries: [string];
	};

	// Frontend only vars: Helpful
	contact: {
		_id: string;
		accepted: boolean;
	};
	currentStatus: Entry;
}

export class ContactRequest {
	_id: string;
	sender: User;
}

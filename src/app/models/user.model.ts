import { SafeUrl } from '@angular/platform-browser';

export class Entry {
	_id: string;
	where: string;
	what: string;
	fromYear: number;
	toYear: number;
}

export class User {
	_id: string;
	name: string;
	email: string;
	phone: string;
	img: string;
	bio: string;
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
	lastDiscussion: string;

	// Frontend only vars: Helpful
	currentStatus: Entry;
	lastMessage: string;
	imgBlob: SafeUrl;
	contact: {
		_id: string;
		accepted: boolean;
	};
	delete: boolean;
	token?: string;
}

export class ContactRequest {
	_id: string;
	sender: User;
}

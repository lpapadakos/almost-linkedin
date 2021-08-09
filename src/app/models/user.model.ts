export class Entry {
	where: string;
	what: string;
	fromYear: number;
	toYear: number;
};
export class User {
	_id: string;
	name: string;
	email: string;
	img: string;
	role: string;
	joinDate: Date;
	token?: string;
	experience: [Entry];
	education: [Entry];
	skills: [string];
}

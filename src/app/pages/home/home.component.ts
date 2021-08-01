import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	user: User;

	constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		this.userService.userEmitter().subscribe(user => this.user = user);
	}
}

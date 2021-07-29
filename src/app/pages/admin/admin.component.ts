import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

import { User } from '../../models/user.model';
import { AdminService } from '../../services/admin.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
	users: User[];
	displayedColumns = ['select', '_id', 'name', 'email', 'joinDate'];
	selection = new SelectionModel<User>(true, []);

	constructor(private route: ActivatedRoute, private router: Router, private adminService: AdminService) {}

	ngOnInit(): void {
		this.adminService.getAll().subscribe((users) => (this.users = users));
	}
}

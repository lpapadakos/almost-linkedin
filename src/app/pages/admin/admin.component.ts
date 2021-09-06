import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { saveAs } from 'file-saver';

import { User } from '../../models/user.model';
import { AdminService } from '../../services/admin.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
	users: User[];
	displayedColumns = ['select', '_id', 'name', 'email', 'createdAt'];
	selection = new SelectionModel<User>(true, []);

	constructor(private route: ActivatedRoute, private router: Router, private adminService: AdminService) {}

	ngOnInit(): void {
		this.adminService.getAll().subscribe((users) => (this.users = users));
	}

	isAllSelected() {
		return this.selection.selected.length === this.users.length;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.users.forEach((user) => this.selection.select(user));
	}

	exportUserData(fileType: string) {
		if (fileType !== "xml" && fileType !== "json") return;

		this.adminService.export(this.selection.selected.map(user => user._id), fileType).subscribe(res => {
			const blob = new Blob([res], { type: 'application/' + fileType });
			saveAs(blob, "extract-" + new Date().toISOString() + '.' + fileType);
		});
	}
}

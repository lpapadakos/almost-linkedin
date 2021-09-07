import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { saveAs } from 'file-saver';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
	users: MatTableDataSource<User>;
	displayedColumns = ['select', '_id', 'name', 'email', 'createdAt'];
	selection = new SelectionModel<User>(true, []);

	@ViewChild(MatSort) sort: MatSort;

	constructor(private userService: UserService) {}

	ngOnInit() {
		this.userService.getAll().subscribe((users) => {
			this.users = new MatTableDataSource(users);

			this.users.sort = this.sort;
			this.users.filterPredicate = (user: { name: string }, filter: string) =>
				user.name.toLocaleLowerCase().includes(filter);
		});
	}

	applyFilter(filterValue: string) {
		this.users.filter = filterValue.trim().toLowerCase();
	}

	isAllSelected() {
		return this.selection.selected.length === this.users.data.length;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.users.data.forEach((user) => this.selection.select(user));
	}

	exportUserData(fileType: string) {
		if (fileType !== 'xml' && fileType !== 'json') return;

		this.userService
			.export(
				this.selection.selected.map((user) => user._id),
				fileType
			)
			.subscribe((res) => {
				const blob = new Blob([res], { type: 'application/' + fileType });
				saveAs(blob, 'extract-' + new Date().toISOString() + '.' + fileType);
			});
	}
}

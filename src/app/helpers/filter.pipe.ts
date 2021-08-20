import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filter',
})
export class FilterPipe implements PipeTransform {
	transform(items: any[], searchText: string): any[] {
		if (!items) return [];

		if (!searchText) return items;

		searchText = searchText.toLocaleLowerCase();

		return items.filter((item) => {
			let haystack = item.name || item;
			return haystack.toLocaleLowerCase().includes(searchText);
		});
	}
}

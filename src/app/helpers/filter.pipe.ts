import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: Array<any>, searchText: string): Array<any> {
    if (!items) return [];

    if (!searchText) return items;

    searchText = searchText.toLocaleLowerCase();

    return items.filter((item) => {
      const haystack = item.name || item;
      return haystack.toLocaleLowerCase().includes(searchText);
    });
  }
}

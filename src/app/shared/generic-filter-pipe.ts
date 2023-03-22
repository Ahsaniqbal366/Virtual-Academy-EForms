import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'genericFilter',
    pure: false
})
export class GenericFilterPipe implements PipeTransform {
    transform(items: any[], filter: any): any {
        if (items) {
            // If no filter is applied...
            if (!filter || !filter.text || typeof filter.text != 'string') {
                // ...Just return
                return items;
            }
            // filter items array, items which match and return true will be
            // kept, false will be filtered out
            const returnSet = items.filter(
                loopedItem => {
                    // Checking the keys of every item
                    return Object.keys(loopedItem).some(
                        loopedProp => {
                            // Checking for a truthy property
                            if (loopedItem[loopedProp]) {
                                // Comparing against string props
                                if (typeof loopedItem[loopedProp] == 'string') {
                                    // Date props are also strings but need some formatting 
                                    if (Date.parse(loopedItem[loopedProp])) {
                                        return loopedItem[loopedProp].toLowerCase().includes(filter.text.toLowerCase())
                                            // Check dates with -, /, and spaces
                                            || loopedItem[loopedProp].toLowerCase().replace(/-/gi, '/').includes(filter.text.toLowerCase())
                                            || loopedItem[loopedProp].toLowerCase().replace(/-/gi, ' ').includes(filter.text.toLowerCase());
                                    } else if (loopedItem[loopedProp].toLowerCase().includes(filter.text.toLowerCase())) {
                                        return loopedItem;
                                    }
                                    // If it's a number, stringify it for comparison
                                } else if (typeof loopedItem[loopedProp] == 'number') {
                                    // If it's a match, return the item
                                    if (loopedItem[loopedProp].toString().includes(filter.text.toLowerCase())) {
                                        return loopedItem;
                                    }
                                    // If it's an object, dive into it's sub properties
                                } else if (typeof loopedItem[loopedProp] == 'object') {
                                    return Object.keys(loopedItem[loopedProp]).some(
                                        loopedSubProp => {
                                            // Checking for a truthy string to compare to
                                            if (loopedItem[loopedProp][loopedSubProp] && typeof loopedItem[loopedProp][loopedSubProp] == 'string') {
                                                // Finally, return the item if it's got a matching prop
                                                if (loopedItem[loopedProp][loopedSubProp].toLowerCase().includes(filter.text.toLowerCase())) {
                                                    return loopedItem;
                                                }
                                            }
                                        });
                                }
                            }
                        });
                });

            return returnSet.slice(0, filter.size);
        }
    }

    /**
* Comparison method for sorting
*/
    public compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
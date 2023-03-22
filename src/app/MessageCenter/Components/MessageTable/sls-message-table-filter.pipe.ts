import { Pipe, PipeTransform } from '@angular/core';
import { MessageInfo } from '../../Providers/message-center.model';
import { MessageCenterProvider } from '../../Providers/message-center.service';

@Pipe({
    name: 'messageTablefilter',
    pure: false
})

export class MessageTableFilterPipe implements PipeTransform {
    constructor(
        public messageCenterProvider: MessageCenterProvider
    ) { }

    transform(messages: MessageInfo[], filter: any): any {
        // Declare a return set
        let returnSet = [];
        // Confirm that we have [messages] and a [filter]
        if (!(!messages || !filter)) {
            // [filter()] the [messages]
            returnSet = messages.filter(
                // On each [loopedMessage]...
                loopedMessage => {
                    // ...Check all [Object.keys] for [some()]...
                    return Object.keys(loopedMessage).some(
                        // ..Where the [loopedProp]...
                        loopedProp => {
                            // ..Is truthy (Not null/undefined) and is typeof string...
                            if (loopedMessage[loopedProp] && typeof loopedMessage[loopedProp] === 'string') {
                                // ...And the [toLowerCase()] string loopedProp [includes()] the [filter.text.toLowerCase()]...
                                if (loopedMessage[loopedProp].toLowerCase().includes(filter.text.toLowerCase())) {
                                    // ...Until we have a set of winners!
                                    return loopedMessage;
                                }
                            }
                        });
                });

            // If a sorting is provided, sort now.
            if (filter.sortBy) {
                if (filter.sortAscending) {
                    returnSet.sort(
                        // Return int to represent placement: -1 = before, 0 = beside, 1 = after
                        (a, b) => a[filter.sortBy] < b[filter.sortBy] ? -1 : a[filter.sortBy] > b[filter.sortBy] ? 1 : 0
                    );
                } else {
                    returnSet.sort(
                        // Return int to represent placement: -1 = before, 0 = beside, 1 = after
                        (a, b) => a[filter.sortBy] < b[filter.sortBy] ? 1 : a[filter.sortBy] > b[filter.sortBy] ? -1 : 0
                    );
                }
            }
            // Cache the [filteredAndSortedMessages] on the provider
            this.messageCenterProvider.filteredAndSortedMessages = returnSet;

            // If we're specifying a size, slice it now that filtering and sorting is done
            if (filter.size) {
                returnSet = returnSet.slice(filter.start, filter.size);
            }

            // Cache the [renderedMessages] on the provider
            this.messageCenterProvider.renderedMessages = returnSet;
        }


        // Return the filtered and sliced set
        return returnSet;
    }
}

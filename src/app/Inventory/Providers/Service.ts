import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIBaseService } from '../../shared/API.Base.Service';
// Custom interfaces
import * as Model from './Model';

import { API_URLS } from 'src/environments/environment';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class InventoryProvider {

    // define objects to store in the service.
    public serverInfo: Model.ServerInfo;

    public inventoryInfo: Model.InventoryCategoryInfo[];

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /******************* GENERAL METHODS **********************/
    getServerInfo(): Observable<object> {
        const observable = new Observable<Model.ServerInfo>(subscriber => {
            /**
             * ServerInfo may have been gathered already.
             * If we hit that case we just return [this.ServerInfo].
             */
            const noServerInfo = !(this.serverInfo);
            if (noServerInfo) {
                // Getting serverInfo from API.
                this.apiBaseService.get(_coreAPIRoot, 'inventory/getServerInfo')
                    .subscribe(
                        (serverInfo: Model.ServerInfo) => {
                            this.serverInfo = serverInfo;
                            subscriber.next(this.serverInfo);
                            subscriber.complete();
                        },
                        (error) => {
                            subscriber.error(error);
                        });
            } else {
                // Already had serverInfo.
                subscriber.next(this.serverInfo);
                subscriber.complete();
            }
        });
        return observable;
    }
}

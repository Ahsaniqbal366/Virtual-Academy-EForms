import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../../../shared/API.Base.Service';
import * as UserSelectModel from './userselect.model';

import { API_URLS } from 'src/environments/environment';

const _apiRoot = API_URLS.Core;

@Injectable()
export class UserSelectProvider {

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.
    public officers: UserSelectModel.UserInfo[];
    public roles: UserSelectModel.RoleInfo[];

    /* PUBLIC METHODS **********************/
    getUsers(): Observable<object> {

        return this.apiBaseService.get(_apiRoot, 'users/getUsers');
    }

    getRoles(): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'roles/getRoles');
    }

}

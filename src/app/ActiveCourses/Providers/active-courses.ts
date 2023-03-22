import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';

import { API_URLS } from 'src/environments/environment';

const _apiRoot = API_URLS.ActiveCourses;

@Injectable()
export class ActiveCoursesProvider {

    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /* PUBLIC METHODS **********************/
    getActiveCourses(): Observable<object> {
        // Will add apiParama soon
        return this.apiBaseService.get(_apiRoot, 'activeCourses/getActiveCourses');
    }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../../../shared/API.Base.Service';
import * as CourseSelectModel from './courseselect.model';

import { API_URLS } from 'src/environments/environment';

const _apiRoot = API_URLS.Core;

@Injectable()
export class CourseSelectProvider {

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.
    public sessionInfo: any;
    public courses: CourseSelectModel.CourseInfo[];

    /* PUBLIC METHODS **********************/
    getCoursesByCourseType(courseType: string): Observable<object> {

        return this.apiBaseService.get(_apiRoot, 'courses/getCoursesByCourseType?courseType=' + courseType);
    }

    getGeneralOrders(): Observable<object> {

        return this.apiBaseService.get(_apiRoot, 'courses/getGeneralOrders');
    }

}

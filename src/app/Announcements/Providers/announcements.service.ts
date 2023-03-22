import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';

import { API_URLS } from 'src/environments/environment';
import { AnnouncementCommentInfo } from './announcements.model';

const _apiRoot = API_URLS.Announcements;

@Injectable()
export class AnnouncementsProvider {

    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /* PUBLIC METHODS **********************/
    getServerInfo(sectionID: number): Observable<object> {
        const apiParams = '?sectionID=' + sectionID;
        return this.apiBaseService.get(_apiRoot, 'announcements/getServerInfo' + apiParams);
    }

    getAnnouncements(filterType: string, sectionID: number): Observable<object> {
        const apiParams = '?sectionID=' + sectionID
            + '&filterType=' + filterType;
        return this.apiBaseService.get(_apiRoot, 'announcements/getAnnouncements' + apiParams);
    }

    reactToAnnouncement(announcementID: number, reactionTypeName: string): Observable<object> {
        const apiInput = {
            announcementID,
            reactionTypeName
        };
        return this.apiBaseService.post(_apiRoot, 'announcements/reactToAnnouncement', JSON.stringify(apiInput));
    }

    getAnnouncementComments(announcementID: number): Observable<object> {
        const apiParams = '?announcementID=' + announcementID;
        return this.apiBaseService.get(_apiRoot, 'announcements/getAnnouncementComments' + apiParams);
    }

    submitAnnouncementComment(comment: AnnouncementCommentInfo): Observable<object> {
        const apiInput = comment;
        return this.apiBaseService.post(_apiRoot, 'announcements/submitAnnouncementComment', JSON.stringify(apiInput));
    }

    deleteAnnouncementComment(comment: AnnouncementCommentInfo): Observable<object> {
        const apiInput = comment;
        return this.apiBaseService.post(_apiRoot, 'announcements/deleteAnnouncementComment', JSON.stringify(apiInput));
    }

}

import { EventEmitter, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { isNullOrUndefined } from 'is-what';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';
import { API_URLS } from 'src/environments/environment';
import { ExternalCreditCourseInfo, CreditTypeInfo, ExternalTrainingServerInfo, ExternalCreditInfo } from './external-training.model';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class ExternalTrainingService {
    constructor(
        private apiBaseService: APIBaseService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public externalTrainingTypes: CreditTypeInfo[];
    public serverInfo: ExternalTrainingServerInfo;

    public isManagerView: boolean;
    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

   public canEditExternalTraining() {
    var output = true;
    if (this.isManagerView && !this.serverInfo.permissions.canEditCertificatesForOtherUsers) {
        output = false;
    }
    return output;
}

    getServerInfo(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'externaltraining/getServerInfo');
    }

    getexternalTrainingTypes(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getexternalTrainingTypes' + apiParams);
    }

    getCertificationsForCurrentUser(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationsForCurrentUser' + apiParams);
    }

    getExternalTrainingCourses(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'externaltraining/getExternalTrainingCourses' + apiParams);
    }

    getCertificationsForUser(userID: number, includeDeleted: boolean): Observable<object> {
        const apiParams = '?userID=' + userID
            + '&includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationsForUser' + apiParams);
    }

    getExternalTrainingCourseRoster(externalTrainingCourseID: number, includeDeleted: boolean): Observable<object> {
        const apiParams = '?courseID=' + externalTrainingCourseID + '&includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'externalTraining/getExternalTrainingCourseRoster' + apiParams);
    }

    updateExternalTrainingCourse(externalTrainingCourseInfo: ExternalCreditCourseInfo): Observable<object> {
        externalTrainingCourseInfo = this._sanitizeexternalTrainingInfo(externalTrainingCourseInfo);
        return this.apiBaseService.post(_coreAPIRoot, 'externalTraining/updateExternalTrainingCourse', JSON.stringify(externalTrainingCourseInfo));
    }

    updateExternalTrainingCredit(creditInfo: ExternalCreditInfo): Observable<object> {
        return this.apiBaseService.post(_coreAPIRoot, 'externalTraining/updateExternalTrainingCredit', JSON.stringify(creditInfo));
    }

    updateExternalTrainingRoster(courseInfo: ExternalCreditCourseInfo): Observable<object> {
        return this.apiBaseService.post(_coreAPIRoot, 'externalTraining/updateExternalTrainingRoster', JSON.stringify(courseInfo));
    }

    renewCertification(externalTrainingInfo: ExternalCreditCourseInfo): Observable<object> {
        return this.apiBaseService.post(_coreAPIRoot, 'certifications/renewCertification', JSON.stringify(externalTrainingInfo));
    }


    /*******************************************
     * PRIVATE METHODS
     *******************************************/
    private _sanitizeexternalTrainingInfo(externalTrainingInfo: ExternalCreditCourseInfo): ExternalCreditCourseInfo {
        

        return externalTrainingInfo;
    }

}
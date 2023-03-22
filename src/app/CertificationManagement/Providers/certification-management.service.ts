import { EventEmitter, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { isNullOrUndefined } from 'is-what';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';
import { API_URLS } from 'src/environments/environment';
import { CertificationInfo, CertificationTypeInfo, CertificationServerInfo } from './certification-management.model';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class CertificationManagementService {
    constructor(
        private apiBaseService: APIBaseService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public certificationTypes: CertificationTypeInfo[];
    public serverInfo: CertificationServerInfo;

    public isManagerView: boolean;
    public isReviewingCertificationChanges: boolean;
    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

   public canEditCertification() {
    var output = true;
    if (this.isManagerView && !this.serverInfo.permissions.canEditCertificatesForOtherUsers) {
        output = false;
    }
    return output;
}

    getServerInfo(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getServerInfo');
    }

    getCertificationTypes(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationTypes' + apiParams);
    }

    getCertificationsForCurrentUser(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationsForCurrentUser' + apiParams);
    }

    getAllCertifications(includeDeleted: boolean): Observable<object> {
        const apiParams = '?includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getAllCertifications' + apiParams);
    }

    getCertificationsForUser(userID: number, includeDeleted: boolean): Observable<object> {
        const apiParams = '?userID=' + userID
            + '&includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationsForUser' + apiParams);
    }

    getCertificationsForParentCertificate(parentCertificateID: number, includeDeleted: boolean): Observable<object> {
        const apiParams = '?parentCertificateID=' + parentCertificateID
            + '&includeDeleted=' + includeDeleted;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getCertificationsForParentCertificate' + apiParams);
    }

    getAuditLogForCertification(certificationInfo: CertificationInfo): Observable<object> {
        let lastReviewDate = null;

        const apiParams = '?certificationID=' + certificationInfo.CertificationID + '&lastReviewDate=' + lastReviewDate;

        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getAuditLogForCertification' + apiParams);
    }

    getUnreviewedCertificationChanges(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'certifications/getUnreviewedCertificationChanges');
    }

    updateCertification(certificationInfo: CertificationInfo): Observable<object> {
        certificationInfo = this._sanitizeCertificationInfo(certificationInfo);
        return this.apiBaseService.post(_coreAPIRoot, 'certifications/updateCertification', JSON.stringify(certificationInfo));
    }

    renewCertification(certificationInfo: CertificationInfo): Observable<object> {
        return this.apiBaseService.post(_coreAPIRoot, 'certifications/renewCertification', JSON.stringify(certificationInfo));
    }

    updateCertificationReviewStatus(certificationInfo: CertificationInfo): Observable<object> {
        return this.apiBaseService.post(_coreAPIRoot, 'certifications/updateCertificationReviewStatus', JSON.stringify(certificationInfo));
    }


    /*******************************************
     * PRIVATE METHODS
     *******************************************/
    private _sanitizeCertificationInfo(certificationInfo: CertificationInfo): CertificationInfo {
        certificationInfo.ExpirationDate = certificationInfo.ExpirationDate || null;

        return certificationInfo;
    }

}
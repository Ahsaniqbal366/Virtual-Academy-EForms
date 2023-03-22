import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';

import * as ProfilesModel from '../Providers/profiles.model';

import { API_URLS } from 'src/environments/environment';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class ProfilesProvider {

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }
    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.
    public serverInfo: ProfilesModel.ProfilesServerInfo;
    public sectionID: number;
    public subView: string;
    public headerText: string;

    /* PUBLIC METHODS **********************/
    getServerInfo(): Observable<object> {
        const observable = new Observable<ProfilesModel.ProfilesServerInfo>(subscriber => {
            /**
             * ServerInfo may have been gathered already.
             * If we hit that case we just return [this.ServerInfo].
             */
            const noServerInfo = !(this.serverInfo);
            if (noServerInfo) {
                // Getting serverInfo from API.
                this.apiBaseService.get(_coreAPIRoot, 'profiles/getServerInfo')
                    .subscribe(
                        (serverInfo: ProfilesModel.ProfilesServerInfo) => {
                            this.serverInfo = serverInfo;
                            subscriber.next(this.serverInfo);
                            subscriber.complete();
                        },
                        (error) => {
                            console.log('error: ', error);
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

    getDataForEdit(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'profiles/getDataForEdit');
    }

    changePassword(oldPassword: string, newPassword: string): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = {
            oldPassword,
            newPassword
        };

        return this.apiBaseService.post(API_URLS.Authentication, 'authentication/changePassword', JSON.stringify(payload));
    }

    updateProfile(sectionUserProfile: ProfilesModel.SectionUserProfile): Observable<object> {
        // payload object is [sectionUserProfile]
        return this.apiBaseService.post(_coreAPIRoot, 'profiles/updateProfile', JSON.stringify(sectionUserProfile));
    }

    UpdateDocument(documentID, title, tags, userIDs, documentType): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { documentID, title, tags, userIDs, documentType };
        return this.apiBaseService.post(_coreAPIRoot, 'profiles/UpdateDocument', JSON.stringify(payload));
    }

    getSiteOfficers(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'profiles/getSiteOfficers');
    }

    gatherAllChapters(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'profiles/gatherAllGroups');
    }

    GetUsersCrossPortalByProfileProperty(searchString): Observable<object> {
        const payload = { searchString };
        return this.apiBaseService.post(_coreAPIRoot, 'profiles/GetUsersCrossPortalByProfileProperty', JSON.stringify(payload));
    }

    getProfileBySectionID(sectionId): Observable<object> {
        const payload = {
            SectionID: sectionId,
            MaxLearnerID: null
        };
        return this.apiBaseService.post(_coreAPIRoot, 'profiles/getProfileBySectionID', JSON.stringify(payload));
    }

    sendMessage(RecipientID, Subject, Body): Observable<object> {
        const payload = {
            RecipientID,
            Subject,
            Body
        };
        return this.apiBaseService.post(_coreAPIRoot, 'profiles/sendMessage', JSON.stringify(payload));
    }

    getCellCarriers(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'profiles/getCellCarriers');
    }

    getChapters(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'profiles/getChapters');
    }

    async UploadProfileJPGPic(uploadedImage: File): Promise<Response> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            const payload = new FormData();
            payload.append('upload', uploadedImage);
            payload.append('JWT', localStorage.getItem('JWT-Access-Token'));
            return fetch(`${_coreAPIRoot}profile/UploadProfileJPGPic`, {
                method: 'POST',
                body: payload
            }).then(response => {
                // Resolve to complete the wait for this method
                resolve(response.json());
            });

        });

    }

    // MAYBE COMING SOON
    // uploadDocument(file): Observable<object> {
    //     const deferred = new $.Deferred();

    //     // NOTE! The [uploadHandler] string has a predefined query string in "Constants.js"
    //     const uri = profilesConstants.paths.uploadHandler;

    //     const xhr = new XMLHttpRequest();
    //     const fd = new FormData();
    //     // Add the request parameters
    //     fd.append('upload', file);
    //     //   fd.append('officerID', officerID);
    //     xhr.open('POST', uri, true);
    //     xhr.onreadystatechange(); {
    //         if (xhr.readyState == 4) {
    //             if (xhr.status == 200) {
    //                 // Parse the response
    //                 const responseJSON = JSON.parse(xhr.responseText);
    //                 if (responseJSON.flag) {
    //                     // Everything went good so far, save the new answer to the database
    //                     // Resolve the deferred so the file upload control can reflect the changes
    //                     deferred.resolveWith($, [responseJSON.msg]);
    //                 } else {
    //                     // The user uploaded a file of the wrong type or size
    //                     deferred.rejectWith($, [responseJSON.msg]);
    //                 }
    //             } else {
    //                 // Unknown server error
    //                 const responseJSON = JSON.parse(xhr.responseText);
    //                 deferred.rejectWith(null, [responseJSON.msg]);

    //             }
    //         }
    //     }
    //     // Initiate a multipart/form-data upload
    //     xhr.send(fd);
    //     return deferred.promise();
    // }

}

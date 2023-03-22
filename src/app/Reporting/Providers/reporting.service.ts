import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';

import * as CourseInfoModel from '../../shared/Components/CourseSelect/Providers/courseselect.model';
import * as ReportingModel from '../Providers/reporting.model';

import { API_URLS } from 'src/environments/environment';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { HttpResponse } from '@angular/common/http';

const _moduleAPIRoot = API_URLS.Reporting;
const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class ReportingProvider {

    /* PUBLIC VARIABLES **********************/
    // define objects to store in the service.
    public serverInfo: ReportingModel.ReportingServerInfo;

    //the currently selected report route
    public selectedReport: ReportingModel.ReportTypeInfo;
    public selectedReportIndex: number;

    public courses: CourseInfoModel.CourseInfo[];
    public categories: CourseInfoModel.CourseCategoryInfo[];

    public selectedCourseIDs: number[] = [];
    public selectedExternalTrainingCourseIDs: number[] = [];
    public selectedCourses: CourseInfoModel.CourseInfo[];

    public selectedGeneralOrderSections: CourseInfoModel.GeneralOrderInfo[] = [];
    public selectedRollCalls: number[] = [];

    public selectedUserIDs: number[] = [];
    public selectedUsers: UserInfo[] = [];

    //bit to include external training
    public includeTrainingHours: boolean = false;

    public mandatedCreditTypes: ReportingModel.MandateCreditTypes[] = [];

    public selectedCourseYear: string = ReportingModel.CourseYear.NoDate;
    public selectedCompletionStatus: string = ReportingModel.CourseCompletionStatus.All;
    public courseStartRange: string = "";
    public courseEndRange: string = "";

    public courseCompletionStartRange: string = "";
    public courseCompletionEndRange: string = "";

    public acadisCourseCompletionStartRange: Date = new Date();
    public acadisCourseCompletionEndRange: Date = new Date;
    public includeNonStateApprovedCourses: boolean = false;
    public stateTemplate: string = "";

    public canAccessReporting: boolean;

    // initialize the service provider.
    constructor(private apiBaseService: APIBaseService) { }

    /* PUBLIC METHODS **********************/
    /**
     * [resetReportConfiguration] clears out any existing report criteria
     */
    resetReportConfiguration() {
        this.selectedCourseIDs = [];
        this.selectedExternalTrainingCourseIDs = [];
        this.selectedGeneralOrderSections = [];
        this.selectedRollCalls = [];
        this.selectedUserIDs = [];
        this.selectedUsers = [];

        this.selectedCourseYear = ReportingModel.CourseYear.NoDate;
        this.selectedCompletionStatus = ReportingModel.CourseCompletionStatus.All;
        this.courseStartRange = "";
        this.courseEndRange = "";
        this.courseCompletionStartRange = "";
        this.courseCompletionEndRange = "";

        this.includeTrainingHours = false;
    }

    getServerInfo(): Observable<object> {
        const observable = new Observable<ReportingModel.ReportingServerInfo>(subscriber => {
            /**
             * ServerInfo may have been gathered already.
             * If we hit that case we just return [this.ServerInfo].
             */
            const noServerInfo = !(this.serverInfo);
            if (noServerInfo) {
                // Getting serverInfo from API.
                this.apiBaseService.get(_moduleAPIRoot, 'reporting/getServerInfo')
                    .subscribe(
                        (serverInfo: ReportingModel.ReportingServerInfo) => {
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

    generateReport(): Observable<object> {
        //selected stock courses and selected roll calls should be rolled into a single array of courses
        let selectedCourses: number[];

        selectedCourses = this.selectedCourseIDs;
        selectedCourses.concat(this.selectedRollCalls);

        //initialize the payload object to pass into the report generation API call
        const payload = {
            CourseIDs: selectedCourses,
            ExternalTrainingCourseIDs: this.selectedExternalTrainingCourseIDs,
            GeneralOrderSectionIDs: this.selectedGeneralOrderSections.map(generalOrder => generalOrder.SectionID),
            LearnerIDs: this.selectedUsers.map(user => user.UserID),
            CourseYear: this.selectedCourseYear,
            CourseStartRange: this.courseStartRange ?? "",
            CourseEndRange: this.courseEndRange ?? "",
            courseCompletionStartRange: this.courseCompletionStartRange ?? "",
            courseCompletionEndRange: this.courseCompletionEndRange ?? "",
            Status: this.selectedCompletionStatus,
            IncludeTrainingHours: this.includeTrainingHours
        } as ReportingModel.ReportGenerationPayload;

        if (this.canAccessReporting) {
            return this.apiBaseService.post(_moduleAPIRoot, 'reporting/generateReport', JSON.stringify(payload));
        } else {
            return this.apiBaseService.post(_moduleAPIRoot, 'reporting/generateIndividualReport', JSON.stringify(payload));
        }

    }

    generateSummaryReport(): Observable<object> {
        return this.apiBaseService.get(_moduleAPIRoot, 'reporting/generateSummaryReport?category=Mandates&courseYear=' + new Date().getFullYear());
    }

    generateExternalTrainingReport(): Observable<object> {
        return this.apiBaseService.get(_moduleAPIRoot, 'reporting/generateExternalTrainingReport?category=Mandates&courseYear=' + new Date().getFullYear());
    }

    generateTrainingHistorySummaryReport(): Observable<object> {
        return this.apiBaseService.get(_moduleAPIRoot, 'reporting/generateTrainingHistorySummaryReport?trainingYear=' + this.selectedCourseYear);
    }

    generateAcadisReport(): Observable<object> {
        //initialize the payload object to pass into the report generation API call
        const payload = {
            CourseCompletionStartRange: this.acadisCourseCompletionStartRange,
            CourseCompletionEndRange: this.acadisCourseCompletionEndRange,
            StateTemplate: this.stateTemplate,
            IncludeNonStateApprovedCourses: this.includeNonStateApprovedCourses
        } as ReportingModel.AcadisReportPayload;

        return this.apiBaseService.post(_moduleAPIRoot, 'reporting/generateAcadisReport', JSON.stringify(payload));

    }

    submitStateReport(reportData: any): Observable<object> {
        //initialize the payload object to pass into the report generation API call
        const payload = {
            CourseCompletionStartRange: this.acadisCourseCompletionStartRange,
            CourseCompletionEndRange: this.acadisCourseCompletionEndRange,
            StateTemplate: this.stateTemplate,
            IncludeNonStateApprovedCourses: this.includeNonStateApprovedCourses,
            FilteredReportData: JSON.stringify(reportData)
        } as ReportingModel.AcadisReportPayload;
        
        return this.apiBaseService.post(_moduleAPIRoot, 'reporting/submitStateReport', JSON.stringify(payload));

    }

    generateStudentGrades(studentID: string, year: string, status: string, endYear: string): Observable<object> {
        return this.apiBaseService.get(_moduleAPIRoot, 'reporting/getStudentGrades?studentID=' + studentID + '&year=' + year + '&status=' + status + '&endYear=' + endYear);
    }

    getAlternativeTemplate(): Observable<object> {
        return this.apiBaseService.getWithResponseType(_moduleAPIRoot, 'reporting/getAlternativeTemplate', 'arraybuffer');
    }

    /**
     * [getCourses] gathers available courses and categories based on the needed course type selection as defined by the
     * selected report object
     */
    getCourses(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot, 'courses/getCoursesByCourseType?courseType=' + this.selectedReport.DisplayCourseType);
    }

    addExternalCredit(externalCreditToAdd: ReportingModel.ExternalCreditCourse): Observable<object> {
        return this.apiBaseService.post(_moduleAPIRoot, 'reporting/addExternalCredit', JSON.stringify(externalCreditToAdd));
    }

    addExternalCreditType(creditTypeToAdd: ReportingModel.ExternalCreditType): Observable<object> {
        return this.apiBaseService.post(_moduleAPIRoot, 'reporting/addExternalCreditType', JSON.stringify(creditTypeToAdd));
    }

    getExternalCreditTypes(): Observable<object> {
        return this.apiBaseService.get(_moduleAPIRoot, 'reporting/getExternalCreditTypes');
    }

    generateCertificate(sectionID, userID): Observable<object> {
        return this.apiBaseService.getWithResponseType(_coreAPIRoot, 'certificate/generateCertificate?sectionID=' + sectionID + '&userID=' + userID, 'arraybuffer');
    }

    async importExternalTraining(uploadedFile, config): Promise<Observable<object>> {
        // Returning the promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            // Cache the [fileExtention] to compare to the allowed types
            const fileExtention = uploadedFile.name.split('.').pop().toLowerCase();

            // Setup default values if nothing was passed in.
            config.maxFileSize = config.maxFileSize ? config.maxFileSize : 100;
            config.validFileTypes = config.validFileTypes ? config.validFileTypes :
                ['csv'];
            config.relativeAPIRoute = config.relativeAPIRoute ? config.relativeAPIRoute : 'reporting/importExternalTraining';

            // Validate
            if (config.validFileTypes.indexOf(fileExtention) === -1) {
                reject('The selected file type is not allowed.');
            } else if (uploadedFile.size / 1024 / 1024 > config.maxFileSize) {
                reject('The selected file is too large.');
            } else {
                // Validation passed, det up the FormData payload
                const payload = new FormData();
                payload.append('upload', uploadedFile);
                payload.append('JWT', localStorage.getItem('JWT-Access-Token'));
                // Return the API Fetch
                return fetch(_moduleAPIRoot + config.relativeAPIRoute, {
                    method: 'POST',
                    body: payload
                }).then(response => {
                    // Resolve to complete the wait for this method
                    resolve(response.json());
                });
            }
        });
    }

    generateFileDownload(response: HttpResponse<any>, type: string) {
        //extract filename from HTTPResponse
        var filename = "";
        var disposition = response.headers.get('content-disposition');

        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        //create new blob from the HTTPResonse body
        const blob = new Blob([response.body], { type: type })
        const blobUrl = window.URL.createObjectURL(blob);

        //setup download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        link.click();
        link.remove();

        //revoke/destroy the blob URL
        URL.revokeObjectURL(blobUrl);
    }

}

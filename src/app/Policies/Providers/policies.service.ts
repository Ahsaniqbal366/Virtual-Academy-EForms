import { EventEmitter, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { isNullOrUndefined } from 'is-what';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';
import { API_URLS } from 'src/environments/environment';
import { PoliciesDetailInfo, PoliciesInfo, UserAssessment, PoliciesServerInfo, PoliciesUpdateInfo, ResetPolicy } from './policies.model';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { IAddPolicyAssesment } from '../Components/Dialogs/add-new-assesment.dialog';
import { PolicyConstant } from '../model/policy.constant';

const _coreAPIRoot = API_URLS.Core;
const _policiesAPIRoot = API_URLS.Policies;

@Injectable()
export class PoliciesManagementService {
    constructor(
        private apiBaseService: APIBaseService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    // public policiesTypes: PoliciesTypeInfo[];
    public serverInfo: PoliciesServerInfo;

    public userInfo: UserInfo;
    public isAdmin: boolean;
    public isReviewingPoliciesChanges: boolean;
    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/
    public canEditPolicies() {
        var output = true;
        // if (this.isManagerView && !this.serverInfo.permissions.canEditPoliciesForOtherUsers) {
        //     output = false;
        // }
        return output;
    }

    getAllPolicies(isDeleted: boolean, searchText: string, hasPendingAcknowledgement: boolean): Observable<object> {
        const apiParams = {
            "policyFilters": {
                "isDeleted": isDeleted,
                "hasPendingAcknowledgement": hasPendingAcknowledgement,
                "search": searchText
            }
        };
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/GetAll-records', JSON.stringify(apiParams));
    }

    getPoliciesForCurrentUser(hasPendingUserAcknowledgement: boolean, searchText: string): Observable<object> {
        const apiParams = {
            "policyFilters": {
                "search": searchText,
                "userID": 0,
                "hasPendingUserAcknowledgement": hasPendingUserAcknowledgement
            },
            "pageInfo": {
                "pageSize": 0,
                "pageNumber": 0
            },
            "sortOrder": "string",
            "direction": "string"
        };
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/User/GetAll', JSON.stringify(apiParams));
    }

    getPoliciesDetailsForCurrentUser(policyId: Number, userId: Number): Observable<object> {
        return this.apiBaseService.get(_policiesAPIRoot, 'Policy/api/v1/User/Get/' + policyId + '/' + userId);
    }

    getTokenInfo(): Observable<object> {
        return this.apiBaseService.get(_policiesAPIRoot, 'User/api/v1/Get-Token-Info');
    }

    getPoliciesUserInfo(): Observable<object> {
        return this.apiBaseService.get(_policiesAPIRoot, 'User/api/v1/GetAll');
    }

    getPolicyStatus(): Observable<object> {
        return this.apiBaseService.get(_policiesAPIRoot, 'Policy/api/v1/Get-Policy-Statuses');
    }

    getPolicyDetails(policyID: Number, policyStatusID: Number): Observable<object> {
        console.log("check", policyStatusID);
        return this.apiBaseService.getAll(_policiesAPIRoot, 'Policy/api/v1/Get/' + policyID + '/' + policyStatusID);
    }

    deletePolicy(policyID: Number): Observable<object> {
        return this.apiBaseService.patch(_policiesAPIRoot, 'Policy/api/v1/Archive-policy/' + policyID);
    }

    updatePolicy(policyInfo: any): Observable<object> {
        return this.apiBaseService.put(_policiesAPIRoot, 'Policy/api/v1/Update', JSON.stringify(policyInfo));
    }

    unarchivePolicy(policyID: Number): Observable<object> {
        return this.apiBaseService.patch(_policiesAPIRoot, 'Policy/api/v1/UnArchive-policy/' + policyID);
    }

    addPolicy(policyInfo: PoliciesInfo): Observable<object> {
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/Add', JSON.stringify(policyInfo));
    }

    addUpdateAssessment(userAssessment: Array<any>): Observable<object> {
        console.log("check user", userAssessment);
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/User/Add-Update-Assessment', JSON.stringify(userAssessment[0]));
    }

    acknowledgmentAssessment(acknowledgmentAssessment: Array<any>): Observable<object> {
        console.log("check user", acknowledgmentAssessment);
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/User/Acknowledge-Assessment', JSON.stringify(acknowledgmentAssessment[0]));
    }

    renewPolicy(policyInfo: any): Observable<object> {
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/Reissue-policy', JSON.stringify(policyInfo));
    }

    resetPolicy(policyResetInfo: ResetPolicy): Observable<object> {
        return this.apiBaseService.post(_policiesAPIRoot, 'Policy/api/v1/Reset-policy', JSON.stringify(policyResetInfo));
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/
    // private _sanitizePoliciesInfo(policiesInfo: PoliciesInfo): PoliciesInfo {
    //     policiesInfo.ExpirationDate = policiesInfo.ExpirationDate || null;

    //     return policiesInfo;
    // }

    private _setUserPermissions(isAdmin: boolean) {
        this.isAdmin = isAdmin;

        return this.isAdmin;
    }

    public static validateAssessment(addPolicyAssesment: IAddPolicyAssesment): TValidaAssessmentResponse {
        let errors: Array<TErrorAssessment> = [];
        let isEmpty: boolean = false;

        if (addPolicyAssesment && 'policyAssessmentQuestions' in addPolicyAssesment && addPolicyAssesment.policyAssessmentQuestions.length) {
            addPolicyAssesment.policyAssessmentQuestions.forEach((element, index) => {
                var questionNumber = index + 1;

                if (addPolicyAssesment.policyAssessmentQuestions.length == 1) { // IF ONLY First Question Exist
                    if (element.questionBody.length == 0 && element.policyAssessmentAnswers.length <= 1) {
                        if (element.policyAssessmentAnswers.length == 0) {   // question empty and no answer
                            isEmpty = true;
                            return;
                        } else if (element.policyAssessmentAnswers.length == 1) {  // question empty and answer exist
                            // question empty and answer exist with empy body we have to ignore assessment
                            let answers = element.policyAssessmentAnswers[0];
                            if (answers.answerBody.length == 0) {
                                isEmpty = true;
                                return;
                            } else {
                                // question empty and multiple answer exist with empty or filed body
                                PoliciesManagementService.validateQuestionNAnswerBody(element, errors, questionNumber);
                            }
                        } else if (element.policyAssessmentAnswers.length > 1) {
                            PoliciesManagementService.validateQuestionNAnswerBody(element, errors, questionNumber);
                        }
                    } else {  //Question body exist or question may not filled or question filled body not exist
                        PoliciesManagementService.validateQuestionNAnswerBody(element, errors, questionNumber);
                    }
                } else { // Multiple Question case 
                    PoliciesManagementService.validateQuestionNAnswerBody(element, errors, questionNumber);
                }
            });
        } else {
            return { isSubmit: false, errorMsg: PolicyConstant.Text.NoValidAssessment, isEmpty: true };
        }

        if (errors && errors.length && isEmpty == false) {
            errors = PoliciesManagementService.sortAscByKey(errors, 'order');
            let errorMsg = '<div class="alert-box">';
            for (let item of errors) {
                errorMsg += item.err;
            }
            errorMsg += '</div>';
            return { isSubmit: false, errorMsg, isEmpty: false };
        } else if (isEmpty) {
            return { isSubmit: false, errorMsg: '', isEmpty: true };
        } else {
            return { isSubmit: true, errorMsg: '', isEmpty: false };
        }
    }

    private static validateQuestionNAnswerBody(element: any, errors: Array<TErrorAssessment>, questionNumber: number) {
        if (element.questionBody.length == 0) {
            errors.push({ err: 'Add Question: <span class="badge badge-light">' + questionNumber + ' </span><br/>', order: questionNumber });
        } else {
            if (element.policyAssessmentAnswers.length == 0) {
                errors.push({ err: 'Add Options to Question: <span class="badge badge-light">' + questionNumber + '</span><br/>', order: questionNumber });
            }
            else {
                element.policyAssessmentAnswers.forEach((answers, number) => {
                    var optionNumber = number + 1;
                    if (answers.answerBody.length == 0) {
                        errors.push({ err: 'Add Option: <span class="badge badge-warn">   ' + optionNumber + '</span> to Question: <span class="badge badge-light">' + questionNumber + '</span><br/>', order: questionNumber });
                    }
                });
            }
        }
    }

    public static sortAscByKey(array: any, key: string) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
}

type TValidaAssessmentResponse = {
    isSubmit: boolean,
    errorMsg: string,
    isEmpty: boolean
}

type TErrorAssessment = {
    err: string,
    order: number
}
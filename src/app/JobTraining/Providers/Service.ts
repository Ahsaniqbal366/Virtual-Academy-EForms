import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIBaseService } from '../../shared/API.Base.Service';
// Custom interfaces
import * as Model from './Model';
import * as JT_FormsModel from './Forms.Model';

import { API_URLS } from 'src/environments/environment';

const _apiRoot = API_URLS.JobTraining;

@Injectable()
export class JobTrainingProvider {

    // define objects to store in the service.
    public serverInfo: Model.ServerInfo;

    public shifts: Model.JobTrainingShift[];
    public programs: Model.BasicTrainingProgramInfo[];
    public trainees: Model.TraineeUserInfo[];

    // Other 'selected *' are stored on their own class
    public selectedProgram: Model.FullTrainingProgramInfo;

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
                this.apiBaseService.get(_apiRoot, 'jobtraining/getServerInfo')
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


    /******************* PROGRAM METHODS **********************/

    /** Gather all unarchived programs */
    getPrograms(): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getPrograms');
    }

    /**
     * [getProgram] will get the full program info for a single program.
     * Expected to be ran as a program is selected.
     */
    getProgram(programID: number): Observable<object> {

        // BDH - 01-22-20 - calling this method will now sync the selected program value to the returned
        // [FullTrainingProgramInfo] object. This will ensure that the correct program is selected upon refresh
        // when the Service would normally be out of sync
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getProgram?programID=' + programID)
            .pipe(
                map(
                    (fullProgramInfo: Model.FullTrainingProgramInfo) => {
                        this.selectedProgram = fullProgramInfo;

                        return fullProgramInfo;
                    }
                )
            );
    }
    /** UNFINISHED - Archive the program */
    deleteProgram(programID: string) {
        // TODO: DO, more like archive the program
        this.programs.shift();
        return this.programs;
    }

    /** Fully copy all info for a training program (except for trainee records) */
    cloneTrainingProgram(sourceProgramID: number): Observable<object> {
        const apiParams = '?sourceProgramID=' + sourceProgramID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/cloneTrainingProgram' + apiParams);
    }

    /******************* FORM DESIGNER METHODS ************************/
    getFullFormInfoForDesigner(programID: number, formID: number): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&formID=' + formID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getFullFormInfoForDesigner' + apiParams);
    }

    
    /** Update sort orders for all forms using the list of forms. */
    updateFormSorting(forms: Model.BasicFormInfo[]): Observable<object> {
        const stringData = JSON.stringify(forms);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateFormSorting', stringData);
    }

    /** Add/Update/Disable/Restore some basic settings for a form */
    updateForm(formInfo: JT_FormsModel.FullFormInfo): Observable<object> {
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateForm', JSON.stringify(formInfo));
    }

    /** Add/Update/Disable/Restore the given likert for a form */
    updateFormLikert(programID: number, formID: number, likertInfo: JT_FormsModel.FormLikertInfo): Observable<object> {
        var stringData = JSON.stringify({
            ProgramID: programID,
            FormID: formID,
            LikertInfo: likertInfo
        });
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateFormLikert', stringData);
    }

    /** Add/Update/Disable/Restore the given categories for a form */
    updateFormCategories(programID: number, formID: number, categories: JT_FormsModel.BasicFormCategoryInfo[]): Observable<object> {
        var stringData = JSON.stringify({
            ProgramID: programID,
            FormID: formID,
            Categories: categories
        });
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateFormCategories', stringData);
    }

    /** Update [SortOrder] & [IsDeleted] data for all category fields based on the given list. */
    updateCategoryFieldSortingAndDeletedStatus(programID: number, formID: number, categoryID: number, fields: JT_FormsModel.FormFieldInfo[]): Observable<object> {
        var stringData = JSON.stringify({
            ProgramID: programID,
            FormID: formID,
            CategoryID: categoryID,
            Fields: fields
        });
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateCategoryFieldSortingAndDeletedStatus', stringData);
    }

    updateFormField(programID: number, formID: number, categoryID: number, fieldInfo: JT_FormsModel.FormFieldInfo): Observable<object> {
        var stringData = JSON.stringify({
            ProgramID: programID,
            FormID: formID,
            CategoryID: categoryID,
            FieldInfo: fieldInfo
        });
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateFormField', stringData);
    }

    

    /******************* SHIFT METHODS ************************/
    getShifts(): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getShifts');
    }

    /** Update trainee shift */
    updateShift(traineeInfo: Model.TraineeUserInfo): Observable<object> {
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateShift', JSON.stringify(traineeInfo));
    }

    /******************* PROGRAM USERS METHODS **********************/

    /**
     * [getAllProgramUsers] will get all users for the given program.
     */
    getAllProgramUsers(programID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getAllProgramUsers?programID=' + programID);
    }

    addUserToProgram(userInfo: Model.ProgramUserInfo): Observable<object> {
        const stringData = JSON.stringify(userInfo);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/addUserToProgram', stringData);
    }

    /** Archive any user from the program (trainee or otherwise) */
    removeUserFromProgram(programID: number, userID: number) {
        const payload = {
            ProgramID: programID,
            UserID: userID
        } as Model.ProgramUserInfo;
        return this.apiBaseService.post(_apiRoot, 'jobtraining/removeUserFromProgram', JSON.stringify(payload));
    }

    /** Gather users that aren't in this program */
    getUsersNotInProgram(programID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getUsersNotInProgram?programID=' + programID);
    }

    /** Updates a users roles (if possible) */
    updateUserRoles(userInfo: Model.ProgramUserInfo) {
        const stringData = JSON.stringify(userInfo);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateUserRoles', stringData);
    }

    /******************* TRAINEE METHODS **********************/
    /**
     * [getTraineeUsers] will get all trainee users for the given program.
     */
    getTraineeUsers(programID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeUsers?programID=' + programID);
    }

    getTraineeUser(programID: number, traineeUserID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeUser?programID=' + programID + '&traineeUserID=' + traineeUserID);
    }

    /** Assign new trainee, specified in [traineeUser], to program [programID] */
    assignTraineeToProgram(traineeUser: Model.TraineeUserInfo): Observable<object> {
        const stringData = JSON.stringify(traineeUser);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/assignTraineeToProgram', stringData);
    }

    /**Claim a trainee */
    claimTrainee(programID: number, traineeInfo: Model.TraineeUserInfo): Observable<object> {
        const payload = {
            ProgramID: programID,
            ShiftID: traineeInfo.ShiftID,
            UserID: traineeInfo.UserID
        } as Model.TraineeUserInfo;
        return this.apiBaseService.post(_apiRoot, 'jobtraining/claimTrainee', JSON.stringify(payload));
    }

    /**Release a trainee */
    releaseTrainee(programID: number, traineeInfo: Model.TraineeUserInfo): Observable<object> {
        const payload = {
            ProgramID: programID,
            ShiftID: traineeInfo.ShiftID,
            UserID: traineeInfo.UserID
        } as Model.TraineeUserInfo;
        return this.apiBaseService.post(_apiRoot, 'jobtraining/releaseTrainee', JSON.stringify(payload));
    }

    /**
     * [resummarizeTrainee] will recaluate summary info for the trainee user and
     * return that new data.
     */
    resummarizeTrainee(programID: number, traineeUserID: number): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/resummarizeTrainee' + apiParams);
    }

    /******************* FORM METHODS **********************/

    getTraineePhasesAndForms(programID: number, traineeUserID: number, formFilterMode: string): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID
            + '&formFilterMode=' + formFilterMode;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineePhasesAndForms' + apiParams);
    }

    getTraineeTaskList(programID: number, traineeUserID: number, taskListID: number): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID
            + '&taskListID=' + taskListID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeTaskList' + apiParams);
    }

    // getTraineeCallLog(programID: number, traineeUserID: number): Observable<object> {
    //     const apiParams = '?programID=' + programID 
    //     + '&traineeUserID=' + traineeUserID;
    //     return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeCallLog' + apiParams);
    // }

    getTraineeForm(traineeFormRecordID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeForm?traineeFormRecordID=' + traineeFormRecordID);
    }

    getTraineeFormsForExport(programID: number, traineeUserID: number): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeFormsForExport' + apiParams);
    }

    getTraineeFormsForAdminToDo(programID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeFormsForAdminToDo?programID=' + programID);
    }

    /** Get available forms to populate new form dialog */
    getAvailableFormsForProgram(programID: number): Observable<object> {
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getAvailableFormsForProgram?programID=' + programID);
    }

    /** Get single form to populate new form dialog */
    _getProgramFormByID(programID: number, formID: number): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&formID=' + formID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getProgramFormByID' + apiParams);
    }


    /** Archive the trainee's form record */
    removeTraineeFormRecord(recordID: number) {
        return this.apiBaseService.post(_apiRoot, 'jobtraining/removeTraineeFormRecord', JSON.stringify(recordID));
    }

    startTraineeFormRecord(traineeFormRecordToStart: Model.TraineeFormRecordInfo): Observable<object> {
        const stringData = JSON.stringify(traineeFormRecordToStart);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/startTraineeFormRecord', stringData);
    }

    saveTraineeForm(traineeFormUpdatePayload: JT_FormsModel.TraineeFormUpdatePayload): Observable<object> {
        const stringData = JSON.stringify(traineeFormUpdatePayload);
        return this.apiBaseService.post(_apiRoot, 'jobtraining/saveTraineeForm', stringData);
    }

    /******************* [Phase] METHODS ************************/
    UpdateTraineePhase(traineeUser: Model.TraineeUserInfo): Observable<object> {
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateTraineePhase', JSON.stringify(traineeUser));
    }

    UpdateFormPhase(traineeFormRecordInfo: Model.TraineeFormRecordInfo): Observable<object> {
        return this.apiBaseService.post(_apiRoot, 'jobtraining/updateFormPhase', JSON.stringify(traineeFormRecordInfo));
    }

    /******************* REPORTING METHODS ************************/
    getTrainerLikertSummary(
        programID: number,
        trainerUserID: number,
        warningPercentageThreshold: number,
        filterOutEmptyForms: boolean,
        filterOutIncompleteForms: boolean,
        filterFromDate: string,
        filterToDate: string
      ): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&trainerUserID=' + trainerUserID
            + '&warningPercentageThreshold=' + warningPercentageThreshold
            + '&filterOutEmptyForms=' + filterOutEmptyForms
            + '&filterOutIncompleteForms=' + filterOutIncompleteForms
            + '&filterFromDate=' + filterFromDate
            + '&filterToDate=' + filterToDate;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTrainerLikertSummary' + apiParams);
    }

    getTraineeScoreTrend(
        programID: number,
        traineeUserID: number,
        filterFromDate: string,
        filterToDate: string
      ): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID
            + '&filterFromDate=' + filterFromDate
            + '&filterToDate=' + filterToDate;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTraineeScoreTrend' + apiParams);
    }

    getCallLogHistory(
        programID: number,
        traineeUserID: number,
        filterFromDate: string,
        filterToDate: string
      ): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID
            + '&filterFromDate=' + filterFromDate
            + '&filterToDate=' + filterToDate;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getCallLogHistory' + apiParams);
    }

    getTrainerTraineePairingHistory(
        programID: number,
        traineeUserID: number,
      ): Observable<object> {
        const apiParams = '?programID=' + programID
            + '&traineeUserID=' + traineeUserID;
        return this.apiBaseService.get(_apiRoot, 'jobtraining/getTrainerTraineePairingHistory' + apiParams);
    }

    
    
}

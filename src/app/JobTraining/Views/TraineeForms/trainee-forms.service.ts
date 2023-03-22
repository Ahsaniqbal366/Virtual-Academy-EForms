/**
 * trainee-forms.service.ts is used to aid in communication
 * between the trainee-forms page and some of it's injected sub-components.
 * 
 * Some of the sub-components will need to set flags, etc that affect the parent view a bit.
 * This was a very easy way to have the parent & child share flags as needed.
 * 
 * https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
 */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as JobTrainingModel from '../../Providers/Model';
import { isNullOrUndefined } from 'is-what';
import { DatePipe } from '@angular/common';
import { Event, Router, NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable()
export class TraineeFormsService {
    // define service provider and route provider when component is constructed
    constructor(
        private datepipe: DatePipe,
        private router: Router,
        private navController: NavController
    ) {
        /**
         * Listen for [NavigationEnd] [router] events to clean up the service variables, like
         * [selectedTraineeFormRecordID], etc.
         */
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this._tryCloseInlineFormMode();
            }
        });
    }

    /**
     * [traineeUserInfo] will be the currently selected trainee.
     * It's on the shared service because it's [Summary] data is updated as child views
     * affect the trainee's data.
     */
    public traineeUserInfo: JobTrainingModel.TraineeUserInfo;

    /**
     * [hideCompletedItems] determines if we're hiding "Completed" forms/tasks
     * It's on this shared service because this is where filtering happens.
     */
    public hideCompletedItems: boolean = false;

    /**
     * INLINE FORM FLAGS & METHODS.
     */
    public hasFormOpenInInlineMode: boolean;

    private _onFormCloseCallback: Function = undefined;

    /**
     * [selectedTraineeFormRecordID] & [selectedTaskID] get set as the FormDetails as that component
     * loads and parses the URL/querys data.
     * This is to cover cases like:
     * - user navigating around with the browser back/next buttons.
     * - routing blocked by unsaved changes prompt
     * -----
     * A [selectedTaskID] won't be available in all views. It would be null when the current view
     * is not a task list, for example.
     */
    public selectedTraineeFormRecordID: number;
    public selectedTaskID: number;

    public setSelectedRecordIDs(traineeFormRecord: JobTrainingModel.TraineeFormRecordInfo) {
        this.selectedTraineeFormRecordID = traineeFormRecord.RecordID;
        this.selectedTaskID = traineeFormRecord.TaskID;
    }

    public openInlineFormMode(traineeFormRecordID: number, onFormClose: Function = undefined) {        
        this.hasFormOpenInInlineMode = true;
        if (onFormClose !== undefined) {
            this._onFormCloseCallback = onFormClose;
        }

        let baseUrl = this.router.url;
        var isAlreadyFormDetails = (baseUrl.indexOf('/formdetails') !== -1)
        if (isAlreadyFormDetails) {
            baseUrl = this.router.url.split('/formdetails')[0];
        }
        /**
         * Using [navController.navigateRoot] to NOT put this component on the ionic page stack.
         */
        this.navController.navigateRoot(baseUrl + '/formdetails/' + traineeFormRecordID);
    }

    /**
     * [closeInlineFormMode] is called as the user clicks the close button on an opened form,
     * if the user clicks our custom app back button while a form is open, etc.
     * The goal of the method is to change the URL/route to exit the "formdetails" state.
     */
    public closeInlineFormMode() {
        let baseUrl = this.router.url;
        var isFormDetails = (baseUrl.indexOf('/formdetails') !== -1)
        if (isFormDetails) {
            baseUrl = this.router.url.split('/formdetails')[0];
            this.navController.navigateRoot(baseUrl);
        }
        else {
            /**
             * It turns out "formdetails" route wasn't active, but this still got called.
             * Let's clear variables to be safe.
             */
            this._clearInlineFormModeVariables();
        }

        // JDB 8/14/2020 - Consider [_onFormCloseCallback] here.
        if (this._onFormCloseCallback !== undefined) {
            this._onFormCloseCallback();
            this._onFormCloseCallback = undefined;
        }
    }

    /**
     * [_tryCloseInlineFormMode] is a private method to be called by [router] change events.
     * If the user navigates away from an opened form, we try to properly clear out the relevant
     * variables.
     */
    private _tryCloseInlineFormMode() {
        // Check if the "formdetails" route is closed.
        let baseUrl = this.router.url;
        var isNotFormDetails = (baseUrl.indexOf('/formdetails') === -1)
        if (isNotFormDetails) {
            this._clearInlineFormModeVariables();
        }
    }

    private _clearInlineFormModeVariables() {
        // Gotta clear the previously selected ID so it doesn't still appear as highlighted after closing.
        this.selectedTraineeFormRecordID = null;
        this.selectedTaskID = null;
        this.hasFormOpenInInlineMode = false;
    }
    /**
     * END OF: INLINE FORM FLAGS & METHODS
     */

    /**
     * FORM SAVING NOTIFICATION WORKFLOW.
     * Connects form-details to any listening parent views that want to subscribe to it.
     */
    private formSavedSource = new Subject<JobTrainingModel.TraineeFormRecordInfo>();
    public formSaved$ = this.formSavedSource.asObservable();
    public formSaved(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        this.formSavedSource.next(traineeFormRecordInfo);
    }
    /**
     * END OF: FORM SAVING NOTIFICATION WORKFLOW.
     */

    /**
     * SEARCH BAR/FILTERING VARIABLES AND METHODS.
     */
    // [searchTextboxInputValue] - Shared search box input between all forms sub-view/components.
    public searchTextboxInputValue: string;
    public isSearching: boolean;

    public clearSearchBoxInput() {
        this.searchTextboxInputValue = '';
        this.isSearching = false;
    }

    public filterTaskList(taskList: JobTrainingModel.FullTraineeTaskListInfo, filterRecordsByDate: boolean) {
        /**
         * We're using an [Observable] so the filtering can run in the background.
         * That makes it work a lot better with our searching flag.
         */
        const observable = new Observable<JobTrainingModel.FullTraineeTaskListCategoryInfo[]>(subscriber => {
            let formattedSearchText = '';
            let hasSearchText = false;
            if (!isNullOrUndefined(this.searchTextboxInputValue)) {
                formattedSearchText = this.searchTextboxInputValue.toLowerCase();
                if (formattedSearchText.length > 0) {
                    hasSearchText = true;
                }
            }

            /**
             * We're gonna deep copy [this.taskList.Categories] so we can filter it without
             * breaking the original datasource.
             * ----
             * https://stackoverflow.com/questions/39506619/angular2-how-to-copy-object-into-another-object/48266224 
             * EX: let copy = JSON.parse(JSON.stringify(myObject))
             * 
             * JDB - Only initialise this if we need it.
             */
            let copyTaskListCategories: JobTrainingModel.FullTraineeTaskListCategoryInfo[];

            if (hasSearchText) {
                // See deep copy comment above.
                copyTaskListCategories = JSON.parse(JSON.stringify(taskList.Categories));

                /**
                 * Filter tasks/form records from our copied [copyTaskListCategories] array.
                 */
                copyTaskListCategories = copyTaskListCategories.filter(loopedCategory => {
                    /**
                     * Let says the category is a MATCH if the name matches.
                     * We will fall back to other cases if they name doesn't match.
                     */
                    let categoryHasMatch = (loopedCategory.Name.toLowerCase().indexOf(formattedSearchText) > -1);

                    loopedCategory.Tasks = loopedCategory.Tasks.filter((loopedTask) => {
                        /**
                         * Let says the task is a MATCH if the name matches.
                         * We will fall back to other cases if they name doesn't match.
                         */
                        let taskHasMatch = (loopedTask.Name.toLowerCase().indexOf(formattedSearchText) > -1);

                        if (!taskHasMatch) {
                            /**
                             * No match was found on name, but maybe task has form records that match.
                             * Let's check!
                             */
                            loopedTask.TraineeFormRecords = loopedTask.TraineeFormRecords.filter((loopedFormRecord) => {
                                /**
                                 * Some filters aren't applied, like the record.Date.
                                 * That type of filter wouldn't make sense on the performance task list
                                 * since it doesn't use dates.
                                 */
                                let recordDateMatched = false;
                                if (filterRecordsByDate) {

                                    const formattedRecordDate = this.datepipe.transform(loopedFormRecord.Date, 'MM/dd/yyyy');

                                    // The form record might match on date.
                                    recordDateMatched = (formattedRecordDate.indexOf(formattedSearchText) > -1);
                                }

                                // We also say the form record is a match if it's currently selected.
                                const recordIsOpened = this.selectedTraineeFormRecordID == loopedFormRecord.RecordID;

                                return recordDateMatched || recordIsOpened;
                            });

                            // Override [taskHasMatch] if any records were matched.
                            taskHasMatch = (loopedTask.TraineeFormRecords.length > 0);
                        }

                        // Auto expand the matched tasks, if possible. Not all tasks have GUIData.
                        if (taskHasMatch && !isNullOrUndefined(loopedTask.GUIData)) {
                            loopedTask.GUIData.Expanded = true;
                        }

                        return taskHasMatch;
                    });

                    if (!categoryHasMatch) {
                        // Override [categoryHasMatch] if any tasks were matched.
                        categoryHasMatch = (loopedCategory.Tasks.length > 0);
                    }

                    // Auto expand the matched categories, if possible. Not all categories have GUIData.
                    if (categoryHasMatch && !isNullOrUndefined(loopedCategory.GUIData)) {
                        loopedCategory.GUIData.Expanded = true;
                    }

                    return categoryHasMatch;
                });
            }

            /**
             * JDB 8/11/2020
             * Need to filter out [IsComplete] items at each level if [this.hideCompletedItems] is true.
             */
            if (this.hideCompletedItems) {
                // Only reset [copyTaskListCategories] to the original datasource if we aren't also searching.
                if (!hasSearchText) {
                    // See deep copy comment above.
                    copyTaskListCategories = JSON.parse(JSON.stringify(taskList.Categories));
                }                

                /**
                 * Filter tasks/form records from our copied [copyTaskListCategories] array.
                 */
                copyTaskListCategories = copyTaskListCategories.filter(loopedCategory => {
                    // We'll spoof [categoryHasMatch] to TRUE so we don't hide Category rows.
                    const categoryHasMatch: boolean = true;

                    // Check child items.
                    loopedCategory.Tasks = loopedCategory.Tasks.filter(loopedTask => {
                        let taskHasMatch: boolean;

                        // It may not be relevant to look at TraineeFormRecords, so we make sure this is checked beforehand.
                        if (!isNullOrUndefined(loopedTask.Summary)) {
                            taskHasMatch = loopedTask.Summary.Status.IsComplete !== true;
                        }
                        
                        loopedTask.TraineeFormRecords = loopedTask.TraineeFormRecords.filter(loopedFormRecord => {
                            let formRecordHasMatch: boolean;

                            // [Summary] can be null/undefined sometimes. Make sure it exists.
                            if (!isNullOrUndefined(loopedFormRecord.Summary)) {
                                // TraineeFormRecord can match if it's not marked IsComplete.
                                formRecordHasMatch = loopedFormRecord.Summary.Status.IsComplete !== true;
                            }

                            return formRecordHasMatch;
                        });

                        // If the task itself didn't match, it is still a match if it has any
                        //  TraineeFormRecords remaining (because they are matches).
                        if (!taskHasMatch) {
                            taskHasMatch = loopedTask.TraineeFormRecords.length > 0;
                        }

                        return taskHasMatch;
                    });

                    return categoryHasMatch;
                });
            }

            // If we aren't searching or hiding completed items, return everything as-is.
            if (!hasSearchText && !this.hideCompletedItems) {
                copyTaskListCategories = taskList.Categories;
            }

            subscriber.next(copyTaskListCategories);
            subscriber.complete();
        });
        return observable;
    }

    public filterPhasesAndForms(phases: JobTrainingModel.TraineePhaseInfo[]) {
        /**
         * We're using an [Observable] so the filtering can run in the background.
         * That makes it work a lot better with our searching flag.
         */
        const observable = new Observable<JobTrainingModel.TraineePhaseInfo[]>(subscriber => {
            let formattedSearchText = '';
            let hasSearchText = false;
            if (!isNullOrUndefined(this.searchTextboxInputValue)) {
                formattedSearchText = this.searchTextboxInputValue.toLowerCase();
                if (formattedSearchText.length > 0) {
                    hasSearchText = true;
                }
            }

             /**
              * We're gonna deep copy [phases] so we can filter it without
              * breaking the original datasource.
              * ----
              * https://stackoverflow.com/questions/39506619/angular2-how-to-copy-object-into-another-object/48266224 
              * EX: let copy = JSON.parse(JSON.stringify(myObject))
              * 
              * JDB - Only initialise this if we need it.
              */
            let copyPhases: JobTrainingModel.TraineePhaseInfo[];

            if (hasSearchText) {
                // See deep copy comment above.
                copyPhases = JSON.parse(JSON.stringify(phases));

                /**
                 * Filter tasks/form records from our copied [copyTaskListCategories] array.
                 */
                copyPhases = copyPhases.filter(loopedPhase => {
                    /**
                     * Let says the phase is a MATCH if the name matches.
                     * We will fall back to other cases if they name doesn't match.
                     */
                    let phaseHasMatch = (loopedPhase.Name.toLowerCase().indexOf(formattedSearchText) > -1);

                    loopedPhase.FormGroups = loopedPhase.FormGroups.filter((loopedFormGroup) => {
                        /**
                         * No match was found on name, but maybe task has form records that match.
                         * Let's check!
                         */
                        loopedFormGroup.TraineeFormRecords = loopedFormGroup.TraineeFormRecords.filter((loopedFormRecord) => {
                            const formattedRecordDate = this.datepipe.transform(loopedFormRecord.Date, 'MM/dd/yyyy');

                            // The form record might match on [form.Name].
                            const recordNameMatched = (loopedFormRecord.BasicFormInfo.Name.toLowerCase().indexOf(formattedSearchText) > -1);

                            // The form record might match on date.
                            const recordDateMatched = (formattedRecordDate.indexOf(formattedSearchText) > -1);

                            // We also say the form record is a match if it's currently selected.
                            const recordIsOpened = this.selectedTraineeFormRecordID == loopedFormRecord.RecordID;

                            return recordNameMatched || recordDateMatched || recordIsOpened;
                        });

                        // Set [formGroupHasMatch] if any records were matched.
                        const formGroupHasMatch = (loopedFormGroup.TraineeFormRecords.length > 0);

                        // Auto expand the matched form groups, if possible.
                        if (formGroupHasMatch && !isNullOrUndefined(loopedFormGroup.GUIData)) {
                            loopedFormGroup.GUIData.Expanded = true;
                        }

                        return formGroupHasMatch;
                    });

                    if (!phaseHasMatch) {
                        // Override [categoryHasMatch] if any tasks were matched.
                        phaseHasMatch = (loopedPhase.FormGroups.length > 0);
                    }

                    // Auto expand the matched phases, if possible.
                    if (phaseHasMatch && !isNullOrUndefined(loopedPhase.GUIData)) {
                        loopedPhase.GUIData.Expanded = true;
                    }

                    return phaseHasMatch;
                });
            }

            /**
             * JDB 8/10/2020
             * Need to filter out [IsComplete] items at each level if [this.hideCompletedItems] is true.
             */
            if (this.hideCompletedItems) {
                // Only reset [copyPhases] to the original datasource if we aren't also searching.
                if (!hasSearchText) {
                    // See deep copy comment above.
                    copyPhases = JSON.parse(JSON.stringify(phases));
                }

                /**
                 * Filter tasks/form records from our copied [copyPhases] array.
                 */
                copyPhases = copyPhases.filter(loopedPhase => {
                    // We'll spoof [phaseHasMatch] to TRUE so we don't hide Phase rows.
                    const phaseHasMatch: boolean = true;

                    // Check child items.
                    loopedPhase.FormGroups = loopedPhase.FormGroups.filter(loopedFormGroup => {
                        let formGroupHasMatch: boolean;

                        loopedFormGroup.TraineeFormRecords = loopedFormGroup.TraineeFormRecords.filter(loopedFormRecord => {
                            let formRecordHasMatch: boolean;

                            // [Summary] can be null/undefined sometimes. Make sure it exists.
                            if (!isNullOrUndefined(loopedFormRecord.Summary)) {
                                // TraineeFormRecord can match if it's not marked IsComplete.
                                formRecordHasMatch = loopedFormRecord.Summary.Status.IsComplete !== true;
                            }

                            return formRecordHasMatch;
                        });

                        // FormGroup can match if it has any TraineeFormRecords remaining.
                        formGroupHasMatch = loopedFormGroup.TraineeFormRecords.length > 0;

                        return formGroupHasMatch;
                    });

                    return phaseHasMatch;
                });
            }
            
            // If we aren't searching or hiding completed items, return everything as-is.
            if (!hasSearchText && !this.hideCompletedItems) {
                copyPhases = phases;
            }

            subscriber.next(copyPhases);
            subscriber.complete();
        });
        return observable;
    }

    /**
     * END OF: SEARCH BAR/FILTERING VARIABLES AND METHODS.
     */
}
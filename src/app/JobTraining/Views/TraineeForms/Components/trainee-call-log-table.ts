import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { TraineeFormsService } from '../trainee-forms.service';
import { AddFormDialogFactory, AddFormDialogInputInfo } from '../AddFormDialog/add-form-dialog';
import { TraineeFormsPopoverMenuFactory } from '../PopoverMenu/trainee-forms.popover-menu.component';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

// define component
@Component({
    selector: 'trainee-call-log-table',
    templateUrl: 'trainee-call-log-table.html',
    styleUrls: ['../../../page.scss', '../trainee-forms.scss']
})

export class TraineeCallLogTableComponent implements OnInit, OnDestroy {
    // define service provider and route provider when component is constructed
    constructor(
        private traineeFormsPopoverMenuFactory: TraineeFormsPopoverMenuFactory,
        private addFormDialogFactory: AddFormDialogFactory,
        public jobTrainingService: JobTrainingProvider,
        private loadingService: IonicLoadingService,
        public traineeFormsService: TraineeFormsService,
        private datepipe: DatePipe
    ) {
        /**
            * Listen for [formSaved$] "Observable" events so that we know when to regenerate summaries.
            * -----
            * Parent/child/sibiling communication workflow taken from this link:
            * https://angular.io/guide/component-interaction
            */
        this._formSavedSubscription = traineeFormsService.formSaved$.subscribe(
            (savedTraineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) => {
                this._onCallLogFormSaved(savedTraineeFormRecordInfo);
            });
    }


    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    public initialized = false;

    // [callLog] is basically a cache of our full dataset.
    public callLog: JobTrainingModel.FullTraineeTaskListInfo;
    /**
     * [filteredCallLogCategories] is what we'll really show in the GUI. It's filtered
     * by a searchbox, and maybe more?
     */
    public filteredCallLogCategories: JobTrainingModel.FullTraineeTaskListCategoryInfo[];

    public selectedCallTypeID: number;

    /*******************************************
     * PRIVATE VARIABLES
     *******************************************/
    /**
     * [_formSavedSubscription] is set in the class [constructor].
     * Variable is used to track an observable subscription.
     */
    private _formSavedSubscription: Subscription;

    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    /** Click event for the expandable card */
    public onCallTypeClick(event: Event, callType: JobTrainingModel.FullTraineeTaskListTaskInfo): void {

        // grab the full classname list of the target element
        const targetElementClassName = (event.target as Element).className;

        // if the classname "block-parent-event" does not exist, go ahead and proceed with the parent row's event
        if (targetElementClassName.indexOf('block-parent-event') === -1) {
            if (callType.GUIData.Expanded) {
                this._collapseCallType(callType);
            } else {
                this._expandCallType(callType);
            }
        }
    }

    /** 
     * Opens the new form dialog.
     * If new [TraineeFormRecord] is started, we route to it immediately
     */
    public async openAddFormDialog(callType: JobTrainingModel.FullTraineeTaskListTaskInfo) {
        // Try to preselect [callType.FormID] & [callType.TaskID] when opening the new form dialog here.
        const dialogInput: AddFormDialogInputInfo = {
            preselectedFormID: callType.FormID,
            preselectedTaskID: callType.TaskID
        };
        await this.addFormDialogFactory.openAddFormDialog(dialogInput).then((result: any) => {
            /** Check for a truthy [result] in case the dialog was unexpectedly closed,
             *  and [result.confirmed] to ensure the user confirmed the addition
             */
            if (result.data && result.data.confirmed) {
                // Append the new [traineeFormRecordInfo] to our given [callType] task.                
                callType.HasTraineeFormRecords = true;
                callType.TraineeFormRecords.push(result.data.traineeFormRecordInfo);

                // Auto expand this callType task, if needed.
                if (!callType.GUIData.Expanded) {
                    this._expandCallType(callType);
                }

                // And auto-open the form.
                this._openFormDetailView(result.data.traineeFormRecordInfo);

                /**
                 * Calling [_reloadTaskSummaries] to keep the tasks summary updated
                 * as the form is added. This shouldn't mess up the formDetailView.
                 * 
                 * The user may notice the form moving in the sort order, but I can live with that.
                 */
                const loadInBackground = true;
                this._reloadTaskSummaries(callType, loadInBackground);
            }
        });
    }

    /** Check the clicked element of the parent row to determine if the click event of
      *  of the row should be neglected.
      */
    public onFormRowClick(event: Event, traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {

        // grab the full classname list of the target element
        const targetElementClassName = (event.target as Element).className;

        // if the classname "block-parent-event" does not exist, go ahead and proceed with the parent row's event
        if (targetElementClassName.indexOf('block-parent-event') === -1) {
            this._openFormDetailView(traineeFormRecordInfo);
        }
    }

    public onPopoverMenuButtonClick(
        callType: JobTrainingModel.FullTraineeTaskListTaskInfo,
        traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        this.traineeFormsPopoverMenuFactory.openPopover(traineeFormRecordInfo).subscribe((action: string) => {
            switch (action) {
                case 'onFormPhaseChanged':
                    // No additional action needs to be taken now.
                    this.loadingService.dismissLoading();
                    break;
                case 'onFormDeleted':
                    /**
                     * Calling [_reloadTaskSummaries] to handle removing the form the GUI, and regenerate
                     * necessary summary info.
                     */
                    const loadInBackground = false;
                    this._reloadTaskSummaries(callType, loadInBackground);
                    break;
            }
        });
    }

    public setFilteredCallLog() {
        const filterRecordsByDate = true; // Let call log records be filtered by date as well.
        this.traineeFormsService.filterTaskList(this.callLog, filterRecordsByDate)
            .subscribe((result) => {
                // Bind our filtered dataset & clear the loading state.
                this.filteredCallLogCategories = result;
                this.traineeFormsService.isSearching = false;

                // We may have presented loading, depending on whether we are currently hiding completed items.
                // If so, dismiss loading.
                if (this.traineeFormsService.hideCompletedItems) {
                    this.loadingService.dismissLoading();
                }
            });
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/

    private _openFormDetailView(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        this.traineeFormsService.openInlineFormMode(traineeFormRecordInfo.RecordID);
    }

    /**
     * [_onCallLogFormSaved] runs as a form is saved from the form-detail view or something similar.
     * @param traineeFormRecordInfo
     */
    private _onCallLogFormSaved(savedTraineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        /**
         * Calling [_reloadTaskSummaries] to keep the tasks summary updated
         * as the form is added/saved. This shouldn't mess up the formDetailView.
         * 
         * The user may notice the form moving in the sort order, but I can live with that.
         */
        this.callLog.Categories.forEach(loopedCategory => {
            loopedCategory.Tasks.forEach(loopedTask => {
                if (savedTraineeFormRecordInfo.TaskID === loopedTask.TaskID) {
                    const loadInBackground = true;
                    this._reloadTaskSummaries(loopedTask, loadInBackground);
                }
            });
        });
    }

    private _getTraineeCallLog() {
        this.loadingService.presentLoading('Loading call log...');
        // TODO - Find a better way to get this task list ID.
        const taskListID = this.jobTrainingService.selectedProgram.CallLogTaskListID;
        this.jobTrainingService.getTraineeTaskList(this.traineeFormsService.traineeUserInfo.ProgramID, this.traineeFormsService.traineeUserInfo.UserID, taskListID).subscribe(
            (callLog: JobTrainingModel.FullTraineeTaskListInfo) => {
                this.callLog = callLog;
                this._formatCallLogGUIData();

                // Reset filtered data now that it's changed.
                this.setFilteredCallLog();

                this.loadingService.dismissLoading();

                this.initialized = true;
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            });
    }

    /**
     * Marks the given callType as Expanded and collapses the rest.
     */
    private _evalSingleExpandedCallType(callType: JobTrainingModel.FullTraineeTaskListTaskInfo): void {
        // Grab parent category to avoid unnecessary loop.
        let parentCategory = this.callLog.Categories.find(category => category.Tasks.filter(task => task.TaskID == callType.TaskID).length);
        
        // Iterate tasks, expanding the relevant one and collapsing the rest.
        parentCategory.Tasks.forEach(loopedTask => {
            if (loopedTask.TaskID == callType.TaskID) {
                loopedTask.GUIData.Expanded = true;
            } else {
                loopedTask.GUIData.Expanded = false;
            }
        });

        // Reset filtered data now that it's changed.
        this.setFilteredCallLog();
    }

    private _expandCallType(callType: JobTrainingModel.FullTraineeTaskListTaskInfo): void {
        // There may be a bit of model lag when expanding if we are hiding completed items.
        // Let the user know we're doin' stuff.
        if (this.traineeFormsService.hideCompletedItems) {
            const duration = null;
            this.loadingService.presentLoading('Working...', duration, () => this._evalSingleExpandedCallType(callType));
        } else {
            this._evalSingleExpandedCallType(callType);
        }
    }

    private _collapseCallType(callType: JobTrainingModel.FullTraineeTaskListTaskInfo): void {
        callType.GUIData.Expanded = false;
    }


    private _formatCallLogGUIData() {
        this.callLog.Categories.forEach(loopedCategory => {
            loopedCategory.Tasks.forEach(loopedTask => {
                loopedTask.GUIData = new JobTrainingModel.TaskListTaskGUIData();
            });
        });
    }

    /**
     * [_reloadTaskSummaries] is called after forms are added/deleted/updated.
     * Updates summary info, AND populates and/or removes and/or sorts form records as needed.
     */
    private _reloadTaskSummaries(callType: JobTrainingModel.FullTraineeTaskListTaskInfo, loadInBackground: boolean) {
        if (!loadInBackground) {
            this.loadingService.presentLoading('Recalculating summaries...');
        }
        this.jobTrainingService.getTraineeTaskList(this.traineeFormsService.traineeUserInfo.ProgramID, this.traineeFormsService.traineeUserInfo.UserID, callType.TaskListID).subscribe(
            (updatedCallLog: JobTrainingModel.FullTraineeTaskListInfo) => {

                // Nested foreach loop on the returned [updatedTaskList.Categories] & [category.Tasks] arrays.
                updatedCallLog.Categories.forEach(updatedCategory => {
                    updatedCategory.Tasks.forEach(updatedTask => {
                        // Update the given [callType] data returned from the service/API call.
                        if (callType.TaskID === updatedTask.TaskID) {
                            callType.Summary = updatedTask.Summary;
                            callType.TraineeFormRecords = updatedTask.TraineeFormRecords;
                            callType.HasTraineeFormRecords = updatedTask.HasTraineeFormRecords;
                        }
                    });
                });
                if (!loadInBackground) {
                    this.loadingService.dismissLoading();
                }

                // Reset filtered data now that it's changed.
                this.setFilteredCallLog();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                if (!loadInBackground) {
                    this.loadingService.dismissLoading();
                }
            }
        );
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        this._getTraineeCallLog();
    }

    ngOnDestroy() {
        // prevent memory leak when component destroyed.
        this._formSavedSubscription.unsubscribe();
    }

}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../shared/Toast.Service';
import { AddFormDialogFactory, AddFormDialogInputInfo } from './AddFormDialog/add-form-dialog';
import * as JobTrainingModel from '../../Providers/Model';
import * as JT_FormsModel from '../../Providers/Forms.Model';
import { JobTrainingProvider } from '../../Providers/Service';
import { TraineeFormsService } from './trainee-forms.service';
import { TraineePhaseFormsTableComponent } from './Components/trainee-phase-forms-table';
import { isNullOrUndefined } from 'is-what';
import { PDFExportService } from '../../Utilities/pdf-export.service';
import { TraineeCallLogTableComponent } from './Components/trainee-call-log-table';
import { TraineeTaskListTableComponent } from './Components/trainee-task-list-table';

// define component
@Component({
    selector: 'jobtraining-trainee-forms-component',
    templateUrl: 'trainee-forms.component.html',
    styleUrls: ['../../page.scss', 'trainee-forms.scss']
})

/** This component is for the detail view after clicking a form.
 *    It will display any users assigned to the selected form.
 */
export class TraineeFormsComponent implements OnInit {


    // define service provider and route provider when component is constructed
    constructor(
        private addFormDialogFactory: AddFormDialogFactory,
        private route: ActivatedRoute,
        private pdfExportService: PDFExportService,
        public jobTrainingService: JobTrainingProvider,
        public alertController: AlertController,
        // NavController allows for the [navigateBack] method which plays the native back animation
        public navController: NavController,
        public loadingService: IonicLoadingService,
        public toastService: ToastService,
        public traineeFormsService: TraineeFormsService) {
    }

    /*******************************************
     * CHILD COMPONENTS
     *******************************************/
    @ViewChild('phaseFormsTable')
    private phaseFormsTable: TraineePhaseFormsTableComponent;

    @ViewChild('callLogTable')
    private callLogTable: TraineeCallLogTableComponent;

    @ViewChild('taskListTable')
    private taskListTable: TraineeTaskListTableComponent;

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    public initialized = false;

    public formFilterMode: string;

    public canAddForms: boolean;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _programID: number;
    private _traineeUserID: number;

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    /** 
     * Opens the new form dialog.
     * If new [TraineeFormRecord] is started, we route to it immediately
     */
    public async openAddFormDialog() {
        // There will be no [preselectedFormID] or [preselectedTaskID] when calling the general [openAddFormDialog] case.
        const dialogInput: AddFormDialogInputInfo = {
            preselectedFormID: null,
            preselectedTaskID: null
        };
        await this.addFormDialogFactory.openAddFormDialog(dialogInput).then((result: any) => {
            /** Check for a truthy [result] in case the dialog was unexpectedly closed,
             *    and [result.confirmed] to ensure the user confirmed the addition
             */
            if (result.data && result.data.confirmed) {
                this.phaseFormsTable.onFormAddedFromDialog(result.data.traineeFormRecordInfo);
            }
        });
    }

    /** The change event for the phase dropdown of the trainee */
    public onUpdateTraineePhase(event: Event) {
        this.loadingService.presentLoading('Updating phase...');

        this.jobTrainingService.UpdateTraineePhase(this.traineeFormsService.traineeUserInfo).subscribe(
            (result: any) => {
                this.loadingService.dismissLoading();

                this.toastService.presentToast('Phase Updated');

                // Auto expand the newly selected [phase].
                //this._autoExpandCurrentPhase();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            });
    }

    public onFormFilterModeButtonClick(newFormFilterMode: string) {
        if (this.formFilterMode !== newFormFilterMode) {
            //Clear the search box input. This is so previous filters aren't immediately applied to the new mode.
            this.traineeFormsService.clearSearchBoxInput();

            // Set the new mode.
            this.formFilterMode = newFormFilterMode;

            this._goToNewFilterRoute(newFormFilterMode);
        }
    }

    public getBackHRef(): string {
        return this._getBackHRef();
    }

    public exportFormsToPDF(): void {
        this.loadingService.presentLoading('Exporting forms...');
        // Fetch forms first
        this.jobTrainingService
            .getTraineeFormsForExport(this._programID, this._traineeUserID)
            .subscribe(
                (forms: JT_FormsModel.FullFormInfo[]) => {
                    // Then task list
                    this.jobTrainingService
                        .getTraineeTaskList(this._programID, this._traineeUserID, this.jobTrainingService.selectedProgram.PerformanceTaskListID)
                        .subscribe(
                            (taskList: JobTrainingModel.FullTraineeTaskListInfo) => {
                                // Send everything for export
                                this.pdfExportService.exportFormsToPDF(forms, taskList);
                                this.loadingService.dismissLoading();
                            },
                            error => {
                                console.log('trainingPrograms-error: ', error);
                                this.loadingService.dismissLoading();
                            }
                        );
                },
                error => {
                    console.log('trainingPrograms-error: ', error);
                    this.loadingService.dismissLoading();
                }
            );
    }

    /**
     * Handles "Hide Completed" toggle switch change
     */
    public onHideCompletedItemsToggleSwitchChange(): void {
        // The potential for many in-memory model changes can leave
        // the page a bit stuck for a moment. Let the user know we are doing stuff.
        const duration = null;
        this.loadingService.presentLoading('Working...', duration, () => this._setFilteredChildViews());
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/
    /**
     * Detects child view attachment and calls their respective filter methods
     * if necessary.
     */
    private _setFilteredChildViews(): void {
        // Child views are only defined on [this] when we
        // have the corresponding child view loaded on the page.
        if (this.phaseFormsTable) {
            this.phaseFormsTable.setFilteredPhasesAndForms();
        }
        if (this.callLogTable) {
            this.callLogTable.setFilteredCallLog();
        }
        if (this.taskListTable) {
            this.taskListTable.setFilteredTaskList();
        }

        // The "setFiltered" methods above have their own loading dismissals for hiding items.
        // Putting one here to ensure we get wrapped up in any case.
        this.loadingService.dismissLoading();
    }

    /**
     * Gather the trainee's program, phases, etc
     * Dismissed loading, does not present loading
     */
    private _getTraineeUser() {
        this.jobTrainingService.getTraineeUser(this._programID, this._traineeUserID).subscribe(
            (traineeUserInfo: JobTrainingModel.TraineeUserInfo) => {
                this.traineeFormsService.traineeUserInfo = traineeUserInfo;
                this.initialized = true;
                this.loadingService.dismissLoading();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /*******************************************
    * PUBLIC & PRIVATE METHODS (ROUTING)
    *******************************************/
    private _goToNewFilterRoute(newFormFilterMode: string): void {
        this.navController.navigateRoot(
            'jobtraining' +
            '/programdetail/' + this._programID +
            '/traineeforms/' + this._traineeUserID +
            '/filter/' + newFormFilterMode);
    }

    private _getBackHRef(): string {
        let backHref: string;
        if (this.traineeFormsService.hasFormOpenInInlineMode) {
            backHref =
                '/jobtraining' +
                '/programdetail/' + this._programID +
                '/traineeforms/' + this._traineeUserID +
                '/filter/' + this.formFilterMode;
        }
        else {
            if (this.jobTrainingService.selectedProgram.IsTraineeUser) {
                // Trainee level users won't be able to see/use the 'programdetail' view.
                backHref = '/jobtraining';
            } else {
                backHref = '/jobtraining/programdetail/' + this._programID + '/trainees';
            }
        }
        return backHref;
    }

    /**
     * [_parseFormFilterModeFromRoute]
     * ----
     * Sets [formFilterMode] from route params.
     * Expected values are: 'dailyforms', 'allforms', 'calllog', or 'tasklist'.
     */
    private _parseFormFilterModeFromRoute(): void {        
        this.formFilterMode = this.route.snapshot.paramMap.get('formfiltermode');
        if (isNullOrUndefined(this.formFilterMode)) {
            this.formFilterMode = 'dailyforms';
        }
    }

    /*******************************************
     * SELF INIT
     *******************************************/
    ngOnInit() {
        this._parseFormFilterModeFromRoute();
        this.init();
    }

    init() {
        //Clear any previously selected trainee user.
        this.traineeFormsService.traineeUserInfo = null;

        // Loading will dismiss in [_getTrainee]
        this.loadingService.presentLoading('Loading forms...');
        // grab the ids from the URL string
        this._programID = +this.route.snapshot.paramMap.get('programid');
        this._traineeUserID = +this.route.snapshot.paramMap.get('traineeid');

        /**
         * Calling [closeInlineFormMode] is really just to clean up any forms that were previously opened, like
         * if the user just closed it via the back button or w/e.
         */
        if(this.traineeFormsService.hasFormOpenInInlineMode) {
            this.traineeFormsService.closeInlineFormMode();
        }

        if (!this._checkForRefresh()) {
            // retrieve the selected trainee's program data from the service provider.
            this._getTraineeUser();
        } else {
            this._onRefresh_getServerInfo();
        }
    }

    private _onRefresh_getServerInfo(): void {
        this.jobTrainingService.getServerInfo().subscribe(
            (serverInfo: any) => {
                this._onRefresh_getProgram();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    private _onRefresh_getProgram(): void {
        this.jobTrainingService.getProgram(this._programID).subscribe(
            (fullProgramInfo: any) => {
                this._getTraineeUser();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_checkForRefresh] - Check paramMap and/or cached data for signs of a full page refresh.
     */
    private _checkForRefresh(): boolean {
        return !this.jobTrainingService.serverInfo || !this.jobTrainingService.selectedProgram;
    }
}

import { Component, OnInit } from '@angular/core';
import * as JobTrainingModel from '../../Providers/Model';
import { JobTrainingProvider } from '../../Providers/Service';
import { FullFormInfo } from '../../Providers/Forms.Model';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { TraineeFormsService } from '../TraineeForms/trainee-forms.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'jobtraining-programadmin-todo',
    templateUrl: 'program-admin-to-do.component.html',
    styleUrls: [
        '../../page.scss',
        '../ProgramDetails/program-detail.scss'
    ]
})

export class ProgramAdminToDoComponent implements OnInit {
    constructor(
        public traineeFormsService: TraineeFormsService,
        private jobTrainingService: JobTrainingProvider,
        private loadingService: IonicLoadingService
    ) { 
        /**
          * Listen for [formSaved$] Observable events so that we know when to regenerate summaries.
          * Parent/child/sibling communication workflow taken from this link:
          * https://angular.io/guide/component-interaction
          */
        this._formSavedSubscription = traineeFormsService.formSaved$.subscribe(
            savedTraineeFormRecordInfo => {
                this._getTraineeFormsForAdminToDo();
            }
        );
    }

    /*******************************************
     * PUBLIC MEMBERS
     *******************************************/
    // Whether this component has init'd
    public initialized: boolean;

    // Datasource for the "todo" table
    public forms: FullFormInfo[];

    // Helper object for rendering a form row as "selected"
    // This is mainly for the HTML.
    public selectedForm: FullFormInfo;

    /*******************************************
     * PRIVATE MEMBERS
     *******************************************/
    // Stores our subscription to the [formSaved$] 
    // Observable on TraineeFormsService
    private _formSavedSubscription: Subscription;

    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    // Handles form row click
    public onFormRowClick(form): void {
        this.loadingService.presentLoading('Loading form...');
        
        // Fetch the relevant TraineeUserInfo.
        this.jobTrainingService.getTraineeUser(this.jobTrainingService.selectedProgram.ProgramID, form.TraineeFormRecordInfo.UserID).subscribe(
            (traineeUserInfo: JobTrainingModel.TraineeUserInfo) => {
                // Waiting 'til now to set this so that the row doesn't IMMEDIATELY appear selected.
                // and potentially make the workflow look thrown off for a moment.
                this.selectedForm = form;

                // Set [traineeUserInfo] on the service and open the form up.
                this.traineeFormsService.traineeUserInfo = traineeUserInfo;

                // Sending a callback for the service to call when we close the form.
                this.traineeFormsService.openInlineFormMode(form.TraineeFormRecordInfo.RecordID, () => { this._clearSelectedForm(); });
                this.loadingService.dismissLoading();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/
    // Gather relevant trainee forms, set datasource, and mark init'd
    private _getTraineeFormsForAdminToDo(): void {
        this.loadingService.presentLoading('Loading forms...');
        this.jobTrainingService.getTraineeFormsForAdminToDo(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
            (forms: FullFormInfo[]) => {
                this.forms = forms;
                this.initialized = true;
                this.loadingService.dismissLoading();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    // Reset the [selectedForm] object
    private _clearSelectedForm(): void {
        this.selectedForm = null;
    }

    // Initialize by gathering trainee forms for this view.
    private _init(): void {
        this._getTraineeFormsForAdminToDo();
    }

    /*******************************************
     * SELF INIT
     *******************************************/
    ngOnInit() {
        this._init();
    }

    // Tears down our subscription to the Observable
    // on TraineeFormsService
    ngOnDestroy() {
        this._formSavedSubscription.unsubscribe();
    }
}

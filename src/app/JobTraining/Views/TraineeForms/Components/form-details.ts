import { Component, OnInit, ViewChild } from '@angular/core';
import { JobTrainingProvider } from '../../../Providers/Service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_FormsModel from '../../../Providers/Forms.Model';
import { isNullOrUndefined, isUndefined } from 'is-what';
import { TraineeFormsService } from '../trainee-forms.service';

import { PDFExportService } from '../../../Utilities/pdf-export.service';
import { FormDisplayComponent } from 'src/app/JobTraining/Components/FormDisplay/form-display.component';

/*************************************** INTERNAL CLASS DEFINITIONS ***********************************/
// define component
@Component({
    selector: 'form-details-component',
    templateUrl: 'form-details.html',
    styleUrls: [
        '../../../page.scss',
        '../trainee-forms.scss',
        './form-details.scss'
    ]
})

/** This component is for the detail view after clicking a form.
 *    It will display any users assigned to the selected form.
 */
export class FormDetailsComponent implements OnInit {

    @ViewChild(FormDisplayComponent) formDisplayComponent: FormDisplayComponent;

    //[recordid] is set on init as the route params are parsed.
    recordid: number;

    selectedForm: JT_FormsModel.FullFormInfo;

    initialized: boolean;

    // define service provider and route provider when component is constructed
    constructor(
        private route: ActivatedRoute,
        public jobTrainingService: JobTrainingProvider,
        // NavController allows for the [navigateBack] method which plays the native back animation
        public navController: NavController,
        public loadingService: IonicLoadingService,
        public toastService: ToastService,
        public traineeFormsService: TraineeFormsService,
        private pdfExportService: PDFExportService
    ) { }

    /*************************************** AUTO ***********************************/

    ngOnInit() {
        /**
         * [ngOnInit] is called each time the user opens a form, even if the new
         * route/url is just another form.
         * This is mainly working because we're using an angular <router-outlet>
         * to host this component, instead of ionics <ion-router-outlet>.
         */
        this._init();
    }

    /*************************************** INIT ***********************************/

    private _init() {
        /**
         * Confirm the form details view is even supposed to be opened right now.
         * It might be the case that the user refreshed the page with a form opened.
         * In that case, we close this form out; see else case below.
         */
        if (this.traineeFormsService.hasFormOpenInInlineMode) {
            this.initialized = false;
            this.selectedForm = null;
            // Loading will dismiss in [getTraineeForm]
            this.loadingService.presentLoading('Loading form details...');

            //Using + before the param get will cast it to an int/number.
            const programID = +this.route.snapshot.paramMap.get('programid');
            const traineeID = +this.route.snapshot.paramMap.get('traineeid');

            /**
             * Re-cache the [recordid] from the URL for use in other data gather methods
             * and sibling components. This variable is also set in [traineeFormsService], but
             * we reset the data here, in FormDetails because this view might get refreshed as
             * the user navigates w/ the back/forward buttons. Those navigation events will
             * update the URL, and we'll act on the URL changing here.
             */
            this.recordid = +this.route.snapshot.paramMap.get('recordid');

            if (this.traineeFormsService.traineeUserInfo) {
                // Move on
                this._getTraineeForm();
            } else {
                this.jobTrainingService.getTraineeUser(programID, traineeID).subscribe(
                    (traineeUserInfo: JobTrainingModel.TraineeUserInfo) => {
                        // Move on
                        this._getTraineeForm();
                    },
                    (error) => {
                        console.log('trainingPrograms-error: ', error);
                        this.loadingService.dismissLoading();
                    }
                );
            }
        }
        else {
            /**
             * Clear the 'formdetails' stuff from the URL, if any. 
             * With more time & effort we might be able to let the user keep the form
             * open after a page refresh.
             */
            this.traineeFormsService.closeInlineFormMode();
        }
    }

    /** Initialize data for this page, set [initialized] to true when complete */
    /** Gather full info about this trainee's form */
    private _getTraineeForm() {
        // grab the id from the URL string
        this.jobTrainingService.getTraineeForm(this.recordid).subscribe(
            (form: any) => {
                // cache the selected form
                this.selectedForm = form;

                /**
                 * Re-cache info from the newly loaded [TraineeFormRecordInfo] for use in parent 
                 * and sibling components.
                 */
                this.traineeFormsService.setSelectedRecordIDs(this.selectedForm.TraineeFormRecordInfo);

                // Move on, ensure we have serverinfo
                if (isNullOrUndefined(this.jobTrainingService.serverInfo)) {
                    this.jobTrainingService.getServerInfo().subscribe(
                        () => {
                            // render the html now that the data is ready
                            this.initialized = true;
                            this.loadingService.dismissLoading();
                        },
                        (error) => {
                            console.log('trainingPrograms-error: ', error);
                            this.loadingService.dismissLoading();
                        }
                    );
                } else {
                    // render the html now that the data is ready
                    this.initialized = true;
                    this.loadingService.dismissLoading();
                }
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /*************************************** SAVE ***********************************/
    /**
     * [hasUnsavedChanges] is designed to help prevent the user from leaving unsaved changes.
     * It's called by an angular route-guard as the user tries to navigate away.
     */
    public hasUnsavedChanges() {
        let hasChanges = false;
        if (!isNullOrUndefined(this.selectedForm)) {
            const modifiedEntries = this.formDisplayComponent.gatherAllModifiedEntries();

            hasChanges = (modifiedEntries.length > 0)
        }
        return hasChanges;
    }

    /** Click event for the save button */
    public onSaveFormClick() {
        this.loadingService.presentLoading('Saving...');
        // Build the payload object
        const traineeFormUpdatePayload = {
            traineeFormRecordID: this.recordid,
            // Be sure to update the date
            formDate: this.selectedForm.TraineeFormRecordInfo.Date,
            // Only attempt to store entries that were modified
            entryInfo: this.formDisplayComponent.gatherAllModifiedEntries()
        } as JT_FormsModel.TraineeFormUpdatePayload;

        this.jobTrainingService.saveTraineeForm(traineeFormUpdatePayload).subscribe(
            (traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) => {
                /**
                 * Trigger [traineeFormsService.formSaved] to let any listening components/views know that this
                 * form was saved.
                 */
                this.traineeFormsService.formSaved(traineeFormRecordInfo)

                this.toastService.presentToast('Save Successful');
                this.loadingService.dismissLoading();

                // Reset entries' [Modified] flags now that data has been saved.
                this.formDisplayComponent.resetAllModifiedEntryFlags();

                /**
                 * Now that form data has changed, Call [_resummarizeProgramUser] in the background to
                 * recalculate summary data for the user.
                 */
                this._resummarizeProgramUser();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_resummarizeProgramUser]
     * Called as forms are saved to recalculate summary info in the background.
     */
    private _resummarizeProgramUser() {
        const programID = this.traineeFormsService.traineeUserInfo.ProgramID;
        const traineeUserID = this.traineeFormsService.traineeUserInfo.UserID;
        this.jobTrainingService.resummarizeTrainee(programID, traineeUserID).subscribe(
            (summaryInfo: JobTrainingModel.TraineeGeneralSummaryInfo) => {
                //Update stored summary info on shared location so it can be updated in the needed tools.
                this.traineeFormsService.traineeUserInfo.Summary = summaryInfo;
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
            }
        );

    }

    public onCloseFormClick() {
        /**
         * TODO - Check for pending/unsaved changes and let the user choose to save/abandon those.
         */
        this.traineeFormsService.closeInlineFormMode();
    }

    /***************************** PDF **************************************/
    public exportFormToPDF(): void {
        this.pdfExportService.exportFormsToPDF([this.selectedForm]);
    }
}

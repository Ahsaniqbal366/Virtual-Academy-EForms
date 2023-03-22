import { Component, OnInit } from '@angular/core';
import { JobTrainingProvider } from '../../../Providers/Service';
import { AlertController, NavController } from '@ionic/angular';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';

// define component
@Component({
    selector: 'jobtraining-programforms',
    templateUrl: 'program-forms.component.html',
    styleUrls: [
        '../../../page.scss',
        '../program-detail.scss'
    ]
})

export class ProgramFormsComponent implements OnInit {
    constructor(
        public jobTrainingService: JobTrainingProvider,
        public alertController: AlertController,
        public navController: NavController,
        public loadingService: IonicLoadingService,
        public toastService: ToastService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    public initialized = false;

    public allForms: JobTrainingModel.BasicFormInfo[];

    // Used to show any relevant warning messages in the GUI. Like "No data", "Invalid data", etc.
    public warnings: JobTrainingModel.WarningMessage[];

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/


    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    public onFormRowClick(event: Event, form: JobTrainingModel.BasicFormInfo) {
        // grab the full classname list of the target element
        const targetElementClassName = (event.target as Element).className;

        /**
         * if the classname "block-parent-event" does not exist, go ahead and proceed
         * with the parent row's event.
         */
        if (targetElementClassName.indexOf('block-parent-event') === -1) {
            this.navController.navigateRoot(
                'jobtraining' +
                '/programdetail/' + this.jobTrainingService.selectedProgram.ProgramID +
                '/forms/' + form.FormID);
        }
    }

    /**
     * [onFormReorder] handles the end event of a ionic reorder drag n drop.
     * Resets the sort order for all items in [this.allForms] array.
     */
    public onFormReorder(ev: any) {
        this.allForms = ev.detail.complete(this.allForms);
        this._updateFormSortOrderUsingIndex();
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/

    private _updateFormSortOrderUsingIndex() {
        this.allForms.forEach((loopedForm, formIndex) => {
            loopedForm.SortOrder = (formIndex + 1); // + 1 for a 1-based user-friendly sort order value.            
        });
        // Call API method to update all sort orders.
        this.jobTrainingService.updateFormSorting(this.allForms).subscribe(
            (forms: JobTrainingModel.BasicFormInfo[]) => {
                this.allForms = forms;
                this.initialized = true;
                this.loadingService.dismissLoading();

                this.toastService.presentToast('Forms updated');
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /** 
     * [_getAvailableFormsForProgram]
     * Potentially called from init, gathers available forms to be used in this dialog.
     */
    private _getAvailableFormsForProgram() {
        // Loading will dismiss after needed data is gathered
        this.loadingService.presentLoading('Loading forms...');
        this.jobTrainingService.getAvailableFormsForProgram(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
            (forms: JobTrainingModel.BasicFormInfo[]) => {
                this.allForms = forms;
                
                this._setWarningMessages();

                this.initialized = true;
                this.loadingService.dismissLoading();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    private _setWarningMessages() {
        this.warnings = [];
        // Case 1: Check if there are any forms at all.
        const hasForms = ((this.allForms.length > 0));
        if (!hasForms) {
            this.warnings.push(new JobTrainingModel.WarningMessage('No forms to have been added yet.', 'white'));
        }

        // Case 2: Check if there are any ACTIVE forms.
        if (hasForms) {            
            let hasActiveForms = false;
            this.allForms.forEach(loopedForm => {
                if(!loopedForm.IsDeleted){
                    // There's at least one active form.
                    hasActiveForms = true;
                }
            });
            if(!hasActiveForms) {
                this.warnings.push(new JobTrainingModel.WarningMessage('There are no active forms.', 'bootstrap-bg-warning'));
            }
        }
    }

    /*******************************************
     * SELF INIT
     *******************************************/
    ngOnInit() {
        this.init();
    }

    init() {
        this._getAvailableFormsForProgram();
    }
}

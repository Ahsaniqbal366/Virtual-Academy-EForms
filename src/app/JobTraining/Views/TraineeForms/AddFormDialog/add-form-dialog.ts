import { Component, OnInit, Input, Injectable } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { JobTrainingProvider } from '../../../Providers/Service';
import { isNullOrUndefined } from 'is-what';
import { TraineeFormsService } from '../trainee-forms.service';


// define component
@Component({
  selector: 'add-form-dialog',
  templateUrl: 'add-form-dialog.html',
  styleUrls: ['../../../page.scss']
})

export class AddFormDialogPage implements OnInit {
  // Cache the trainees not in the selectedProgram
  availableForms: JobTrainingModel.BasicFormInfo[];
  traineeFormRecordToStart: JobTrainingModel.TraineeFormRecordInfo;
  selectedFormID: number;
  selectedDate: string;
  selectedTraineePhaseID: number;

  // Data passed in
  @Input() Data: any;

  // define service provider and route provider when component is constructed
  constructor(
    public modalController: ModalController,
    public route: ActivatedRoute,
    public loadingService: IonicLoadingService,    
    public alertController: AlertController,
    public jobTrainingService: JobTrainingProvider,
    private traineeFormsService: TraineeFormsService) {
  }

  ngOnInit() {
    // retrieve the selected form from the service provider
    if(this.Data.hasPreselectedForm){
      this._getProgramFormByID(this.Data.preselectedFormID);
    }
    else {
      this._getAvailableFormsForProgram();  
    }    
    this.selectedDate = new Date().toDateString();
    /** Start with the trainee's current phase as the default */
    this.selectedTraineePhaseID = this.traineeFormsService.traineeUserInfo.PhaseID;
  }

  /** ASYNC: CLose this modal, return [selectedForm] and [confirmed], a
   *  flag to indicate that the user confirmed the addition
   */
  async dismiss(traineeFormRecordInfo, confirmed) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this.modalController.dismiss({
      dismissed: true,
      traineeFormRecordInfo,
      confirmed
    });
  }

  /** 
   * [_getAvailableFormsForProgram]
   * Potentially called from init, gathers available forms to be used in this dialog.
   */
  private _getAvailableFormsForProgram() {
    this.loadingService.presentLoading('Loading available forms...');
    this.jobTrainingService.getAvailableFormsForProgram(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
      (forms: JobTrainingModel.BasicFormInfo[]) => {      
        this.availableForms = [];
        // Loop the returned [forms] array. Exclude any forms that cannot be added manually.
        forms.forEach(loopedForm => {
          if(loopedForm.CanBeAddedManually){            
            this.availableForms.push(loopedForm);
          }
        });

        // An initial form hasn't been selected yet, do that now for the first available form.
        if(this.availableForms.length > 0){
          this.selectedFormID = this.availableForms[0].FormID;
        }

        this.loadingService.dismissLoading();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  /** 
   * [_getProgramFormByID]
   * Potentially called from init, gathers available forms to be used in this dialog.
   */
  private _getProgramFormByID(formID: number) {
    this.loadingService.presentLoading('Loading available forms...');
    this.jobTrainingService._getProgramFormByID(this.jobTrainingService.selectedProgram.ProgramID, formID).subscribe(
      (form: JobTrainingModel.BasicFormInfo) => {        
        // Add this form as the only option in the [availableForms] array.
        this.availableForms = [];
        this.availableForms.push(form);
        // Preselect this form.
        this.selectedFormID = formID;

        this.loadingService.dismissLoading();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  /** The click event for the add button, runs the selected form and date to the API */
  onConfirmAddition() {
    let hasError = false;
    let errorMessage = '';

    if (isNullOrUndefined(this.selectedTraineePhaseID) || this.selectedTraineePhaseID === 0) {
      hasError = true;
      errorMessage = 'A phase must be selected to continue.';
    }
    else if (isNullOrUndefined(this.selectedFormID) || this.selectedFormID === 0) {
      hasError = true;
      errorMessage = 'A form must be selected to continue.';
    }

    // Ensure a phase is still selected, if not, alert the user
    if (!hasError) {
      this.loadingService.presentLoading('Adding form...');


      const selectedForm = this.availableForms.find(loopedForm =>
        loopedForm.FormID.toString() === this.selectedFormID.toString()
      );      

      this.traineeFormRecordToStart = {
        RecordID: null,
        UserID: this.traineeFormsService.traineeUserInfo.UserID,
        ShiftID: this.traineeFormsService.traineeUserInfo.ShiftID,
        PhaseID: this.selectedTraineePhaseID,
        FormID: this.selectedFormID,
        /**
         * [TaskID] may be null when the user is adding a misc. form manually.
         * The TaskID is set when the forms are added through TaskList features.
         */
        TaskID: this.Data.preselectedTaskID,
        Date: new Date(this.selectedDate),
        IsArchived: false,
        ArchivedOnDate: null,
        BasicFormInfo: {
          Name: selectedForm.Name,
          Collapsible: selectedForm.Collapsible,
          CollapseBy: selectedForm.CollapseBy
        } as JobTrainingModel.BasicFormInfo
      } as JobTrainingModel.TraineeFormRecordInfo;

      this.jobTrainingService.startTraineeFormRecord(this.traineeFormRecordToStart).subscribe(
        (outputTraineeFormRecord: JobTrainingModel.TraineeFormRecordInfo) => {
          this.loadingService.dismissLoading();
          // Show that the user confirmed the addition that triggered this dismiss.
          const confirmed = true;
          this.dismiss(outputTraineeFormRecord, confirmed);
        },
        (error) => {
          console.log('trainingPrograms-error: ', error);
          this.loadingService.dismissLoading();
        }
      );
    } else {
      // No PhaseID selected
      this.alertController.create({
        message: errorMessage,
        buttons: [
          {
            text: 'OK',
            role: 'ok'
          }
        ]
      }).then(alertElement => {

        alertElement.present();
      });
    }
  }
}

export class AddFormDialogInputInfo{
  public preselectedFormID: number;
  public preselectedTaskID: number;
}

@Injectable()
export class AddFormDialogFactory {
  constructor(
    public modalController: ModalController) {
  }

  /**
  * PUBLIC METHODS
  */
  public async openAddFormDialog(dialogInput: AddFormDialogInputInfo): Promise<object> {
    const modalData = {
      hasPreselectedForm: !isNullOrUndefined(dialogInput.preselectedFormID),
      preselectedFormID: dialogInput.preselectedFormID,
      preselectedTaskID: dialogInput.preselectedTaskID
    };

    const modal = await this.modalController.create({
      component: AddFormDialogPage,
      componentProps: {
        Data: modalData
      }
    });

    await modal.present();

    return modal.onDidDismiss();

  }
}
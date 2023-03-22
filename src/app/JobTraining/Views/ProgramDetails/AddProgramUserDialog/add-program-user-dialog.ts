import { Component, OnInit, Input, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { JobTrainingProvider } from '../../../Providers/Service';
import { isNullOrUndefined } from 'is-what';
// import { prepareEventListenerParameters } from '@angular/compiler/src/render3/view/template';

// define component
@Component({
  selector: 'jobtraining-add-user-dialog',
  templateUrl: 'add-program-user-dialog.html',
  styleUrls: ['../../../page.scss']
})

export class AddProgramUserDialog implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public alertController: AlertController,
    public loadingService: IonicLoadingService,
    public jobTrainingService: JobTrainingProvider) {
  }

  /*******************************************
   * PUBLIC VARIABLES
   *******************************************/

  // Data passed in
  @Input() dialogInput: AddProgramUserDialogInputInfo;

  public initialized: boolean;
  // [availableUsers] is a cache of the users not in the selectedProgram.
  public availableUsers: JobTrainingModel.BasicUserInfo[];
  public hasAvailableUsers: boolean;

  public selectedUserID: number;
  public selectedShiftID: number;
  public selectedRoleIDs: number[];

  /**
   * [isTraineeUser] flag drives a checkbox/toggle switch in the GUI. 
   * Might be forced to a TRUE value on init.
   */
  public isTraineeUser: boolean;

  /*******************************************
   * PRIVATE VARIABLES
   *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/

  /** 
   * ASYNC: CLose this modal, return [newUser] and [confirmed], a
   *  flag to show if the user confirmed the addition
   */
  public async dismiss(newUser, confirmed) {
    // using the injected ModalController this page can "dismiss" itself and optionally pass back data
    await this.modalCtrl.dismiss({
      dismissed: true,
      newUserInfo: newUser,
      confirmed
    });
  }



  /** Click event for the add button to take the selected user(s) and assign them to this program */
  onConfirmAddition() {

    let hasValidInput = true; // [hasValidInput] might get set during validation below.
    let errorMessage = '';

    if (isNullOrUndefined(this.selectedUserID) || this.selectedUserID.toString() === '0') {
      hasValidInput = false;
      errorMessage = 'A user must be selected to continue.';
    }
    // For trainee users, validate that a shift was selected.
    if (this.isTraineeUser && hasValidInput) {
      if (isNullOrUndefined(this.selectedShiftID) || this.selectedShiftID.toString() === '0') {
        hasValidInput = false;
        errorMessage = 'A shift must be selected to continue.';
      }
    }

    // For non-trainee users, validate that one or more roles were selected.
    if (!this.isTraineeUser && hasValidInput) {
      if (isNullOrUndefined(this.selectedRoleIDs) || this.selectedRoleIDs.length === 0) {
        hasValidInput = false;
        errorMessage = 'One or mroe roles must be selected to continue.';
      }
    }

    // Determine if a shift value has been selected, if one has not been selected, inform the user
    if (hasValidInput) {

      this.loadingService.presentLoading('Adding user...');

      if (this.isTraineeUser) {
        this._addTraineeUser();
      }
      else {
        this._addUser();
      }

    } else {

      // generate an alert to inform the user that
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

  /*******************************************
  * PRIVATE METHODS
  *******************************************/

  /** Runs on init, gets learners not in this program to be offered for assignment */
  private _getUsersNotInProgram() {
    this.loadingService.presentLoading('Loading available users...');
    const selectedProgramID = this.jobTrainingService.selectedProgram.ProgramID;
    this.jobTrainingService.getUsersNotInProgram(selectedProgramID)
      .subscribe(
        (users: JobTrainingModel.BasicUserInfo[]) => {
          this.availableUsers = users;
          this.hasAvailableUsers = (this.availableUsers.length > 0);
          this.initialized = true;
          this.loadingService.dismissLoading();
        },
        (error) => {
          console.log('trainingPrograms-error: ', error);
          this.loadingService.dismissLoading();
        }
      );
  }

  /**
   * [_addTraineeUser]
   * -----
   * Trainee users get special considerations when added to a program.
   * This method expects that all user input has been validated.
   */
  private _addTraineeUser() {
    // Create a [ProgramUserInfo] record for the selected trainee
    const traineeToAdd = {
      ProgramID: this.jobTrainingService.selectedProgram.ProgramID,
      UserID: this.selectedUserID,
      ShiftID: this.selectedShiftID,
    } as JobTrainingModel.TraineeUserInfo;

    // Call the API to insert new [TraineeUserInfo] for the selected trainee.
    this.jobTrainingService.assignTraineeToProgram(traineeToAdd).subscribe(
      (newUserInfo: JobTrainingModel.ProgramUserInfo) => {
        this.loadingService.dismissLoading();

        // dismiss the modal, no output data really needed, and a flag to show that this was confirmed.
        const confirmed = true;
        this.dismiss(newUserInfo, confirmed);
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  /**
   * [_addUser]
   * -----
   * This method expects that all user input has been validated.
   */
  private _addUser() {
    // Create a object instance for the selected user, roles, etc.
    const userToAdd = {
      ProgramID: this.jobTrainingService.selectedProgram.ProgramID,
      UserID: this.selectedUserID,
      RoleIDs: this.selectedRoleIDs
    } as JobTrainingModel.ProgramUserInfo;

    // Call the API to create the new program user & roles.
    this.jobTrainingService.addUserToProgram(userToAdd).subscribe(
      (newUserInfo: JobTrainingModel.ProgramUserInfo) => {
        this.loadingService.dismissLoading();

        // dismiss the modal, no output data really needed, and a flag to show that this was confirmed.
        const confirmed = true;
        this.dismiss(newUserInfo, confirmed);
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  /*******************************************
   * SELF INIT
   *******************************************/

  ngOnInit() {
    if(this.dialogInput.forceTraineeUser){
      this.isTraineeUser = true;
    }

    // retrieve the selected form from the service provider
    this._getUsersNotInProgram();
  }
}

export class AddProgramUserDialogInputInfo {
  public forceTraineeUser: boolean;
}

@Injectable()
export class AddProgramUserDialogFactory {
  constructor(
    public modalController: ModalController,
    public jobTrainingService: JobTrainingProvider) {
  }

  /**
  * PUBLIC METHODS
  */
  public async openAddUserDialog(dialogInput: AddProgramUserDialogInputInfo): Promise<object> {
    const modal = await this.modalController.create({
      component: AddProgramUserDialog,
      componentProps: {
        dialogInput: dialogInput
      }
    });

    await modal.present();

    return modal.onDidDismiss();

  }
}
import { Component, OnInit } from '@angular/core';
import { JobTrainingProvider } from '../../../Providers/Service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';

import { ProgramTraineePopoverMenuComponent } from './PopoverMenu/program-trainees.popover-menu.component';
import { isNullOrUndefined } from 'is-what';
import { AddProgramUserDialogFactory, AddProgramUserDialogInputInfo } from '../AddProgramUserDialog/add-program-user-dialog';

// define component
@Component({
  selector: 'jobtraining-programtrainees',
  templateUrl: 'program-trainees.component.html',
  styleUrls: [
    '../../../page.scss',
    '../program-detail.scss',
    'program-trainees.scss'
  ]
})

/**
 * [ProgramTraineesComponent]
 * This component is for the detail view after selecting a program.
 * It will display any trainees assigned to the selected program.
 */
export class ProgramTraineesComponent implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public jobTrainingService: JobTrainingProvider,
    public alertController: AlertController,
    // NavController allows for the [navigateBack] method which plays the native back animation
    public navController: NavController,
    public loadingService: IonicLoadingService,
    public toastService: ToastService,
    public popoverController: PopoverController,
    private addProgramUserDialogFactory: AddProgramUserDialogFactory
  ) { }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized = false;

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
   * PUBLIC METHODS
   *******************************************/

  /**
   * [onAddTraineeButtonClick]
   * Click event for add trainee button. Opens a dialog.
   */
  public async onAddTraineeButtonClick() {
    const dialogInput = new AddProgramUserDialogInputInfo();
        dialogInput.forceTraineeUser = true;
    await this.addProgramUserDialogFactory.openAddUserDialog(dialogInput).then((result: any) => {
      /** Check for a truthy [result] in case the dialog was unexpectedly closed,
       *  and [result.confirmed] to ensure the user confirmed the addition
       */
      if (result.data && result.data.confirmed) {              
        const traineeUserInfo = result.data.newUserInfo;
        this._getNewlyAddedTraineeUser(traineeUserInfo.UserID);
        this.toastService.presentToast(traineeUserInfo.DisplayName + ' added');
      }
    });
  }

  private _getNewlyAddedTraineeUser(traineeUserID: number) {
    this.loadingService.presentLoading('Loading trainee...');
    this.jobTrainingService.getTraineeUser(this.jobTrainingService.selectedProgram.ProgramID, traineeUserID).subscribe(
      (traineeUserInfo: JobTrainingModel.TraineeUserInfo) => {
        // ready the trainee data and attach the list to the selected shift's listing.
        // this object contains specific user data such as photo path, ID #, etc.          
        this.jobTrainingService.selectedProgram.ShiftInfo.forEach(shift => {
          if (shift.ShiftID.toString() === traineeUserInfo.ShiftID.toString()) {
            shift.Trainees.push(traineeUserInfo);
          }
        });
        this.loadingService.dismissLoading();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );

  }

  /** Check the clicked element of the parent row to determine if the click event of
   *  of the row should be neglected.
   */
  onRowClick(event: Event, trainee: JobTrainingModel.TraineeUserInfo) {

    // grab the full classname list of the target element
    const targetElementClassName = (event.target as Element).className;

    // if the classname "block-parent-event" does not exist, go ahead and proceed with the parent row's event
    if (targetElementClassName.indexOf('block-parent-event') === -1) {

      this._openTraineeForms(trainee.UserID);
    }
  }

  private _openTraineeForms(traineeUserID: number) {
    this.router.navigate(['../traineeforms/' + traineeUserID], { relativeTo: this.route });
  }

  /** The change event for the shift dropdown */
  onUpdateShift(oldShift: JobTrainingModel.JobTrainingShift, trainee: JobTrainingModel.TraineeUserInfo) {

    this.jobTrainingService.updateShift(trainee).subscribe(
      (result: any[]) => {

        // find the new shift that the trainee object will be placed into
        const newShift = this.jobTrainingService.selectedProgram.ShiftInfo.find(shift =>
          shift.ShiftID.toString() === trainee.ShiftID.toString()
        );
        // filter out the user trainee object from the prior shift
        oldShift.Trainees = oldShift.Trainees.filter(traineeToRemove =>
          traineeToRemove.UserID.toString() !== trainee.UserID.toString()
        );

        // push the new trainee to the new shift
        newShift.Trainees.push(trainee);

        // expand the newly selected shift, if it wasn't already.
        newShift.Expanded = true;

      }
    );
  }

  /** The click event for the delete officer button, triggers a confirmation alert */
  onRemoveTraineeClick(trainee: JobTrainingModel.TraineeUserInfo, shift: JobTrainingModel.JobTrainingShift) {
    this.alertController.create({
      header: 'Are you sure?',
      message: 'Do you really want to remove ' + trainee.DisplayName
        + ' from  ' + this.jobTrainingService.selectedProgram.Name + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.loadingService.presentLoading('Removing...');
            this.jobTrainingService.removeUserFromProgram(this.jobTrainingService.selectedProgram.ProgramID, trainee.UserID).subscribe(
              (result: any) => {
                shift.Trainees = shift.Trainees.filter(traineeToRemove => traineeToRemove.UserID !== trainee.UserID);
                this.loadingService.dismissLoading();
                this.toastService.presentToast(trainee.DisplayName + ' Removed');
              },
              (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
              });
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  /** Click event for the claim trainee button */
  onClaimTrainee(trainee: JobTrainingModel.TraineeUserInfo) {

    // if the trainee has been claimed by the current user, it is flagged for release
    // otherwise, claim the trainee for the user
    if (!trainee.IsClaimedByCurrentUser) {
      this._claimTrainee(trainee);
    } else {
      this._releaseTrainee(trainee);
    }


  }

  /** Click event for the expandable card */
  onShiftClick(shift): void {
    shift.Expanded = !shift.Expanded;
  }

  /*******************************************
   * PRIVATE METHODS
   *******************************************/
  /**
   * Claim the trainee for the current user.
   */
  private _claimTrainee(trainee: JobTrainingModel.TraineeUserInfo) {
    // if the trainee has previously been claimed, display a confirmation dialog to verify that the claimant is to be replaced
    if (trainee.IsClaimed) {
      // prepare the dialog
      this.alertController.create({
        header: 'Are you sure?',
        message: 'This officer is already claimed by ' + trainee.Claimant + '.',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Yes',
            handler: () => {
              // if the action is confirmed, claim the trainee for the user and display the confirmation toast
              this.jobTrainingService.claimTrainee(this.jobTrainingService.selectedProgram.ProgramID, trainee).subscribe(
                (result: any[]) => {
                  this.toastService.presentToast(trainee.DisplayName + ' Claimed');
                  trainee.IsClaimed = true;
                  trainee.IsClaimedByCurrentUser = true;
                }
              );

            }
          }
        ]
      }).then(alertEl => {
        alertEl.present();
      });

    } else {

      // if the trainee has yet to be claimed for the shift, claim it for the current user
      this.alertController.create({
        header: 'Are you sure?',

        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Yes',
            handler: () => {
              // if the action is confirmed, claim the trainee for the user and display the confirmation toast
              this.jobTrainingService.claimTrainee(this.jobTrainingService.selectedProgram.ProgramID, trainee).subscribe(
                (result: any[]) => {
                  this.toastService.presentToast(trainee.DisplayName + ' Claimed');
                  trainee.IsClaimed = true;
                  trainee.IsClaimedByCurrentUser = true;
                }
              );

            }
          }
        ]
      }).then(alertEl => {
        alertEl.present();
      });
    }
  }

  /**
   * Release the trainee from being claimed by the current user.
   */
  private _releaseTrainee(trainee: JobTrainingModel.TraineeUserInfo) {
    // prepare the dialog
    this.alertController.create({
      header: 'Are you sure?',
      message: 'This officer will become unclaimed.',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            // if the action is confirmed, release the trainee for the user and display the confirmation toast
            this.jobTrainingService.releaseTrainee(this.jobTrainingService.selectedProgram.ProgramID, trainee).subscribe(
              (result: any[]) => {
                this.toastService.presentToast(trainee.DisplayName + ' Released');
                trainee.IsClaimed = false;
                trainee.IsClaimedByCurrentUser = false;
              }
            );

          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }



  async onPopoverMenuButtonClick(event: Event, trainee: JobTrainingModel.TraineeUserInfo, shift: JobTrainingModel.JobTrainingShift) {
    event.stopImmediatePropagation();
    const popover = await this.popoverController.create({
      component: ProgramTraineePopoverMenuComponent,
      componentProps: {
        traineeUserInfo: trainee
      },
      event,
      translucent: true,
    });

    popover.onDidDismiss()
      .then((result) => {
        const selectedOption = result.data;

        switch (selectedOption) {
          case 'selectTrainee':
            this._openTraineeForms(trainee.UserID);
            break;
          case 'removeTrainee':
            this.onRemoveTraineeClick(trainee, shift);
            break;
          case 'changeShift':
            this.onUpdateShift(shift, trainee);
            break;
        }
      });

    return await popover.present();
  }

  private _setupShiftGUIData() {
    //Auto expand all shifts.
    this.jobTrainingService.selectedProgram.ShiftInfo.forEach((loopedShift) => {
      loopedShift.Expanded = true;
    });
  }

  /*******************************************
   * SELF INIT
   *******************************************/
  ngOnInit() {
    this.init();
  }

  init() {
    // Loading will dismiss after needed data is gathered
    this.loadingService.presentLoading('Loading trainees...');
    this._onLoad_getTrainees();
  }

  private _onLoad_getTrainees(): void {

    // retrieve the selected program's full info from the service provider.
    this.jobTrainingService.getTraineeUsers(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
      (trainees: JobTrainingModel.TraineeUserInfo[]) => {

        // map the trainee list
        this.jobTrainingService.trainees = trainees;
        this.jobTrainingService.selectedProgram.ShiftInfo.forEach(loopedShift => {
          loopedShift.Trainees = trainees.filter((loopedTrainee) => {
            return (loopedTrainee.ShiftID === loopedShift.ShiftID);
          });
          if (isNullOrUndefined(loopedShift.Trainees)) {
            loopedShift.Trainees = [];
          }
        });

        this._setupShiftGUIData();

        this.initialized = true;

        this.loadingService.dismissLoading();

      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );

  }

}

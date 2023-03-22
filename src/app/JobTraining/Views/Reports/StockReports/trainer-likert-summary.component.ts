import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { JobTrainingProvider } from '../../../Providers/Service';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_ReportingModel from 'src/app/JobTraining/Providers/Reports.Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'is-what';

// define component
@Component({
  selector: 'jobtraining-report-trainer-likert-summary-component',
  templateUrl: 'trainer-likert-summary.component.html',
  styleUrls: [
    '../../../page.scss'
  ]
})

// create class for export
export class Reporting_TrainerLikertSummaryComponent implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    public navController: NavController,
    public router: Router,
    private alertController: AlertController,
    public jobTrainingService: JobTrainingProvider,
    public loadingService: IonicLoadingService,
    public toastService: ToastService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized: boolean;

  public users: JobTrainingModel.ProgramUserInfo[];

  public selectedRoleIDs: number[];
  public selectedUserID: number;

  public warningPercentageThreshold = 50;

  public filterOutEmptyForms = false;
  public filterOutIncompleteForms = false;

  public filterToDate = '';
  public filterFromDate = '';

  public hasReport = false;
  public report: JT_ReportingModel.FormattedReportInfo;

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/
  public onCloseReportClick() {
    let baseUrl = this.router.url;
    baseUrl = this.router.url.split('/trainerlikertsummary')[0];
    this.navController.navigateRoot(baseUrl);
  }

  public onGoClick() {
    if (this._validateReportParams()) {
      this.loadingService.presentLoading('Loading report...');
      this._getReport();
    }
  }

  /**
   * [setSelectedUser] handles callback/output from Event package returned
   * by custom [JTUserSelectorComponent].
   */
  public setSelectedUser(event: number) {
    this.selectedUserID = event;
  }

  /**
   * [updateFilterToDate] handles the callback from the datepicker calendar popup.
   */
  public updateFilterToDate(newDate: string) {
    this.filterToDate = newDate;
  }
  /**
   * [updateFilterFromDate] handles the callback from the datepicker calendar popup.
   */
  public updateFilterFromDate(newDate: string) {
    this.filterFromDate = newDate;
  }

  /*******************************************
  * PRIVATE METHODS
  *******************************************/
  private _validateReportParams(): boolean {
    // Default [isValid] to true, but it might get set to false as we validate.
    let isValid = true;

    // [warningMessage] will get set when an error is detected.
    let warningMessage = '';

    // Confirm a user is selected.
    if (isNullOrUndefined(this.selectedUserID)) {
      isValid = false;
      warningMessage = 'A user must be selected to run this report.';
    }

    if (!isValid) {
      // No PhaseID selected
      this.alertController.create({
        message: warningMessage,
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

    return isValid;
  }

  private _getReport() {
    this.jobTrainingService.getTrainerLikertSummary(
      this.jobTrainingService.selectedProgram.ProgramID,
      this.selectedUserID,
      this.warningPercentageThreshold,
      this.filterOutEmptyForms,
      this.filterOutIncompleteForms,
      this.filterFromDate,
      this.filterToDate).subscribe(
        (responseData: JT_ReportingModel.FormattedReportInfo) => {
          this.report = responseData;
          this.hasReport = true;

          this.loadingService.dismissLoading();
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

  private _getNonTraineeProgramUsers(): void {
    this.jobTrainingService.getAllProgramUsers(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
      (responseData: JobTrainingModel.ProgramUserInfo[]) => {
        this.users = [];
        // limit [responseData] to just the NON trainee users
        responseData.forEach(loopedUser => {
          if (!loopedUser.IsTraineeUser) {
            this.users.push(loopedUser);
          }
        });

        this.initialized = true;

        if (this.users.length === 1) {
          this.selectedUserID = this.users[0].UserID;
          this._getReport();
        }

        this.loadingService.dismissLoading();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  private _init() {
    this.jobTrainingService.getServerInfo().subscribe(
      (serverInfo: JobTrainingModel.ServerInfo[]) => {
        this._getNonTraineeProgramUsers();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }

    );
  }

  ngOnInit() {
    this._init();
  }
}
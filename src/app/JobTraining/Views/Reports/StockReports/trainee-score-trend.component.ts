import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { JobTrainingProvider } from '../../../Providers/Service';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as JT_FormsModel from 'src/app/JobTraining/Providers/Forms.Model';
import { isNullOrUndefined } from 'is-what';

// define component
@Component({
  selector: 'jobtraining-report-trainee-score-trend-component',
  templateUrl: 'trainee-score-trend.component.html',
  styleUrls: [
    '../../../page.scss'
  ]
})

// create class for export
export class Reporting_TraineeScoreTrendComponent implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    private datePipe: DatePipe,
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

  public chartType = 'line';
  public chartLegend = false;

  public initialized: boolean;

  public users: JobTrainingModel.ProgramUserInfo[];

  public selectedUserID: number;

  public filterToDate = '';
  public filterFromDate = '';

  public hasReport = false;
  public report: TraineeScoreReport;

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/
  public onCloseReportClick() {
    let baseUrl = this.router.url;
    baseUrl = this.router.url.split('/traineescoretrend')[0];
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
    this.jobTrainingService.getTraineeScoreTrend(
      this.jobTrainingService.selectedProgram.ProgramID,
      this.selectedUserID,
      this.filterFromDate,
      this.filterToDate).subscribe(
        (responseData: TraineeScoreReport) => {
          this.report = responseData;
          this._formatReportForChartJS();
          this.hasReport = true;

          this.loadingService.dismissLoading();
        },
        (error) => {
          console.log('trainingPrograms-error: ', error);
          this.loadingService.dismissLoading();
        }
      );
  }

  private _formatReportForChartJS() {
    /**
     * Caching [likertInfo] here for use in the [ticks.callback] method below.
     * We lose the [this] context probably because it's a ChartJS callback, not an angular thing.
     */
    const likertInfo = this.report.LikertInfo;

    this.report.Fields.forEach(loopedField => {
      loopedField.chartOptions = {
        responsive: true,
        /**
         * [chartOptions.scales] control the y-axis.
         * We use the ticks.callback option below to set the proper text on each y-axis tick
         * for it's respective Likert.Rating.
         * ----
         * https://www.chartjs.org/docs/latest/axes/labelling.html
         */
        scales: {
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Rating'
            },
            ticks: {
              min: 0,
              max: likertInfo.PointsPossible,
              callback: function (value, index, values) {
                /**
                 * Loop [LikertInfo.Ratings], find the matching rating for [value]
                 * and return that likerts text.
                 */
                let formattedLabel = value.toString();
                likertInfo.Ratings.forEach((loopedLikertRating: JT_FormsModel.FormLikertRatingInfo) => {
                  if (value.toString() === loopedLikertRating.Score.toString()) {
                    formattedLabel = loopedLikertRating.Text;
                  }
                });
                return formattedLabel;
              }
            }
          }]
        },
        title: {
          display: true,
          text: loopedField.FieldText
        }
      };

      /**
       * [xAxisLabels] is the info shown on the bottom of the line chart.
       * We're gonna display the form/field dates.
       */
      loopedField.xAxisLabels = [];

      loopedField.chartData = [];
      loopedField.ScoreHistory.forEach(loopedScore => {
        loopedField.xAxisLabels.push(
          this.datePipe.transform(loopedScore.Date, 'MM/dd')
        );
        if (loopedScore.RatingInfo.IsNumericScore) {
          loopedField.chartData.push(loopedScore.RatingInfo.Score);
        }
        else {
          // Using [NaN] on ChartJS ought to cause a break in the chart.
          loopedField.chartData.push(NaN);
        }
      });
    });
  }

  /*******************************************
  * SELF INIT
  *******************************************/

  private _getTraineeProgramUsers(): void {
    this.jobTrainingService.getAllProgramUsers(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
      (responseData: JobTrainingModel.ProgramUserInfo[]) => {
        this.users = [];
        // limit [responseData] to just the trainee users
        responseData.forEach(loopedUser => {
          if (loopedUser.IsTraineeUser) {
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
        this._getTraineeProgramUsers();
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

export class TraineeScoreReport {
  public TraineeUserID: number;
  public HeaderMessage: string;
  public Fields: FieldScoreHistoryCollection[];
  public LikertInfo: JT_FormsModel.FormLikertInfo;
}

export class FieldScoreHistoryCollection {
  public FieldID: number;
  public FieldText: string;
  public ScoreHistory: FieldScoreHistoryItem[];

  /**
   * TODO - Move these to their own class(es) to prevent having the odd mix of both on this set of
   * specific report classes.
   */
  public chartOptions: any;
  public xAxisLabels: any;
  public chartData: any;
}

export class FieldScoreHistoryItem {
  public FieldID: number;
  public TraineeFormRecordID: number;
  public RatingInfo: JT_FormsModel.FormLikertRatingInfo;
  public Date: Date;
}
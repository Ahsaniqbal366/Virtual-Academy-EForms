import { Component, OnInit } from '@angular/core';
import { JobTrainingProvider } from '../../Providers/Service';
import * as JobTrainingModel from '../../Providers/Model';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../shared/Toast.Service';
import { Router, ActivatedRoute } from '@angular/router';

// define component
@Component({
  selector: 'jobtraining-program-details-component',
  templateUrl: 'program-detail.html',
  styleUrls: ['../../page.scss', 'program-detail.scss']
})

// This component is for the detail view after clicking a form.
// It will display any users assigned to the selected form.
export class ProgramDetailComponent implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    public jobTrainingService: JobTrainingProvider,
    public alertController: AlertController,
    // NavController allows for the [navigateBack] method which plays the native back animation
    public navController: NavController,
    public loadingService: IonicLoadingService,
    public toastService: ToastService,
    public popoverController: PopoverController,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized = false;
  public defaultBackHref: string;

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/
  private _programID: number;

  /*******************************************
   * PUBLIC METHODS
   *******************************************/


  /*******************************************
   * PRIVATE METHODS
   *******************************************/

  private _openTraineeForms(traineeUserID: number) {
    this.router.navigate(['traineeforms/' + traineeUserID], {relativeTo: this.route});
  }

  /*******************************************
   * SELF INIT
   *******************************************/
  ngOnInit() {
    this.init();
  }

  init() {
    // Loading will dismiss after needed data is gathered
    this.loadingService.presentLoading('Loading program...');
    // grab the id from the URL string
    this._programID = +this.route.snapshot.paramMap.get('programid');
    // If the page was refreshed or the app reloaded here, back up to the main job training page


    if (this._checkForRefresh()) {
      this._onRefresh_getServerInfo();
    } else {
      this._onLoad_getProgram();
    }
  }

  private _onRefresh_getServerInfo(): void {
    this.jobTrainingService.getServerInfo().subscribe(
      (serverInfo: any) => {
        this._onLoad_getProgram();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  private _onLoad_getProgram(): void {

    // retrieve the selected program's full info from the service provider.
    this.jobTrainingService.getProgram(this._programID).subscribe(
      (fullProgramInfo: JobTrainingModel.FullTrainingProgramInfo) => {

        if (fullProgramInfo.IsTraineeUser) {
          this._openTraineeForms(this.jobTrainingService.serverInfo.BasicUserInfo.UserID);
        } else {          
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

  /**
   * [_checkForRefresh] - Check paramMap and/or cached data for signs of a refresh.
   */
  private _checkForRefresh(): boolean {
    return !this.jobTrainingService.serverInfo;
  }

}

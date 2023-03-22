import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { JobTrainingProvider } from '../../Providers/Service';
import * as JobTrainingModel from '../../Providers/Model';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../shared/Toast.Service';
import { Router, ActivatedRoute } from '@angular/router';

// define component
@Component({
  selector: 'jobtraining-report-component',
  templateUrl: 'reports.component.html',
  styleUrls: [
    '../../page.scss'
  ]
})

// create class for export
export class ReportsComponent implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    public navController: NavController,
    public route: ActivatedRoute,
    public router: Router,
    public jobTrainingService: JobTrainingProvider,
    public loadingService: IonicLoadingService,
    public toastService: ToastService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized: boolean;

  // [defaultBackHref] set on [_init].
  public defaultBackHref: string;

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/

  /*******************************************
  * PRIVATE METHODS
  *******************************************/

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._init();
  }

  public _init() {
    this.loadingService.presentLoading('Loading...');

    this._setBackHref();

    if (!this._checkForRefresh()) {
      this.initialized = true;

    } else {
      this._onRefresh_getServerInfo();
    }
  }

  private _setBackHref() {
    const programID = +this.route.snapshot.paramMap.get('programid');
    this.defaultBackHref = '/jobtraining'
      + '/programdetail/' + programID
      + '/reports';
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
    const programID = +this.route.snapshot.paramMap.get('programid');

    this.jobTrainingService.getProgram(programID).subscribe(
      (fullProgramInfo: any) => {
        this.initialized = true;
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

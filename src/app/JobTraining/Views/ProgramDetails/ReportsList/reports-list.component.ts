import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { JobTrainingProvider } from '../../../Providers/Service';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';
import { Router } from '@angular/router';

// define component
@Component({
  selector: 'jobtraining-report-list-component',
  templateUrl: 'reports-list.component.html',
  styleUrls: [
    '../../../page.scss'
  ]
})

// create class for export
export class ReportsListComponent implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    public navController: NavController,
    public router: Router,
    public jobTrainingService: JobTrainingProvider,
    public loadingService: IonicLoadingService,
    public toastService: ToastService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized: boolean;

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

  private _init() {
    this.loadingService.dismissLoading();
  }

  ngOnInit() {
    this._init();    
  }
}

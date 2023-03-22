import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { JobTrainingProvider } from '../../Providers/Service';
import * as Model from '../../Providers/Model';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../shared/Toast.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { Router } from '@angular/router';

// define component
@Component({
  selector: 'jobtraining-program-list-component',
  templateUrl: 'program-list.html',
  styleUrls: ['../../page.scss']
})

// create class for export
export class ProgramListPage implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    public navController: NavController,
    private alertController: AlertController,
    public router: Router,
    public jobTrainingService: JobTrainingProvider,
    public loadingService: IonicLoadingService,
    public toastService: ToastService,
    private dnnEmbedService: DNNEmbedService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public initialized: boolean;

  /**
   * [hideHeaderBackButton] is set on _init. Used to hide the header's back button when the ionic app
   * is embedded in the DNN site.
   *
   * We don't hide the back button on every page/view within this module, just the initial page.
   */
  public hideHeaderBackButton: boolean;

  public programListItemHref: string;

  /*******************************************
  * PUBLIC METHODS
  *******************************************/
  public navigateForward(program: Model.BasicTrainingProgramInfo) {
    this.navController.navigateForward(
      this.router.url + '/programdetail/' + program.ProgramID
    );
  }


  public onCloneTrainingProgramClick(program: Model.BasicTrainingProgramInfo) {
    this.alertController.create({
      header: 'Are you sure?',
      message: 'Do you really want to clone ' + program.Name + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clone',
          handler: () => {
            this.loadingService.presentLoading('Copying program, please wait...');
            this.jobTrainingService.cloneTrainingProgram(program.ProgramID).subscribe(
              (newProgramInfo: Model.BasicTrainingProgramInfo) => {
                this.loadingService.dismissLoading();
                // Open the newly cloned program.
                this.navigateForward(newProgramInfo);                
              },
              (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
              }
            );
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  /*******************************************
  * SELF INIT
  *******************************************/

  private _getPrograms(): void {
    this.jobTrainingService.getPrograms().subscribe(
      // #TODO - Cache training programs objects on class and get variable data into DOM.
      (trainingPrograms: any[]) => {
        this.jobTrainingService.programs = trainingPrograms;
        this.initialized = true;
        this.loadingService.dismissLoading();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  private _init() {
    this.loadingService.presentLoading('Loading programs...');
    // Gotta add loading to this page, however, it's not working very well yet
    this.jobTrainingService.getServerInfo().subscribe(
      // #TODO - Cache training programs objects on class and get variable data into DOM.
      (serverInfo: Model.ServerInfo[]) => {
        this._getPrograms();
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }

    );
  }

  ngOnInit() {
    this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
    this._init();
  }
}

import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { LoadingService } from '../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../Providers/reporting.service';
import * as ReportingModel from '../../Providers/reporting.model';

// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

// define component
@Component({
    selector: 'reporting-user-select',
    templateUrl: 'user-select.html',
    styleUrls: ['../../reporting.page.scss'],

})

// create class for export
export class ReportingUserSelect implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: LoadingService,
        public reportingProvider: ReportingProvider,
        private _alertController: AlertController
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    public serverInfo: ReportingModel.ReportingServerInfo;

    public hideHeaderBackButton: boolean;

    public courseCardConfig: any;

    public selectedCategory: any;

    public searchFilterText: string;

    public selectedUsers: number[];

    public showHiddenTrainingYears: boolean = false;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/


    /********************************************
    * PUBLIC METHODS 
    * *******************************************/
    /**
     * [onGenerateReportBntClick] defines the behaviour of the 'Generate' button
     * 
     * When clicked, the list of selected courses is filtered by all selected and the course IDs are mapped into an array to be used by the
     * Reporting API.
     */
    public onGenerateReportBtnClick() {
        
        let dataView = this.reportingProvider.selectedReport.DataView;

        if (this.reportingProvider.selectedUsers.length > 0) {
        //navigate to the report datatable view, which will trigger a request to the Reporting API to generate the report
        this.router.navigate(['reporting/generateReport/' + dataView]);
        }else{
            this._alertController.create({
                header: "Cannot Generate Report",
                message:
                    "No users have been selected.",
                buttons: [
                    {
                        text: "OK",
                        role: "cancel",
                    }

                ],
            })
                .then((alertEl) => {
                    alertEl.present();
                });
        }
    }

    /**
     * [setUserSelection] sets the value for selected users
     * @param event Event package returned by [UserSelect] component
     */
    public setUserSelection(event: any) {
        this.reportingProvider.selectedUsers = event;
    }

    /**
     * [setCourseSelection] sets the value for selected courses
     * @param event Event package returned by [CourseSelect] stock courses component
     */
    public setCourseSelection(event: any) {
        this.reportingProvider.selectedCourseIDs = event;
    }

    /**
     * [setGeneralOrderSelection] sets the value for selected general orders
     * @param event Event package returned by [GeneralOrderSelect] component
     */
    public setGeneralOrderSelection(event: any) {
        this.reportingProvider.selectedGeneralOrderSections = event;
    }

    /**
     * [setRollCallSelection] sets the value for selected general orders
     * @param event Event package returned by [CourseSelect] roll call component
     */
    public setRollCallSelection(event: any) {
        this.reportingProvider.selectedRollCalls = event;
    }

    public onCategoryChanged(event) {
        this.selectedCategory = event;

        this.reportingProvider.categories.forEach(category => {
            if (category.CategoryID == event.CategoryID) {
                category.GUIData.IsSelected = true;
            } else {
                category.GUIData.IsSelected = false;
            }
        });
    }

    public toggleHiddenTrainingYears(){
        this.showHiddenTrainingYears = !this.showHiddenTrainingYears;
    }

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    

    /**
    * [_checkForRefresh] - Check paramMap and/or cached data for signs of a refresh.
    */
    private _checkForRefresh(): boolean {
        return !this.reportingProvider.serverInfo;
    }
    /*******************************************
    * SELF INIT
    *******************************************/
    ionViewWillEnter() {
        this._init();
    }


    private async _init() {
        await this.loadingService.presentLoading('Loading...');

        if (this._checkForRefresh()) {
            
            this._onRefresh_getServerInfo();

        }else{
            this.initialized = true;
            this.loadingService.dismissLoading();
        }


    }

    private _onRefresh_getServerInfo(): void {
        this.reportingProvider.getServerInfo().subscribe(
            (serverInfo: any) => {
                this.loadingService.dismissLoading();
                this.initialized = true;
            },
            (error) => {
                console.log('reporting-error: ', error);
                this.loadingService.dismissLoading();
                this.initialized = false;
            }
        );
    }

    ngOnInit() {
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        //define course card config
        //this handles the display of sections on [CourseCardContents] component
        //TODO: define a better system for this
        this.courseCardConfig = {
            descriptionConfig: {
                showFullDescription: false
            }
        }

        this._init();
    }
}

@Pipe({
    name: 'sortByYear'
  })
  export class SortPipe implements PipeTransform {
  
    transform(array: any[], field: string): any[] {
      array.sort((a: any, b: any) => {
        if (a[field] < b[field]) {
          return -1;
        } else if (a[field] > b[field]) {
          return 1;
        } else {
          return 0;
        }
      });
      return array;
    }
  
  }
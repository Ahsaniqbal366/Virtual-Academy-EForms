import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/shared/Toast.Service';
import { Location } from '@angular/common';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';

import { SendMessageDialog } from '../../../Components/Dialogs/send-message-dialog';
import { PDFExportService } from 'src/app/Reporting/Providers/pdf-export.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Sort, MatSort } from '@angular/material/sort';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';

// define component
@Component({
    selector: 'acadis-reporting-result',
    templateUrl: 'acadis-reporting-result.component.html',
    styleUrls: ['../../../reporting.page.scss'],

})

// create class for export
export class AcadisReportingResult implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public reportingProvider: ReportingProvider,
        private location: Location,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,  
        private modalController: ModalController,
        private _toastService: ToastService,
        private _alertController: AlertController,
        private _filterPipe: GenericFilterPipe
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;
    public isSearching: boolean;

    public hideHeaderBackButton: boolean;
    public searchTextboxInputValue: string;

    //the report table data source and column definitions
    public reportHeaders: any = [];
    public unfilteredReportData: any = [];
    public reportTableDataSource: any = [];
    public totalRecordCount: number = 0;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) reportTablePaginator: MatPaginator;

    public reportTableProperties: any;

    // This count is retrieved from the [generateAcadisReport] result set.
    // It's purpose is to provide some information to the user that a certain
    // amount of the gathered users will be unavailable for submission the state
    // agencies. (Users without a PSID most notably)
    public invalidUserCount: any;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/


    /********************************************
    * PUBLIC METHODS 
    * *******************************************/

    /**
     * [onBackBtnClick] defines the behaviour for the back button in the header of the report results page
     */
    public onBackBtnClick() {
        this.location.back();
    }

    public onMessageBtnClick(recordInfo: any) {
        this._openSendMessageDialog(recordInfo.LearnerName, recordInfo.UserID)
    }

    /**
     * [onPrintTableBtnClick] is triggered when the user clicks the 'Print' button on the report result table
     */
    public onPrintTableBtnClick() {
        this._printReport();
    }

    /**
     * [onExportTableBtnClick] is triggered when the user clicks the 'Export' button on the report result table
     */
    public onExportTableBtnClick() {
        this._exportReport();
    }

    public onSubmitToStateBtnClick(){
        // sanitize the report values before sending it in to the POST agency to make sure any invalid PSID values are removed
        var sanitizedReportData = this.reportTableDataSource.data.filter(r => r.AcadisID != null && String(r.AcadisID).trim() != "" && String(r.AcadisID).trim() != "N/A");

        // retrieve the count of the data records that will NOT be sent to the POST agency and override the invalid user count with that if any exist
        var filteredInvalidUserCount = this.reportTableDataSource.data.filter(r => r.AcadisID == null || String(r.AcadisID).trim() == "" || String(r.AcadisID) == "N/A").length;
        
        // construct the submission prompt message
        var submissionMessage = 'Are you sure you want to submit this report to your state agency? ';

        // if there are any users that will not be sent from the visible data set, let the user know
        if(filteredInvalidUserCount > 0){
            submissionMessage += filteredInvalidUserCount + ' record(s) will not be sent due to missing PSID values.'
        }

        // init prompt and display
        this._alertController.create({
            header: 'Submit Report to State',
            message: submissionMessage,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.loadingService.presentLoading('Submitting report to state...');

                        this.reportingProvider.submitStateReport(sanitizedReportData).subscribe((reportData: any) => {
                            // update the [LastStateReportSubmitDate] value once the process has finished successfully
                            this.reportingProvider.serverInfo.LastStateReportSubmitDate = new Date().toString();

                            this.loadingService.dismissLoading();
                            this._toastService.presentToast("State Report Submitted");
                        },
                            (error) => {
                                console.log('reporting-error: ', error);
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

    /**
     * [reportSortChange] is triggered when any of the mat-table sort headers are clicked
     */
    public reportSortChange(sort: Sort) {
        const data = this.reportTableDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.reportTableDataSource.data = data;
            return;
        }

        this.reportTableDataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';

            return this._filterPipe.compare(a[sort.active], b[sort.active], isAsc);


        });
    }

    /**
     * [setFilteredRecords] filters the data set based on the search box input
     */
    public setFilteredRecords() {
        this.isSearching = true;

        this.reportTableDataSource.data = this._filterPipe.transform(this.unfilteredReportData, { text: this.searchTextboxInputValue });

        this.isSearching = false;
    }

    /**
     * [applyFilters] generates the given report with the parameters set from the [report-parameters]
     * component
     */
    public applyFilters() {
        this.loadingService.presentLoading('Applying filters...');

        this._generateReport();
    }

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    /**
     * [_setupReportTable] assigns the datasource and paginator component to the output table
     */
    private _setupReportTable(reportData: any) {
        this.reportTableDataSource = new MatTableDataSource(reportData);

        this.reportTableDataSource.sort = this.sort;
        this.reportTableDataSource.paginator = this.reportTablePaginator;
        this.totalRecordCount = reportData.length;
    }

    /**
     * [_printReport] uses [PDFExportService] to generate a PDF export of the visible report rows
     */
    private _printReport() {
        let tableConfig = this.reportTableProperties;

        // use PDFMake to generate a PDF for the visible table data
        let pdfExportService = new PDFExportService();
        pdfExportService.exportMatTableToPDF(tableConfig.exportHeader, tableConfig.pdfLayout, tableConfig.exportColumnDefinitions, this.reportTableDataSource);
    }

    /**
     * [_exportReport] uses [PDFExportService] to generate a CSV export of the visible report rows
     */
    private _exportReport() {
        let tableConfig = this.reportTableProperties;

        // use PDFMake to generate a PDF for the visible table data
        let pdfExportService = new PDFExportService();
        pdfExportService.exportMatTableToCSV(tableConfig.exportFileName, tableConfig.exportColumnDefinitions, this.reportTableDataSource);
    }

    /**
     * [_generateReport] requests that the provider issue an API call to generate the report details.
     */
    private _generateReport(): void {

        //API request to get report data
        this.reportingProvider.generateAcadisReport().subscribe((reportData: any) => {
            // init report properties
            this.reportTableProperties = this.reportingProvider.selectedReport.TableConfig;
            // cache unfiltered data
            this.unfilteredReportData = JSON.parse(reportData.reportData);

            // init displayed columns (will match header configuration)
            this.reportHeaders = [];
            this.reportTableProperties.displayedColumns = [];
            this.reportTableProperties.exportColumnDefinitions = [];

            // iterate over each key value pair in the header dataset and create an object for each one
            // the values must also be placed in the [displayedColumns] list
            for (var key in reportData.headers) {
                // add the attribute key to the displayed columns list
                this.reportTableProperties.displayedColumns.push(key);
                this.reportHeaders.push({ attribute: key, friendlyName: reportData.headers[key] });

                // define the export column definition for the attribute header
                let exportColumnDefinition = {
                    FriendlyName: reportData.headers[key],
                    TechnicalName: key,
                    HideForPrint: false,
                    Datatype: 'string'
                }

                // add the export definition to the list of export definitions for the table
                this.reportTableProperties.exportColumnDefinitions.push(exportColumnDefinition);
            }

            this._setupReportTable(this.unfilteredReportData);

            // set the value for the users that will not be submitted to state when the "Submit To State" button is clicked
            this.invalidUserCount = reportData.invalidUserCount;

            //once the process has completed successfully, dismiss loading and show the page
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

    private async _openSendMessageDialog(learnerName: string, userID: number) {
        //define the modal
        const modal = await this.modalController.create({
            backdropDismiss: false,
            component: SendMessageDialog,
            componentProps: {
                LearnerName: learnerName,
                SendToLearnerID: userID
            }
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {


        });

        //present the modal control
        return await modal.present();
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    ionViewWillEnter() {
        this._init();
    }


    private async _init() {
        await this.loadingService.presentLoading('Loading...');


    }


    ngOnInit() {
        this.initialized = false;
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        // set the default value for the report to be 30 days prior to the current date
        this.reportingProvider.acadisCourseCompletionStartRange = new Date(new Date().setDate(new Date().getDate() - 30));
        this.reportingProvider.acadisCourseCompletionEndRange = new Date();

        this._generateReport();
    }

}
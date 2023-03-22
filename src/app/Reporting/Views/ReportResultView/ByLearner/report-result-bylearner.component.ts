import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingService } from '../../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import { PDFExportService } from 'src/app/Reporting/Providers/pdf-export.service';

// define component
@Component({
    selector: 'report-result-bylearner',
    templateUrl: 'report-result-bylearner.component.html',
    styleUrls: ['../../../reporting.page.scss'],

})

// create class for export
export class ReportingResultByLearner implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private location: Location,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: LoadingService,
        public reportingProvider: ReportingProvider
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    public hideHeaderBackButton: boolean;

    //data table instances for allreports
    public dtInstances: any = [];


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

    /**
     * [toggleDTVisibility] toggles the visibility of a given DT instance row
     */
    public toggleDTVisibility(dtInstance: any) {
        dtInstance.Visibility = !dtInstance.Visibility;
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
     * [_buildDTOptions] creates a new object defining particular datatable assets for the current view
     * @param tableData - The data that will be used in the Datatable
     */
    private _buildDTOptions(tableData: any, exportFileName: string, printHeader: string): {} {
        let columns = [
            {
                title: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                data: 'LearnerName',
                className: ''
            },
            {
                title: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                data: 'Rank',
                className: ''
            },
            {
                title: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                data: 'AcadisID',
                className: ''
            },
            {
                title: 'Course Name',
                data: 'CourseName',
                className: ''
            },
            {
                title: 'Type',
                data: 'CourseType',
                className: ''
            },
            {
                title: 'Start Date',
                data: 'StartDate',
                className: ''
            },
            {
                title: 'End Date',
                data: 'EndDate',
                className: ''
            },

            {
                title: 'Completion Date',
                data: 'CompletionDate',
                className: ''
            },
            {
                title: 'Score',
                data: 'Grade',
                className: ''
            },
            {
                title: 'Message',
                data: null,
                defaultContent: '<div style="text-align:center"><ion-icon name="mail-outline" style="font-size:22px;"></ion-icon></div>',
                className: 'hide-for-print'
            }];

        return {
            data: tableData,
            'processing': true,
            'pageLength': 50,
            'language': {
                'loadingRecords': 'Loading...',
                'processing': 'Loading...',
                search: "_INPUT_",
                searchPlaceholder: "Search"
            },
            columns: columns,
            // Declare the use of the extension in the dom parameter
            dom: 'Bflrtip',
            // Configure the buttons
            buttons: [

                {
                    text: 'Export',
                    action: function (e, dt, node, config) {
                        // datatable data will need to be gathered from the filtered/searched list
                        // when preparing for print and export
                        var dataToExport = [];

                        dt.rows({ order: 'current', search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                            var row = dt.row(rowIdx);
                            dataToExport.push(row.data());
                        });

                        // use PDFMake to generate a PDF for the visible table data
                        let pdfExportService = new PDFExportService();
                        pdfExportService.exportDataTableToCSV(printHeader, columns, dataToExport);
                    }
                },
                {
                    /**
                     * Customized Datatables Print
                     */
                    text: "Print",
                    action: function (e, dt, node, config) {
                        // datatable data will need to be gathered from the filtered/searched list
                        // when preparing for print and export
                        var dataToExport = [];

                        dt.rows({ order: 'current', search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                            var row = dt.row(rowIdx);
                            dataToExport.push(row.data());
                        });

                        // use PDFMake to generate a PDF for the visible table data
                        let pdfExportService = new PDFExportService();
                        pdfExportService.exportDatatableToPDF(printHeader,'landscape', columns, dataToExport);

                    }
                }


            ]
        };

    }

    /**
     * [_generateReport] requests that the provider issue an API call to generate the report details.
     * 
     * The Datatable instance is not declared until this point because once the [dtOptions] are declared, it will try to render the table.
     * To prevent this from happening, the page is left in an unitialized state until the process is complete and the table is ready to be rendered.
     */
    private _generateReport(): void {
        // empty instance list
        this.dtInstances = [];

        let selectedUsers = this.reportingProvider.selectedUsers;

        //API request to get report data
        this.reportingProvider.generateReport().subscribe((reportData: any) => {


            //define a new DT instance
            let dtInstance: any = {};

            //define datatable instance data for each [CourseType]
            dtInstance.StockCourseData = {};
            dtInstance.RollCallCourseData = {};
            dtInstance.GeneralOrderCourseData = {};

            //filter the course report data based on userID
            let filteredReportData = reportData;

            //define the DT options based on the filtered data for each [CourseType]
            dtInstance.dtOptions = this._buildDTOptions(filteredReportData,
                'UserReport_' + new Date().toString(),
                'User Report');

            //if the selected number of users is greater than 1, go ahead and hide all of the result partitions
            dtInstance.Visibility = selectedUsers.length > 1 ? false : true;


            //add the instance to the list of available DT instances
            this.dtInstances.push(dtInstance)


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

        this._generateReport();
    }
}
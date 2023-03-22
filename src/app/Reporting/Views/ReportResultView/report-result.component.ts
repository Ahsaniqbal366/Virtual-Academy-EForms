import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingService } from '../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../Providers/reporting.service';

// define component
@Component({
    selector: 'report-result',
    templateUrl: 'report-result.component.html',
    styleUrls: ['../../reporting.page.scss'],

})

// create class for export
export class ReportingResult implements OnInit {
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

    //initialization options for the report datatable
    public dtOptions: any = {};
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

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    /**
     * [_generateReport] requests that the provider issue an API call to generate the report details.
     * 
     * The Datatable instance is not declared until this point because once the [dtOptions] are declared, it will try to render the table.
     * To prevent this from happening, the page is left in an unitialized state until the process is complete and the table is ready to be rendered.
     */
    private _generateReport(): void {

        //API request to get report data
        this.reportingProvider.generateReport().subscribe((reportData: any) => {

            //define [dtOptions]
            this.dtOptions = {
                data: reportData,
                'processing': true,
                'language': {
                    'loadingRecords': 'Loading...',
                    'processing': 'Loading...',
                    searchPlaceholder: "Search"
                },
                columns: [{
                    title: 'Name',
                    data: 'LearnerName'
                }, {
                    title: 'Course Name',
                    data: 'CourseName'
                }, {
                    title: 'Course Type',
                    data: 'CourseType'
                },
                {
                    title: 'Completion Date',
                    data: 'CompletionDate'
                },
                {
                    title: 'Score',
                    data: 'Grade'
                },
                {
                    title: 'Message',
                    data: null,
                    defaultContent: '<div style="text-align:center"><ion-icon name="mail-outline" style="font-size:22px;"></ion-icon></div>',
                    className: 'hide-for-print'
                }],
                // Declare the use of the extension in the dom parameter
                dom: 'Bfrtip',
                // Configure the buttons
                buttons: [

                    {
                        extend: 'csv',
                        text: 'CSV',
                        filename: 'TMS Report -' + new Date().toString()
                    },
                    {
                        /**
                         * Customized Datatables Print
                         */
                        text: "Print",
                        action: function ( e, dt, node, config ) {
    
                            // select the table element
                            var table = $(node).closest('.dataTables_wrapper');
    
                            // disable the datatable controls and columns that should not display in the print
                            $(table).find('.dt-buttons').hide();
                            $(table).find('.dataTables_filter').hide();
                            $(table).find('.dataTables_length').hide();
                            $(table).find('.dataTables_info').hide();
                            $(table).find('.dataTables_paginate').hide();
                            $(table).find('.hide-for-print').hide();
                            
    
                            
                            // create the print window
                            var newWin = window.open('','Print-Window');
    
                            // open the print window
                            newWin.document.open();
    
                            // write the table data to the new window
                            newWin.document.write('<html><head><link rel="stylesheet" href="https://cdn.datatables.net/1.11.1/css/jquery.dataTables.min.css"/></head>' +
                            '<style>th{text-align:left !important; background-color:gray;}</style><body onload="window.print()"><table>'+$(table).html()+'</table></body></html>');
    
                            // open the print dialog and close the print window after leaving the print dialog
                            newWin.document.close();
                            newWin.focus();
                            
                            setTimeout(function(){newWin.close()}, 500);
    
                            // display the datatable controls once again
                            $(table).find('.dt-buttons').show();
                            $(table).find('.dataTables_filter').show();
                            $(table).find('.dataTables_length').show();
                            $(table).find('.dataTables_info').show();
                            $(table).find('.dataTables_paginate').show();
                            $(table).find('.hide-for-print').show();
    
                            
                        }
                    }

                ]
            };

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
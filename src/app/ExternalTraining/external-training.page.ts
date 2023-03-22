import { Component, OnInit} from '@angular/core';
import { DNNEmbedService } from '../shared/DNN.Embed.Service';

// define component
@Component({
    selector: 'app-external-training',
    templateUrl: 'external-training.page.html',
    styleUrls: ['external-training.page.scss'],

})

// create class for export
export class ExternalTrainingPage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private _dnnEmbedService: DNNEmbedService

    ) {
       
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /********************************************
    * PUBLIC METHODS 
    * *******************************************/
    
    /********************************************
    * PRIVATE METHODS 
    * *******************************************/
    
    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this._dnnEmbedService.tryMessageDNNSite('ionic-loaded');

    }
    
}
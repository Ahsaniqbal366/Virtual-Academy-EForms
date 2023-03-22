import { Component, OnInit } from '@angular/core';
import { DNNEmbedService } from '../shared/DNN.Embed.Service';

// define component
@Component({
  selector: 'app-jobtraining',
  templateUrl: 'page.html',
  styleUrls: ['page.scss']
})

// create class for export
export class JobTrainingPage implements OnInit {
  // constructor -- define service provider
  // The service provider will persist along routes
  constructor(
    private dnnEmbedService: DNNEmbedService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/ 

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    /**
     * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
     * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
     * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
     */
    this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');
  }
}

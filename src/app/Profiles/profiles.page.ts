import { IonicLoadingService } from '../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../shared/DNN.Embed.Service';
import { ProfilesProvider as ProfilesProvider } from './Providers/profiles.service';
import * as ProfilesModel from './Providers/profiles.model';
import { APIResponseError } from '../shared/API.Response.Model';

// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

// define component
@Component({
    selector: 'app-profiles-page',
    templateUrl: 'profiles.page.html',
    styleUrls: ['profiles.page.scss'],

})

// create class for export
export class ProfilesPage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,
        public profilesProvider: ProfilesProvider
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;
    public serverInfo: ProfilesModel.ProfilesServerInfo;
    public hideHeaderBackButton: boolean;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _sectionID: number;

    /********************************************
    * PUBLIC METHODS
    * *******************************************/

    /********************************************
    * PRIVATE METHODS
    * *******************************************/

    // [_checkForRefresh] - Check paramMap and/or cached data for signs of a refresh.
    private _checkForRefresh(): boolean {
        return !this.profilesProvider.serverInfo;
    }
    /*******************************************
    * SELF INIT
    *******************************************/
    ionViewWillEnter() {
        this.parseRouteParams();
        this._init();
    }
    private parseRouteParams() {
        const splitURL = this.router.url.split('/');
        this.profilesProvider.subView = splitURL[splitURL.length - 1];


        const routeSectionID = this.route.snapshot.paramMap.get('sectionID');
        this._sectionID = parseInt(routeSectionID, 10);
        if (isNaN(this._sectionID)) {
            this._sectionID = -1;
        }
        this.profilesProvider.sectionID = this._sectionID;
    }

    private async _init() {
        //await this.loadingService.presentLoading('Loading...');

        if (this._checkForRefresh()) {
            this._onRefresh_getServerInfo();
        } else {
            this.initialized = true;
            this.loadingService.dismissLoading();
        }
    }

    private _onRefresh_getServerInfo(): void {
        this.profilesProvider.getServerInfo().subscribe(
            (serverInfo: any) => {
                this.loadingService.dismissLoading();
                this.initialized = true;
            },
            (error) => {
                console.log('profiles-error: ', error);
                this.loadingService.dismissLoading();
                this.initialized = false;
            }
        );
    }

    ngOnInit() {
        this.profilesProvider.headerText = '';
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');
    }
}

import { IonicLoadingService } from '../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../shared/DNN.Embed.Service';
import { APIResponseError } from '../shared/API.Response.Model';

// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MessageCenterProvider } from './Providers/message-center.service';
import { MessageCenterTab } from './Providers/message-center.model';
import { NavController } from '@ionic/angular';

// define component
@Component({
    selector: 'app-message-center-page',
    templateUrl: 'Message-center.page.html',
    styleUrls: ['Message-center.page.scss'],
})

// create class for export
export class MessageCenterPage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,
        public messageCenterProvider: MessageCenterProvider,
        public navController: NavController
    ) { }

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    public initializing: boolean;
    public initialized: boolean;

    public serverInfo: {};
    public hideHeaderBackButton: boolean;

    public hasError: boolean;
    public apiResonseError: string;

    /*******************************************
     * PRIVATE VARIABLES
     *******************************************/
    private _baseURL = '/messagecenter/';
    private _messageCenterTabValues = Object.keys(MessageCenterTab)
        .map((key) => MessageCenterTab[key])
        .filter((k) => !(parseInt(k, 10) >= 0));
    /********************************************
     * PUBLIC METHODS
     * *******************************************/
    // Allows clicking the selected tab again to navigate to subview from child views
    public onCurrentTabClicked(location: any) {
        // Navigate
        this.navController.navigateBack(location);
        this.messageCenterProvider.messageID = -1;
    }

    public onTabChanged(event: any) {
        if (event.detail.value) {
            // Determine the direction we're moving just for cosmetic navigation slide effect
            const currentTab = this.messageCenterProvider.subView;
            const newTab = event.detail.value;
            const movingForward =
                this._messageCenterTabValues.indexOf(newTab) >=
                this._messageCenterTabValues.indexOf(currentTab);

            // Navigate
            if (newTab !== this._baseURL.replace('/', '')) {
                if (movingForward) {
                    this._navigateForward(newTab);
                } else {
                    this._navigateBack(newTab);
                }
            }

            // Reset the [messageID] which is referenced for knowing we're in the Message View
            this.messageCenterProvider.messageID = -1;

            // Resets compose info on tab swap
            this.messageCenterProvider.resetMessageToBeSent();
        }
    }
    /********************************************
     * PRIVATE METHODS
     * *******************************************/
    private _navigateForward(newTab: MessageCenterTab) {
        this.navController.navigateForward(this._baseURL + newTab);
    }

    private _navigateBack(newTab: MessageCenterTab) {
        this.navController.navigateBack(this._baseURL + newTab);
    }

    // Called from [_init()], sets, if needed, [messageCenterProvider.serverInfo]
    private async _getServerInfo(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            if (!this.messageCenterProvider.serverInfo) {
                this.messageCenterProvider.getServerInfo().subscribe(
                    (serverInfo: any) => {
                        // [serverInfo] is set in [messageCenterProvider]
                        // Resolve to complete the wait for this method
                        resolve();
                    },
                    (error) => {
                        // [hasError] will result in an error state displayed
                        this.hasError = true;
                        this.apiResonseError = error;
                        console.log('error: ', error);
                        // Resolve to complete the wait for this method
                        reject(error);
                    }
                );
            } else {
                // Resolve to complete the wait for this method
                resolve();
            }
        });
    }

    /*******************************************
     * SELF INIT
     *******************************************/

    /**
     * Called from _Init(), we'll [_parseRouteParams()] for important data, like subView and messageID.
     */
    private _parseRouteParams() {
        // Timing out to force an angular refresh, if needed
        setTimeout(() => {
            // Split the url to determine the [subView]
            const splitURL = this.router.url.split('/');
            let subView = splitURL[splitURL.length - 1];

            // If needed, move forward to the default /inbox view
            if (subView === 'messagecenter') {
                subView = 'inbox';
                const path = this.router.url + '/' + subView;
                this.navController.navigateForward(path);
            }

            // Check for a [messageID]
            let routeMessageID = parseInt(
                this.route.snapshot.paramMap.get('massageID'),
                10
            );

            // If we caught one, then we know there [isMessageOpened]
            let isMessageOpened = false;
            if (isNaN(routeMessageID)) {
                routeMessageID = -1;
                isMessageOpened = false;
            } else {
                isMessageOpened = true;
                // We'll want to get the correct piece of the URL for the [subView]
                subView = splitURL[splitURL.length - 2];
            }
            this.messageCenterProvider.isMessageOpened = isMessageOpened;

            // Store the possibly gathered [messageID]
            this.messageCenterProvider.messageID = routeMessageID;

            this.messageCenterProvider.subView = subView;

            this.messageCenterProvider.headerText = this.messageCenterProvider.subView;
        }, 0);
    }

    // Called from [_init()], sets, if needed, [messageCenterProvider.userInfo]
    private async _getUserInfo(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            if (!this.messageCenterProvider.userInfo) {
                this.messageCenterProvider.getUserInfo().subscribe(
                    (userInfo: any) => {
                        this.messageCenterProvider.userInfo = userInfo;
                        resolve();
                    },
                    (error) => {
                        // [hasError] will result in an error state displayed
                        this.hasError = true;
                        this.apiResonseError = error;
                        console.log('error: ', error);
                        // Resolve to complete the wait for this method
                        reject(error);
                    }
                );
            } else {
                // Resolve to complete the wait for this method
                resolve();
            }
        });
    }

    // Called from [_init()], sets, if needed, [messageCenterProvider.rolesForMessage]
    private async _getRolesForMessage(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            if (!this.messageCenterProvider.rolesForMessage) {
                this.messageCenterProvider.getRolesForMessage().subscribe(
                    (rolesForMessage: any) => {
                        this.messageCenterProvider.rolesForMessage = rolesForMessage;
                        resolve();
                    },
                    (error) => {
                        // [hasError] will result in an error state displayed
                        this.hasError = true;
                        this.apiResonseError = error;
                        console.log('error: ', error);
                        // Resolve to complete the wait for this method
                        reject(error);
                    }
                );
            } else {
                // Resolve to complete the wait for this method
                resolve();
            }
        });
    }

    private async _init() {
        this._parseRouteParams();
        if (!(this.initializing || this.initialized)) {
            this.initializing = true;

            // Get Add data required for all sub views
            await this._getServerInfo();
            await this._getUserInfo();
            await this._getRolesForMessage();
            await this.messageCenterProvider.updateUnreadCounts();
            // Flag root view as initialized to begin loading sub view.
            this.initialized = true;
            this.initializing = false;
            // TO be safe, attemppt to clear any potential loaders
            this.loadingService.dismissLoading();
        }
    }

    ionViewWillEnter() {
        this._init();
    }

    ngOnInit() {
        this.messageCenterProvider.headerText = '';
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        this._init();
    }
}

import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { APIResponseError } from '../../../shared/API.Response.Model';
import { isDevMode } from '@angular/core';
import { AlertController } from '@ionic/angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/shared/Toast.Service';
import { MatDialog } from '@angular/material/dialog';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageCenterTab, MessageGUIData } from '../../Providers/message-center.model';

// define component
@Component({
    selector: 'sls-message-center-trash',
    templateUrl: 'sls-message-center-trash.html',
    styleUrls: ['sls-message-center-trash.scss'],

})

// create class for export
export class MessageCenterTrashComponent implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,
        public messageCenterProvider: MessageCenterProvider,
        private alertController: AlertController,
        private toastService: ToastService,
        public dialog: MatDialog
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    // Regular GUI variables
    public initialized: boolean;
    public hasError: boolean;
    public apiResonseError: APIResponseError;
    public isDevMode: boolean;
    public hideHeaderBackButton: boolean;

    public selectedTab: MessageCenterTab;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /********************************************
    * PUBLIC METHODS
    ********************************************/

    /********************************************
    * PRIVATE METHODS
    ********************************************/
    /********************************************
    * INITIAL DATA CHECK
    ********************************************/
    // Called from [_init()], sets defaults for properties, as needed
    private _setupDefaultProperties(): void {
        this.initialized = false;
        this.hasError = false;
        this.isDevMode = isDevMode();
        this.selectedTab = MessageCenterTab.Trash;
    }

    // Called from [_init()], sets, if needed, [messageCenterProvider.deletedMessages]
    private async _getDeletedMessages(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            const senderOrRecipientBool = true;
            this.messageCenterProvider.getDeletedMessages(senderOrRecipientBool).subscribe(
                (deletedMessages: any) => {
                    this.messageCenterProvider.deletedMessages = deletedMessages || [];
                    // Set GUIData on each
                    this.messageCenterProvider.deletedMessages.forEach(loopedDeletedMessage => {
                        loopedDeletedMessage.GUIData = {
                            isChecked: false
                        } as MessageGUIData;
                    });
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
        });
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    private async _init() {
        // Check on the needed data and gather, if needed
        this._setupDefaultProperties();
        await this._getDeletedMessages();
        await this.messageCenterProvider.updateUnreadCounts();
        this.messageCenterProvider.headerText = 'Trash';
        this.messageCenterProvider.subView = 'trash';

        // flag as [initialized] and dismiss loading, if the view [hasError], it'll already be flagged
        this.initialized = true;
    }

    ionViewWillEnter() {
        this._init();
    }

    ngOnInit() {
        this._init();

        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');
    }
}

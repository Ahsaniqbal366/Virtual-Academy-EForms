import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform} from '@angular/core';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { APIResponseError } from '../../../shared/API.Response.Model';
import { isDevMode } from '@angular/core';
import { AlertController, LoadingController, PopoverController, ModalController } from '@ionic/angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/shared/Toast.Service';
import { MatDialog } from '@angular/material/dialog';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageCenterServerInfo, MessageToBeSent, MessageToBeSentGUIData } from '../../Providers/message-center.model';
import { UserSelectDialogComponent } from 'src/app/shared/Components/UserSelect/Dialogs/userselect.dialog';
import { FileUploadConfig, FileUploadService } from 'src/app/shared/Components/FileUpload/file-upload.service';

// define component
@Component({
    selector: 'sls-message-center-compose',
    templateUrl: 'sls-message-center-compose.html',
    styleUrls: ['sls-message-center-compose.scss', '../../message-center.page.scss']

})

// create class for export
export class MessageCenterComposeComponent implements OnInit {
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
        public dialog: MatDialog,
        public modalController: ModalController,
        public loadingController: LoadingController,
        private _fileUploadService: FileUploadService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    // Regular GUI variables
    public initialized: boolean;
    public hasError: boolean;
    public apiResonseError: APIResponseError;
    public isDevMode: boolean;
    public hideHeaderBackButton: boolean;
    public replyUserName: any;

    // CK Editor
    public ckeditorInstance = ClassicEditor;
    public ckeditorConfig = {
        placeholder: 'Add content here...',
        link: { addTargetToExternalLinks: true },
        //toolbar:
        //    [
        //        'bold', 'italic',
        //        '|',
        //        'link'
        //    ]
    };

    public isUploadingAttachment: boolean;
    public sendMessageDisabled: boolean;
    public maxUserSelections = 50;
    public attachmentURLs = [];


    /********************************************
    * PUBLIC METHODS
    ********************************************/
    public onFileUploaded($event): void {
        this.messageCenterProvider.isLoading = true;
        Array.from($event.target.files).forEach( attachment => {
            this._fileUploadService.asyncSaveFileToCloud(attachment as File , new FileUploadConfig()).then(
                (response: any) => {
                    this.hasError = false;
                    this.messageCenterProvider.isLoading = false;
                    if (response && response.data) {
                        this.attachmentURLs.push(response.data);
                    }
                },
                (error) => {
                    // [hasError] will result in an error state displayed
                    this.hasError = true;
                    this.apiResonseError = error;
                    console.log('error: ', error);
                    this.messageCenterProvider.isLoading = false;
                }); 
        });
        this.messageCenterProvider.messageToBeSent.Attachments = this.attachmentURLs;
    }

    public setUserSelection($event): void {
        this.messageCenterProvider.messageToBeSent.Recipients = $event;
    }

    public onRecipientsHeaderClick(event: Event) {
        this._presentUserSelectModal(event);
    }

    public onRemoveRecipientClick($event, recipientToRemove) {
        $event.stopImmediatePropagation();

        this.messageCenterProvider.messageToBeSent.Recipients =
            this.messageCenterProvider.messageToBeSent.Recipients.filter(loopedRecipient =>
                loopedRecipient !== recipientToRemove
            );
    }

    /********************************************
    * PRIVATE METHODS
    ********************************************/
    private async _presentUserSelectModal(event: any) {
        const modal = await this.modalController.create({
            component: UserSelectDialogComponent,
            cssClass: '',
            componentProps: {
                headerText: 'Select Recipient(s)',
                preselectUsers: this.messageCenterProvider.messageToBeSent.Recipients
            }
        });
        await modal.present();
        return modal.onDidDismiss().then(
            (response: any) => {
                if (response && response.data && response.data.selectedUsers) {
                    this.messageCenterProvider.messageToBeSent.Recipients = response.data.selectedUsers;
                }
            }
        );
    }

    /********************************************
    * INITIAL DATA CHECK
    ********************************************/
    // Called from [_init()], sets defaults for properties, as needed
    private _setupDefaultProperties(): void {
        this.initialized = false;
        this.hasError = false;
        this.isDevMode = isDevMode();
        this.messageCenterProvider.messageToBeSent.GUIData.recipientType = 'users';
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    // Called from [_init()], sets, if needed, [messageCenterProvider.signatureInfo]
    private async _checkForSignature(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            if (!this.messageCenterProvider.signatureInfo) {
                this.messageCenterProvider.checkForSignature().subscribe(
                    (signatureInfo: any) => {
                        this.hasError = false;
                        this.messageCenterProvider.signatureInfo = signatureInfo;
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
        // Check on the needed data and gather, if needed
        this._setupDefaultProperties();
        await this._checkForSignature();

        await this.messageCenterProvider.updateUnreadCounts();
        this.messageCenterProvider.headerText = 'Compose';
        this.messageCenterProvider.subView = 'compose';

        // flag as [initialized] and dismiss loading, if the view [hasError], it'll already be flagged
        this.initialized = true;
        this.messageCenterProvider.isLoading = false;

        this.messageCenterProvider.setMessageBody();
        this.messageCenterProvider.replyInfo.isReplying = false;
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

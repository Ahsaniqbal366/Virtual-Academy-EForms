import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { ProfilesProvider as ProfilesProvider } from '../../Providers/profiles.service';
import * as ProfilesModel from '../../Providers/profiles.model';
import { APIResponseError } from '../../../shared/API.Response.Model';
import { isDevMode } from '@angular/core';
import { AlertController } from '@ionic/angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/shared/Toast.Service';
import { MatDialog } from '@angular/material/dialog';

// define component
@Component({
    selector: 'sls-profiles-my-profile',
    templateUrl: 'my-profile.html',
    styleUrls: ['../../profiles.page.scss'],

})

// create class for export
export class MyProfilePage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,
        public profilesProvider: ProfilesProvider,
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

    // Personal Profile data
    public profileData: ProfilesModel.SectionUserProfile;
    public authentication: ProfilesModel.ProfilesAuthenticationInfo;

    // Other
    public carrierList: Array<ProfilesModel.CarrierInfo>;
    public saveInformationMessage: object;
    public saveDisabled: boolean;
    public sessionInfo: object;
    public DefaultInstructionsText: string;
    public isUploading: boolean;
    public isPasswordUpdating: boolean;
    public isUpdating: boolean;

    // CK Editor
    public ckeditorInstance = ClassicEditor;
    public ckeditorConfig = {
        placeholder: 'Add content here...',
        toolbar:
            [
                'bold', 'italic',
                '|',
                'link'
            ]
    };

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _uploadedImage: any;
    /********************************************
    * PUBLIC METHODS
    ********************************************/
   public profilePictureChangeListener($event): void {
    this.isUploading = true;
    this.saveDisabled = true;
    this._uploadedImage = $event.target.files[0];
    this.profilesProvider.UploadProfileJPGPic(this._uploadedImage).then(
        (response: any) => {
            this.profileData.Photopath = response.data;
            this.isUploading = false;
            this.saveDisabled = false;
        },
        (error) => {
            // [hasError] will result in an error state displayed
            this.hasError = true;
            this.apiResonseError = error;
            this.isUploading = false;
            this.saveDisabled = false;
        });
}

// ng-click for the Change Password button
    public onChangePasswordClick() {
        this.isPasswordUpdating = true;
        this.saveDisabled = true;
        // create the regex for the password requirement
        const passwordRegex = new RegExp(this.profilesProvider.serverInfo.passwordRequirementRegex);
        // test against password sent in
        if (passwordRegex.test(this.authentication.newPassword)) {
            this.profilesProvider.changePassword(this.authentication.currentPassword,
                this.authentication.newPassword).subscribe(
                    (response: any) => {
                        // by default I set a passwordResponse object to display the response.message on the GUI
                        this.authentication.passwordResponse = {
                            message: response.message,
                            color: 'red'
                        };
                        // if the response is successful, I set the passwordResponse to a helpful message
                        // indicating their password was successfully changed
                        if (response.flag) {
                            this.authentication.passwordResponse = {
                                message: 'Password was successfully changed',
                                color: 'green'
                            };
                        }

                        this.authentication.currentPassword = null;
                        this.authentication.newPassword = null;
                        this.authentication.confirmPassword = null;
                        this.isPasswordUpdating = false;
                        this.saveDisabled = false;
                    },
                    (error) => {
                        // [hasError] will result in an error state displayed
                        this.hasError = true;
                        this.apiResonseError = error;
                        this.isPasswordUpdating = false;
                        this.saveDisabled = false;
                    });
        } else {
            // if fails, tell the person
            this.authentication.passwordResponse = {
                color: 'red',
                message: 'Please ensure your password meets the specified requirements'
            };
        }
    }

    public async onUpdateProfileClick() {
        this.isUpdating = true;
        this.saveDisabled = true;
        const profileData = this.profileData;
        const profilesProvider = this.profilesProvider;
        const alertController = this.alertController;
        // JDB 11/12/2019 - Require cell carrier selection if [ctrl.profileData.TextNotifications] is true.
        if (this.profileData.TextNotifications && this._isNoneCarrierSelected()) {
            // User didn't enter a cell carrier
            return this.alertController.create({
                message: 'Please select a Cell Carrier in order to receive text notifications',
                buttons: [{ text: 'OK', role: 'ok' }]
            }).then(alertElement => {
                alertElement.present();
                this.isUpdating = false;
                this.saveDisabled = false;
            });
        } else if (this.profileData.AdditionalInfo && this.profileData.AdditionalInfo.length >= 3750) {
            // User didn't enter a cell carrier
            return this.alertController.create({
                message: 'The Additional Info entered is too long.',
                buttons: [{ text: 'OK', role: 'ok' }]
            }).then(alertElement => {
                alertElement.present();
                this.isUpdating = false;
                this.saveDisabled = false;
            });
        } else {
            // otherwise dont run async and only save profileInformation
            this.profilesProvider.updateProfile(profileData).subscribe(
                (response: any) => {
                    const toast = 'User Information Updated';
                    this.toastService.presentToast(toast);
                    this.isUpdating = false;
                    this.saveDisabled = false;
                },
                (error) => {
                    // [hasError] will result in an error state displayed
                    this.hasError = true;
                    this.apiResonseError = error;
                    this.isUpdating = false;
                    this.saveDisabled = false;
                });
        }
    }

    public updateProfileDOB(newDate: string): void {
        this.profileData.DOB = newDate;
    }
    /********************************************
    * PRIVATE METHODS
    ********************************************/
    // Returns whether selected carrier is "None"
    // ACJ 9/3/20 Preserving some bugs here, I believe
    private _isNoneCarrierSelected(): boolean {
        const carrierID = this.profileData.CarrierID;
        return this.carrierList.filter(function (carrier) {
            // tslint:disable-next-line: triple-equals
            return carrier.ID == carrierID;
            // tslint:disable-next-line: triple-equals
        })[0].name.toLowerCase() == 'none';
    }

    /********************************************
    * INITIAL DATA CHECK
    ********************************************/
    // Called from [_init()], sets defaults for properties, as needed
    private _setupDefaultProperties(): void {
        this.initialized = false;
        this.hasError = false;
        this.isDevMode = isDevMode();

        this.saveInformationMessage = {};
        this.saveDisabled = false;
        this.sessionInfo = {};
        this.DefaultInstructionsText = 'Placeholder';
        this.authentication = new ProfilesModel.ProfilesAuthenticationInfo();
    }

    // Called from [_init()], sets, if needed, [profilesProvider.serverInfo]
    private async _checkServerInfo(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            // If needed, set the [profilesProvider.serverInfo]
            if (!this.profilesProvider.serverInfo) {
                this._setServerInfo();
            }
            // Resolve to complete the wait for this method
            resolve();
        });
    }

    // Called from [_init() > _checkServerInfo()], gathers and sets [profilesProvider.serverInfo]
    private async _setServerInfo(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {

            this.profilesProvider.getServerInfo().subscribe(
                (serverInfo: any) => {
                    // [serverInfo] is set in [profilesProvider]
                    // Resolve to complete the wait for this method
                    resolve();
                },
                (error) => {
                    // [hasError] will result in an error state displayed
                    this.hasError = true;
                    this.apiResonseError = error;
                    console.log('error: ', error);
                    // Resolve to complete the wait for this method
                    resolve();
                }
            );
        });
    }

    // Called from [_init()], sets, if needed, [profileData]
    private async _checkUserData(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            // If needed, set the [profileData]
            if (!this.profileData) {
                // Await the setting of [profileData]
                await this._setUserData();
            }
            // Resolve to complete the wait for this method
            resolve();
        });
    }

    // Called from [_init() > _checkUserData()], gathers and sets [profileData]
    private async _setUserData(): Promise<void> {
        return await new Promise((resolve, reject) => {
            this.profilesProvider.getDataForEdit().subscribe(
                (userData: any) => {
                    this.profileData = userData;
                    // Resolve to complete the wait for this method
                    resolve();
                },
                (error) => {
                    // [hasError] will result in an error state displayed
                    this.hasError = true;
                    this.apiResonseError = error;
                    console.log('error: ', error);

                    // Resolve to complete the wait for this method
                    resolve();
                }
            );
        });
    }

    // Called from [_init()], sets, if needed, [carrierList]
    private async _checkCarriers(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
            // If needed, set the [profileData]
            if (!this.carrierList) {
                // Await the setting of [profileData]
                await this._setCarriers();
            }
            // Resolve to complete the wait for this method
            resolve();
        });
    }

    private async _setCarriers() {
        return await new Promise((resolve, reject) => {
            this.profilesProvider.getCellCarriers().subscribe(
                (response: any) => {
                    this.carrierList = response;
                    // Resolve to complete the wait for this method
                    resolve(1);
                },
                (error) => {
                    // [hasError] will result in an error state displayed
                    this.hasError = true;
                    this.apiResonseError = error;
                    console.log('error: ', error);

                    // Resolve to complete the wait for this method
                    resolve(1);
                }
            );
        });

    }

    /*******************************************
    * SELF INIT
    *******************************************/
    private async _init() {
        await this.loadingService.presentLoading('Loading...');
        this.profilesProvider.headerText = "Edit Profile";

        // Check on the needed data and gather, if needed
        this._setupDefaultProperties();
        await this._checkServerInfo();
        await this._checkUserData();
        await this._checkCarriers();

        // flag as [initialized] and dismiss loading, if the view [hasError], it'll already be flagged
        this.initialized = true;
        this.loadingService.dismissLoading();
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

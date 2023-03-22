import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { ProfilesProvider as ProfilesProvider } from '../../Providers/profiles.service';
import * as ProfilesModel from '../../Providers/profiles.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, AlertController, ToastController, PopoverController } from '@ionic/angular';

import { isNullOrUndefined } from 'is-what';
// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router, RouterState } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdditionalInfoDialogComponent } from '../../Components/Dialogs/AdditionalInfoDialog/AdditionalInfoDialog.component';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { MessageUserDialogComponent } from '../../Components/Dialogs/MessageUserDialog/MessageUserDialog.component';


// define component
@Component({
    selector: 'sls-profiles-main-roster',
    templateUrl: 'main-roster.html',
    styleUrls: ['../../profiles.page.scss'],

})

// create class for export
export class MainRosterPage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private alertController: AlertController,
        private popoverController: PopoverController,
        private toastController: ToastController,
        private domSanitizer: DomSanitizer,
        private modalController: ModalController,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: IonicLoadingService,
        public profilesProvider: ProfilesProvider,
        public dialog: MatDialog
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;
    public serverInfo: ProfilesModel.ProfilesServerInfo;
    public hideHeaderBackButton: boolean;

    public allProfiles = [];
    public filteredProfiles = [];

    public searchGeneralText = '';
    public searchSessionsText = '';
    public sessionsSearchIsActive = false;
    public showSessionSearch = false;

    public additionalInfoDialogTemplate = 'profiles.user.additionalinfo.html';
    public isInClassroom = false;

    public profilesLimitTo = {
        startIndex: 0,
        nItems: 21
    };

    public numberToRender = 50;
    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _sectionID: number;

    /********************************************
    * PUBLIC METHODS
    ********************************************/
    public doInfinite(infiniteScroll) {
        const numberToIncreaseRender = 50;
        setTimeout(() => {
            this.numberToRender += numberToIncreaseRender;
            infiniteScroll.target.complete();
        }, 500);
    }

    // Called when user clicks the session search clear button, or emptys the session search textbox.
    public clearSessions() {
        this.searchSessionsText = '';

        if (this.sessionsSearchIsActive) {
            // Only worry about resetting any data is the search was actually active.
            // This is to prevent data from being clearing if the user never hit search in the first place.
            this.filteredProfiles = JSON.parse(JSON.stringify(this.allProfiles));
        }
    }
    // Called when user clicks the session search button.
    public searchSessions() {
        // Cache original profiles list in [$scope.allProfiles]
        this.filteredProfiles = JSON.parse(JSON.stringify(this.allProfiles));

        this.profilesProvider.GetUsersCrossPortalByProfileProperty(this.searchSessionsText).subscribe(
            (response: any) => {
                // Set the search active flag.
                this.sessionsSearchIsActive = true;

                // Update the dataset.
                this.allProfiles = response;

                // Reset the pages, so the searched data can be shown and paginated correctly.
            },
            (error: APIResponseError) => {
                console.log('profiles-error: ', error);
                this.initialized = false;
                this.loadingService.dismissLoading();
            }
        );
    }

    // If the user clears the session search textbox, clear any searched data from the DOM.
    public onSessionSearchKeyup() {
        if (this.searchSessionsText.length === 0) {
            this.clearSessions();
        }
    }

    // Called as the user interacts w/ the main search textbox.
    public onGeneralSearchKeyup() {
        // Reset the pages if the user searches, so the searched data can be shown and paginated correctly.
    }

    // opens the message dialog modal for a user
    public openMessageDialog(user) {
        this.dialog.open(MessageUserDialogComponent, {
            data: {
                userID: user.UserID,
                name: user.Name,
                profilesProvider: this.profilesProvider
            },
            disableClose: true
        });
    }


    // opens addtional dialog modal for a user
    public openAdditionalInfoDialog(user) {
        const tempUser = JSON.parse(JSON.stringify(user));

        if (tempUser.AdditionalInfo === null || tempUser.AdditionalInfo.length === 0) {
            tempUser.AdditionalInfo = 'N/A';
        }

        if (tempUser.Organizationalinfo === null || tempUser.Organizationalinfo.length === 0) {
            tempUser.Organizationalinfo = 'N/A';
        }
        // LEGACY - COMING SOON!
        // tempUser.AdditionalInfo = $sce.trustAsHtml(tempUser.AdditionalInfo);
        // tempUser.Organizationalinfo = $sce.trustAsHtml(tempUser.Organizationalinfo);

        this.dialog.open(AdditionalInfoDialogComponent, {
            data: {
                userData: tempUser,
                template: this.additionalInfoDialogTemplate
            },
        });
    }

    // [filterProfiles] is used as an angular filter on the profiles ng-repeat.
    public filterProfiles(profile) {
        return this._filterProfiles_BySearchText(profile);
    }



    /********************************************
    * PRIVATE METHODS
    ********************************************/
    private _filterProfiles_BySearchText(profile) {
        // trim & toLower [course.Name] and [this.sessionInfo.searchGeneralText]
        const formattedProfileName = profile.Name.split(' ').join('').toLowerCase();
        const formattedSearchText = this.searchGeneralText.split(' ').join('').toLowerCase();
        if (formattedProfileName.indexOf(formattedSearchText) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    ionViewWillEnter() {
        this._init();
    }

    private parseRouteParams() {
        this.parseRouteParams();

        const routeSectionID = this.route.snapshot.paramMap.get('sectionID');
        this._sectionID = parseInt(routeSectionID, 10);
        if (isNaN(this._sectionID)) {
            this._sectionID = 0;
        }
    }

    private async _init() {
        this.profilesProvider.headerText = "Directory";

        this.profilesProvider.getServerInfo().subscribe(
            (serverResponse: any) => {
                if (serverResponse.additionalInfoTemplate !== null && serverResponse.additionalInfoTemplate !== '') {
                    this.additionalInfoDialogTemplate = serverResponse.additionalInfoTemplate;
                }
                this.showSessionSearch = serverResponse.showSessionSearch;

                this.isInClassroom = this.profilesProvider.sectionID > -1;

                // if we are in classroom then get classroom data
                if (this.isInClassroom) {
                    this.profilesProvider.getProfileBySectionID(this.profilesProvider.sectionID).subscribe(
                        (response: any) => {
                            // COMING SOON!
                            // this.allProfiles = response.facilitators.concat(response.students);
                            this.allProfiles = response.students;
                            this.filteredProfiles = response.students.slice(0, 50);
                            this.initialized = true;
                        },
                        (error) => {
                            // [hasError] will result in an error state displayed
                            // this.hasError = true;
                            // this.apiResonseError = error;
                            console.log('error: ', error);
                            this.initialized = false;
                            // Resolve to complete the wait for this method
                        }
                    );
                } else {
                    // else get officer data
                    this.profilesProvider.getSiteOfficers().subscribe(
                        (response: any) => {
                            // COMING SOON!
                            // this.allProfiles = response.facilitators.concat(response.students);
                            this.allProfiles = response;
                            this.filteredProfiles = response.slice(0, 50);
                            this.initialized = true;
                        },
                        (error) => {
                            // [hasError] will result in an error state displayed
                            // this.hasError = true;
                            // this.apiResonseError = error;
                            console.log('error: ', error);
                            this.initialized = false;
                            // Resolve to complete the wait for this method
                        }
                    );
                }
            },
            (error: APIResponseError) => {
                console.log('profiles-error: ', error);
                this.initialized = false;
                this.loadingService.dismissLoading();
            }
        );
    }

    ngOnInit() {
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

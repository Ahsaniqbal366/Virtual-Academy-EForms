import { Component, OnInit } from '@angular/core';
import { JobTrainingProvider } from '../../../Providers/Service';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../../shared/Toast.Service';

import { isNullOrUndefined } from 'is-what';
import { Observable } from 'rxjs';
import { ProgramUserPopoverMenuFactory } from './PopoverMenu/program-users.popover-menu.component';
import { AddProgramUserDialogFactory, AddProgramUserDialogInputInfo } from '../AddProgramUserDialog/add-program-user-dialog';

// define component
@Component({
    selector: 'jobtraining-programusers',
    templateUrl: 'program-users.component.html',
    styleUrls: [
        '../../../page.scss',
        '../program-detail.scss'
    ]
})

export class ProgramUsersComponent implements OnInit {
    // define service provider and route provider when component is constructed
    constructor(
        public jobTrainingService: JobTrainingProvider,
        public alertController: AlertController,
        // NavController allows for the [navigateBack] method which plays the native back animation
        public navController: NavController,
        public loadingService: IonicLoadingService,
        public toastService: ToastService,
        private programUserPopoverMenuFactory: ProgramUserPopoverMenuFactory,
        private addProgramUserDialogFactory: AddProgramUserDialogFactory
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized = false;

    // [filteredUsers] is the user array shown in the GUI.
    public filteredUsers: JobTrainingModel.ProgramUserInfo[];

    //[searchTextboxInputValue] & [searchTextboxInputValue] work together to drive the search textbox feature.
    public searchTextboxInputValue = '';
    public isSearching = false;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    /**
     * [_allUsers] is the full users data set. It's potentially filtered into the [filteredUsers] array
     * by search bars etc in the GUI.
     */
    private _allUsers: JobTrainingModel.ProgramUserInfo[];

    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    public setFilteredUsers() {
        this._filterUsersList()
            .subscribe((result) => {
                // Bind our filtered dataset & clear the loading state.
                this.filteredUsers = result;
                this.isSearching = false;
            });
    }

    /**
     * [onAddUserButtonClick]
     * Click event for add trainee button. Opens a dialog.
     */
    public async onAddUserButtonClick() {
        const dialogInput = new AddProgramUserDialogInputInfo();
        dialogInput.forceTraineeUser = false;
        await this.addProgramUserDialogFactory.openAddUserDialog(dialogInput).then((result: any) => {
            /** 
             * Check for a truthy [result] in case the dialog was unexpectedly closed,
             * and [result.confirmed] to ensure the user confirmed the addition
             */
            if (result.data && result.data.confirmed) {
                this._allUsers.push(result.data.newUserInfo);
                // Run [setFilteredUsers] now that the [_allUsers] dataset has changed.
                this.setFilteredUsers();
                this.toastService.presentToast(result.data.newUserInfo.DisplayName + ' added');
            }
        });
    }


    public onPopoverMenuButtonClick(event: Event, userInfo: JobTrainingModel.ProgramUserInfo) {
        // JDB 7/13/2020 - Don't run if the current user is clicking on themselves
        if (this.jobTrainingService.serverInfo.BasicUserInfo.UserID == userInfo.UserID) return;
        this.programUserPopoverMenuFactory.openUserPopover(event, userInfo).then((result: any) => {
            // JDB 7/13/2020 - For some reason this fires twice, once with result.data empty and once with it populated.
            // Don't run if [result.data] is empty
            if (!result.data) return;
            const selectedOption = result.data.selectedOption;

            switch (selectedOption) {
                case 'updateRoles':
                    this._onUpdateUserRolesClick(userInfo, result.data.roleIDs);
                    break;
                case 'removeUser':
                    this._onRemoveUserClick(userInfo);
                    break;
            }
        });
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/

    private _filterUsersList() {
        /**
         * We're using an [Observable] so the filtering can run in the background.
         * That makes it work a lot better with our searching flag.
         */
        const observable = new Observable<JobTrainingModel.ProgramUserInfo[]>(subscriber => {
            let formattedSearchText = '';
            let hasSearchText = false;
            if (!isNullOrUndefined(this.searchTextboxInputValue)) {
                formattedSearchText = this.searchTextboxInputValue.toLowerCase();
                if (formattedSearchText.length > 0) {
                    hasSearchText = true;
                }
            }

            let copiedUsers: JobTrainingModel.ProgramUserInfo[];

            if (hasSearchText) {
                /**
                 * We're gonna deep copy [this.users] so we can filter it without
                 * breaking the original datasource.
                 * ----
                 * https://stackoverflow.com/questions/39506619/angular2-how-to-copy-object-into-another-object/48266224 
                 * EX: let copy = JSON.parse(JSON.stringify(myObject))
                 */
                copiedUsers = JSON.parse(JSON.stringify(this._allUsers));
                /**
                 * Filter tasks/form records from our copied [copyTaskListCategories] array.
                 */
                copiedUsers = copiedUsers.filter(loopedUser => {
                    //Let says the user is a MATCH if the name match.
                    let userHasMatch = (loopedUser.DisplayName.toLowerCase().indexOf(formattedSearchText) > -1);
                    if (!userHasMatch) {
                        //No match yet, check [AcadisID] (AKA PSID).
                        userHasMatch = (loopedUser.AcadisID.toLowerCase().indexOf(formattedSearchText) > -1);
                    }
                    if (!userHasMatch) {
                        //No match yet, check Roles.
                        userHasMatch = (loopedUser.Roles.join(', ').toLowerCase().indexOf(formattedSearchText) > -1);
                    }

                    return userHasMatch;
                });
            }
            else {
                copiedUsers = this._allUsers;
            }

            subscriber.next(copiedUsers);
            subscriber.complete();
        });
        return observable;

    }

    /**
     * [_onUpdateUserRolesClick] handles submission event of <select> to update user roles.
     * Calls API to update DB, then uses output to update GUI.
     */
    private _onUpdateUserRolesClick(userInfo: JobTrainingModel.ProgramUserInfo, roleIDs: number[]) {
        // Validation of selected roles is performed on the serverside.
        this.loadingService.presentLoading('Updating roles...');

        /**
         * Make a copy of [userInfo] to send to the API so we don't overwrite the original [RoleIDs]
         * in the event of an API call validation error or other failure.
         */
        var copiedUserInfoForAPI = JSON.parse(JSON.stringify(userInfo));
        copiedUserInfoForAPI.RoleIDs = roleIDs;
        this.jobTrainingService.updateUserRoles(copiedUserInfoForAPI).subscribe(
            (updatedUserInfo: JobTrainingModel.ProgramUserInfo) => {
                // Update [userInfo] item in [_allUsers] array.
                Object.assign(userInfo, updatedUserInfo);                

                // Run [setFilteredUsers] now that the [_allUsers] dataset has changed.
                this.setFilteredUsers();

                this.loadingService.dismissLoading();

                this.toastService.presentToast('Roles updated for ' + userInfo.DisplayName);
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            });
    }

    /** The click event for the remove user button, triggers a confirmation alert */
    private _onRemoveUserClick(userInfo: JobTrainingModel.ProgramUserInfo) {
        this.alertController.create({
            header: 'Are you sure?',
            message: 'Do you really want to remove ' + userInfo.DisplayName
                + ' from  ' + this.jobTrainingService.selectedProgram.Name + '?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.loadingService.presentLoading('Removing...');
                        this.jobTrainingService.removeUserFromProgram(this.jobTrainingService.selectedProgram.ProgramID, userInfo.UserID).subscribe(
                            (result: any) => {
                                // Remove [userInfo] item from [_allUsers] array.
                                var userIndex = this._allUsers.indexOf(userInfo);
                                if (userIndex !== -1) {
                                    this._allUsers.splice(userIndex, 1);
                                }

                                // Run [setFilteredUsers] now that the [_allUsers] dataset has changed.
                                this.setFilteredUsers();

                                this.loadingService.dismissLoading();
                                this.toastService.presentToast(userInfo.DisplayName + ' removed');
                            },
                            (error) => {
                                console.log('trainingPrograms-error: ', error);
                                this.loadingService.dismissLoading();
                            });
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /*******************************************
     * SELF INIT
     *******************************************/
    ngOnInit() {
        this.init();
    }

    init() {
        // Loading will dismiss after needed data is gathered
        this.loadingService.presentLoading('Loading users...');
        // JDB 7/13/2020 - Make sure we have server info
        if (isNullOrUndefined(this.jobTrainingService.serverInfo)) {
            this.jobTrainingService.getServerInfo().subscribe(this._onLoad_getUsersAndRoles, 
                error => {
                    console.log('trainingPrograms-error: ', error);
                    this.loadingService.dismissLoading();
                }
            );
        } else {
            this._onLoad_getUsersAndRoles();
        }
    }

    private _onLoad_getUsersAndRoles(): void {

        // retrieve the selected program's full info from the service provider.
        this.jobTrainingService.getAllProgramUsers(this.jobTrainingService.selectedProgram.ProgramID).subscribe(
            (responseData: JobTrainingModel.ProgramUserInfo[]) => {
                this._allUsers = responseData;
                // Run [setFilteredUsers] now that the [_allUsers] dataset has changed.
                this.setFilteredUsers();

                this.initialized = true;

                this.loadingService.dismissLoading();

            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );

    }

}

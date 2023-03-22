import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserSelectProvider } from './Providers/userselect.service';
import * as UserSelectModel from './Providers/userselect.model';
import { CourseCategoryInfo } from '../CourseSelect/Providers/courseselect.model';
import { PopoverController, ModalController } from '@ionic/angular';



@Component({
  selector: 'rank-and-user-selector',
  templateUrl: 'rank-and-user-select.component.html',
  styleUrls: ['userselect.component.scss'],
  providers: [UserSelectProvider]
})
export class RankAndUserSelectComponent implements OnInit {

  //default constructor
  constructor(
    public userSelectProvider: UserSelectProvider) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Output() onUsersSelected: EventEmitter<UserSelectModel.UserInfo[]> = new EventEmitter();

  @Input() maxHeight: any;
  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  roleSearchFilterIsActive: boolean;
  officerSearchFilterIsActive: boolean;

  roleSearchFilterWarningMessage: string;
  officerSearchFilterWarningMessage: string;

  selectAllRolesFlag: boolean;
  selectAllOfficersFlag: boolean;

  officerSearchFilterText: string;
  officerSearchHasWarning: boolean;

  roleSearchFilterText: string;
  roleSearchHasWarning: boolean;


  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/
  _officerServerSideSearchIsActive: boolean;
  _officersServerSideSearchCounter: number;

  /****************************************************************************************/
  /* PUBLIC METHODS
  /****************************************************************************************/

  //[onSelectAllRolesChange] handles the change event of the "Select All" roles checkbox in the table header
  public onSelectAllRolesChange() {
    if (this.selectAllRolesFlag) {
      //If the user chose to select all roles then we will:
      //- loop all roles
      //- flag all roles as selected
      //- call a webmethod to get all officers in all selected roles.

      //- loop all roles
      this.userSelectProvider.roles.forEach((role) => {
        role.GUIData.IsSelected = true;
        this._getOfficersByRole(role);
      });
    }
    else {
      //If the user chose to DESELECT all roles then we will:
      //- loop all roles
      //- flag all roles as NOT selected
      //- call submethod to hide officers in deselected roles

      //- loop all roles
      this.userSelectProvider.roles.forEach((role) => {
        //- flag all roles as NOT selected
        role.GUIData.IsSelected = false;
        //- call submethod to hide officers is deselected roles
        this._hideOfficersInRole(role);
      });

      this._clearOfficerSearchText();
    }

    //As the selected roles change, if we know the role search filter is active we need to recall
    //the role search change event to keep all warning messages correctly formatted.
    if (this.roleSearchFilterIsActive) {
      this.onRoleFilterTextChange();
    }
  };

  //[onRoleSelectionChanged] handles the change events of the individual role checkboxes
  public onRoleSelectionChanged(role: any) {
    if (role.GUIData.IsSelected) {
      //- call a webmethod to get all officers in the newly select role.
      this._getOfficersByRole(role);
    }
    else {
      //- call submethod to hide officers in deselected role
      this._hideOfficersInRole(role);
    }
  };

  //[onRoleFilterTextChange] handles the change event of the roles search textbox at top of table
  public onRoleFilterTextChange() {
    if (this.roleSearchFilterText.length === 0) {
      //If there is NOT any text in the role search box:
      //- Clear role search flags and messages
      //- Unhide any roles that were hidden by the search

      //- Clear role search flags and messages
      this.roleSearchFilterIsActive = false;
      this.roleSearchHasWarning = false;
      this.roleSearchFilterWarningMessage = '';

      //- Unhide any roles that were hidden by the search
      this.userSelectProvider.roles.forEach(role => {
        role.GUIData.IsHiddenBySearch = false;
      });
    }
    else {
      //If the user entered text into the role search box:
      //- Set "search is active" flag
      //- Loop all roles and show/hide the roles according to the search text
      //- While looping, keep track of # of hidden & selected roles for warning message formatting
      //- Format search warning text as necessary

      //- Set "search is active" flag
      this.roleSearchFilterIsActive = true;

      //- Loop all roles and show/hide the roles according to the search text
      var nHiddenAndSelectedRoles = 0;
      this.userSelectProvider.roles.forEach(role => {
        var formattedRoleName = role.RoleName.toLowerCase();
        var formattedRoleSearchText = this.roleSearchFilterText.toLowerCase();
        //If the role name DOES NOT contain the search text that role needs
        //to be hidden in the DOM.
        if (formattedRoleName.indexOf(formattedRoleSearchText) === -1) {
          role.GUIData.IsHiddenBySearch = true;

          //- While looping, keep track of # of hidden & selected roles for warning message formatting
          if (role.GUIData.IsSelected) {
            nHiddenAndSelectedRoles++;
          }

        }
        else {
          //The role name DID contain the search text, unide that role if necessary
          role.GUIData.IsHiddenBySearch = false;
        }
      });

      //- Format search warning text as necessary
      if (nHiddenAndSelectedRoles !== 0) {
        //Some selected roles were hidden by the search text.
        //Show that information in a message that will get display to the user.
        this.roleSearchHasWarning = true;
        if (nHiddenAndSelectedRoles === 1) {
          this.roleSearchFilterWarningMessage = nHiddenAndSelectedRoles + ' selected role is hidden by your search.';
        }
        else {
          this.roleSearchFilterWarningMessage = nHiddenAndSelectedRoles + ' selected roles are hidden by your search.';
        }

      }
      else {
        //No search warnings to report in this case. Clear relevant flags/data.
        this.roleSearchHasWarning = false;
        this.roleSearchFilterWarningMessage = '';
      }
    }
  };

  //[onSelectAllOfficersChange] handles the change event of the "Select All" officers checkbox in the table header
  public onSelectAllOfficersChange = function () {
    //Loop just the officers in the [ctrl.officers] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllOfficersFlag] flag                
    this.userSelectProvider.officers.forEach(officer => {
      officer.GUIData.IsSelected = this.selectAllOfficersFlag;
    });

    //As the selected officers change, if we know the OFFICER search filter is active we need to recall
    //the officer search change event to keep all warning messages & filters correct.
    if (this.officerSearchFilterIsActive) {
      this._filterOfficersArrayWithSearchText();
    }

    //emit newly selected list of officers
    this.onUsersSelected.emit(this.userSelectProvider.officers.filter(
      officer => officer.GUIData.IsSelected));
  };

  //[onOfficerFilterTextChange] handles the change event of the officers search textbox at top of table
  public onOfficerFilterTextChange() {
    //If roles are selected we just filter the officers in the DOM
    this._filterOfficersArrayWithSearchText();

  };

  //[onOfficerRowClicked] handles the click event for a full officer row.
  //Officer rows don't have checkboxes so we use a click event instead of a change event.
  public onOfficerRowClicked(officer) {
    this.onUsersSelected.emit(this.userSelectProvider.officers.filter(
      officer => officer.GUIData.IsSelected));
  };

  /****************************************************************************************/
  /* PRIVATE METHODS
  /****************************************************************************************/

  //[_getOfficersByRole] will get all officers in the given role.
  //Called as a role is selected in the DOM.
  private _getOfficersByRole(role) {

    this.userSelectProvider.officers.forEach(officer => {

      if (officer.RankID == role.RoleID) {
        officer.GUIData.IsHiddenBySearch = false;
      }
    });

  }

  //[_hideOfficersInRole] is called as a role is deselected.
  //- Loop all officers to find just officers in the deselected role.
  //- Loop officers to remove and splice them from the [ctrl.officers] array.
  private _hideOfficersInRole(role: any) {
    this.userSelectProvider.officers.forEach(officer => {
      if (officer.RankID == role.RoleID) {
        officer.GUIData.IsHiddenBySearch = true;
      }
    });
  }

  private _clearOfficerSearchText() {
    //- Clear officer search flags and messages
    this.officerSearchFilterText = '';
    this.officerSearchFilterIsActive = false;
    this.officerSearchHasWarning = false;
    this.officerSearchFilterWarningMessage = '';
    this._officerServerSideSearchIsActive = false;

    //- Unhide any officers that were hidden by the search
    this.userSelectProvider.officers.forEach(officer => {
      officer.GUIData.IsHiddenBySearch = false;
    });
  }

  private _filterOfficersArrayWithSearchText() {
    this._officerServerSideSearchIsActive = false;

    if (this.officerSearchFilterText.length === 0) {
      //If there is NOT any text in the officer search box:
      //- Clear officer search flags and messages
      //- Unhide any officers that were hidden by the search

      //- Clear officer search flags and messages
      this.officerSearchFilterIsActive = false;
      this.officerSearchHasWarning = false;
      this.officerSearchFilterWarningMessage = '';

      //- Unhide any officers that were hidden by the search
      this.userSelectProvider.officers.forEach(officer => {
        officer.GUIData.IsHiddenBySearch = true;
      });
    }
    else {
      //If the user entered text into the officer search box:
      //- Set "search is active" flag
      //- Loop all officers and show/hide the officers according to the search text
      //- While looping, keep track of # of hidden & selected officers for warning message formatting
      //- Format search warning text as necessary

      //- Set "search is active" flag
      this.officerSearchFilterIsActive = true;

      //- Loop all officers and show/hide the officers according to the search text
      var nHiddenAndSelectedOfficers = 0;
      this.userSelectProvider.officers.forEach(officer => {
        var formattedOfficerName = officer.FullName.toLowerCase();
        var formattedOfficerSearchText = this.officerSearchFilterText.toLowerCase();
        //If the officer name DOES NOT contain the search text that officer needs
        //to be hidden in the DOM.
        if (formattedOfficerName.indexOf(formattedOfficerSearchText) === -1) {
          officer.GUIData.IsHiddenBySearch = true;

          //- While looping, keep track of # of hidden & selected officers for warning message formatting
          if (officer.GUIData.IsSelected) {
            nHiddenAndSelectedOfficers++;
          }

        }
        else {
          //The officer name DID contain the search text, unide that officer if necessary
          officer.GUIData.IsHiddenBySearch = false;
        }
      });

      //- Format search warning text as necessary
      if (nHiddenAndSelectedOfficers !== 0) {
        //Some selected officers were hidden by the search text.
        //Show that information in a message that will get display to the user.
        this.officerSearchHasWarning = true;
        if (nHiddenAndSelectedOfficers === 1) {
          this.officerSearchFilterWarningMessage = nHiddenAndSelectedOfficers + ' selected officer is hidden by your search.';
        }
        else {
          this.officerSearchFilterWarningMessage = nHiddenAndSelectedOfficers + ' selected officers are hidden by your search.';
        }

      }
      else {
        //No search warnings to report in this case. Clear relevant flags/data.
        this.officerSearchHasWarning = false;
        this.officerSearchFilterWarningMessage = '';
      }
    }
  }

  //[_hasSelectedRoles] simply checks if any roles are selected in the DOM
  private _hasSelectedRoles() {
    var flag = false;

    this.userSelectProvider.roles.forEach(role => {
      if (role.GUIData.IsSelected) {
        flag = true;
      }
    });

    return flag;
  }

  /**
   * [_getUsers]: Called to gather a list of [UserInfo] objects from the DB.
   */
  private _getUsers() {
    this.userSelectProvider.getUsers().subscribe(
      (officers: UserSelectModel.UserInfo[]) => {
        this.userSelectProvider.officers = officers;

        this.userSelectProvider.officers.forEach(officer => {
          officer.GUIData = new UserSelectModel.UserInfoGUIData();
        });

      },
      (error) => {
        console.log('userselect-error: ', error);

      }
    );
  }

  /**
   * [_getRoles]: Called to gather a list of [RoleInfo] objects from the DB.
   */
  private _getRoles() {
    this.userSelectProvider.getRoles().subscribe(
      (roles: UserSelectModel.RoleInfo[]) => {
        this.userSelectProvider.roles = roles;

        this.userSelectProvider.roles.forEach(role => {
          role.GUIData = new UserSelectModel.RoleInfoGUIData();
        });

      },
      (error) => {
        console.log('userselect-error: ', error);

      }
    );
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.roleSearchFilterText = "";
    this._officersServerSideSearchCounter = 0;

    this.roleSearchFilterIsActive = false;
    this.officerSearchFilterIsActive = false;

    this.roleSearchFilterWarningMessage = "";
    this.officerSearchFilterWarningMessage = "";

    this.selectAllRolesFlag = false;
    this.selectAllOfficersFlag = false;

    //data gather fxns
    this._getUsers();
    this._getRoles();
  }


}

/**
 * [UserSelectComponent]
 * 
 * This component renders a selectable list of users that can be filtered by a search box input 
 * and a multi-select element for roles.
 */
@Component({
  selector: 'user-selector',
  templateUrl: 'user-select.component.html',
  styleUrls: ['userselect.component.scss'],
  providers: [UserSelectProvider]
})
export class UserSelectComponent implements OnInit {

  //default constructor
  constructor(
    public userSelectProvider: UserSelectProvider) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  //when a new user is selected, this emitter signals such
  @Output() onUsersSelected: EventEmitter<UserSelectModel.UserInfo[]> = new EventEmitter();

  @Input() maxHeight: any;

  //defines a list of UserIDs to limit the components result list to display
  @Input() limitToUserIDs: number[] = [];

  //defines the maximum allowed user selections
  @Input() maxSelections: number = 0;

  @Input() preselectUsers: UserSelectModel.UserInfo[];

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  //bit to reference when the search filter is active
  officerSearchFilterIsActive: boolean;

  //string to contain the filter warning message to let the user know that some of their selections are hidden
  officerSearchFilterWarningMessage: string;

  //bit to select all officers
  selectAllOfficersFlag: boolean;

  //string to contain the user search input text
  officerSearchFilterText: string;
  officerSearchHasWarning: boolean;

  selectedRoles: string[];


  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/
  _officerServerSideSearchIsActive: boolean;
  _officersServerSideSearchCounter: number;

  /****************************************************************************************/
  /* PUBLIC METHODS
  /****************************************************************************************/
  //[onRoleSelectionChanged] handles the change events of the individual role checkboxes
  public onRoleSelectionChanged() {
    //gather filtered officers
    this._getOfficersByRole();
  };

  //[onSelectAllOfficersChange] handles the change event of the "Select All" officers checkbox in the table header
  public onSelectAllOfficersChange = function () {
    //Loop just the officers in the [ctrl.officers] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllOfficersFlag] flag                
    this.userSelectProvider.officers.forEach(officer => {
      officer.GUIData.IsSelected = this.selectAllOfficersFlag;
    });

    //As the selected officers change, if we know the OFFICER search filter is active we need to recall
    //the officer search change event to keep all warning messages & filters correct.
    if (this.officerSearchFilterIsActive) {
      this._filterOfficersArrayWithSearchText();
    }

    //emit newly selected list of officers
    this.onUsersSelected.emit(this.userSelectProvider.officers.filter(
      officer => officer.GUIData.IsSelected));
  };

  //[onOfficerFilterTextChange] handles the change event of the officers search textbox at top of table
  public onOfficerFilterTextChange() {
    //If roles are selected we just filter the officers in the DOM
    this._filterOfficersArrayWithSearchText();

  };

  //[onOfficerRowClicked] handles the click event for a full officer row.
  //Officer rows don't have checkboxes so we use a click event instead of a change event.
  public onOfficerRowClicked(officer) {
    this.onUsersSelected.emit(this.userSelectProvider.officers.filter(
      officer => officer.GUIData.IsSelected));
  };

  /**
   * [hasReachedSelectionLimit] returns a boolean value to facilitate the disabling/enabling the selection of further
   * users once the limit has been reached. The limit is defined by the [maxSelections] input parameter.
   */
  public get hasReachedSelectionLimit(): boolean {
    //do nothing if the [maxSelections] parameter is not in use
    if (this.maxSelections != 0) {
      return (this.userSelectProvider.officers.filter(officer => officer.GUIData.IsSelected).length >= this.maxSelections);
    } else {
      return false;
    }
  }

  /****************************************************************************************/
  /* PRIVATE METHODS
  /****************************************************************************************/

  //[_getOfficersByRole] will get all officers in the given role.
  //Called when a role is selected in the DOM.
  private _getOfficersByRole() {

    //iterate over the list of users to determine if any exist in the selected list of roleIDs
    this.userSelectProvider.officers.forEach(officer => {

      if (this.selectedRoles.indexOf(officer.RankID) <= -1 && this.selectedRoles.length > 0) {
        //if the user does not exist in any of the roles, hide it
        officer.GUIData.IsHiddenBySearch = true;
      } else {
        //if the user exists in the list of roles, show it
        officer.GUIData.IsHiddenBySearch = false;
      }
    });

  }

  /**
   * Filter the user list based on the search parameters provided.
   */
  private _filterOfficersArrayWithSearchText() {
    this._officerServerSideSearchIsActive = false;

    //if the length of the search box is 0, then disregard any search input values and attempt to show all available
    if (this.officerSearchFilterText.length === 0) {
      //If there is NOT any text in the officer search box:
      //- Clear officer search flags and messages
      //- Unhide any officers that were hidden by the search

      //- Clear officer search flags and messages
      this.officerSearchFilterIsActive = false;
      this.officerSearchHasWarning = false;
      this.officerSearchFilterWarningMessage = '';

      //- Unhide any officers that were hidden by the search
      this.userSelectProvider.officers.forEach(officer => {
        officer.GUIData.IsHiddenBySearch = false;
      });

      //run the user list through the role select filter to check for any existing filters
      this._getOfficersByRole();
    }
    else {
      //If the user entered text into the officer search box:
      //- Set "search is active" flag
      //- Loop all officers and show/hide the officers according to the search text
      //- While looping, keep track of # of hidden & selected officers for warning message formatting
      //- Format search warning text as necessary

      //- Set "search is active" flag
      this.officerSearchFilterIsActive = true;

      //- Loop all officers and show/hide the officers according to the search text
      var nHiddenAndSelectedOfficers = 0;
      this.userSelectProvider.officers.forEach(officer => {
        var formattedOfficerName = officer.FullName.toLowerCase();
        var formattedOfficerSearchText = this.officerSearchFilterText.toLowerCase();
        //If the officer name DOES NOT contain the search text that officer needs
        //to be hidden in the DOM.
        if (formattedOfficerName.indexOf(formattedOfficerSearchText) === -1) {
          officer.GUIData.IsHiddenBySearch = true;

          //- While looping, keep track of # of hidden & selected officers for warning message formatting
          if (officer.GUIData.IsSelected) {
            nHiddenAndSelectedOfficers++;
          }

        }
        else {
          //The officer name DID contain the search text, unide that officer if necessary
          officer.GUIData.IsHiddenBySearch = false;
        }
      });

      //- Format search warning text as necessary
      if (nHiddenAndSelectedOfficers !== 0) {
        //Some selected officers were hidden by the search text.
        //Show that information in a message that will get display to the user.
        this.officerSearchHasWarning = true;
        if (nHiddenAndSelectedOfficers === 1) {
          this.officerSearchFilterWarningMessage = nHiddenAndSelectedOfficers + ' selected officer is hidden by your search.';
        }
        else {
          this.officerSearchFilterWarningMessage = nHiddenAndSelectedOfficers + ' selected officers are hidden by your search.';
        }

      }
      else {
        //No search warnings to report in this case. Clear relevant flags/data.
        this.officerSearchHasWarning = false;
        this.officerSearchFilterWarningMessage = '';
      }
    }
  }


  /**
   * [_getUsers]: Called to gather a list of [UserInfo] objects from the DB.
   */
  private async _getUsers(): Promise<void> {
    return await new Promise(async (resolve, reject) => {
      this.userSelectProvider.getUsers().subscribe(
      (officers: UserSelectModel.UserInfo[]) => {

        //set model
        //if the [limitToUserIDs] list contains values, inact the filter, otherwise, carry on as normal
        if (this.limitToUserIDs.length > 0) {
          this.userSelectProvider.officers = this._applyLimitUserFilter(officers);
        } else {
          this.userSelectProvider.officers = officers;
        }

        this.userSelectProvider.officers.forEach(officer => {
          //instantiate GUI data
          officer.GUIData = new UserSelectModel.UserInfoGUIData();
        });

        resolve();
      },
      (error) => {
        console.log('userselect-error: ', error);
        reject(error);
      }
    );
    });
    
  }

  /**
   * [_applyAdditionalUserFilter] applies an array filter to remove any users with userIDs that are NOT
   * in the [limitToUserIDs] input parameter
   * @param users 
   */
  private _applyLimitUserFilter(users: UserSelectModel.UserInfo[]) {
    return users.filter(user => !this.limitToUserIDs.indexOf(user.UserID));
  }

  /**
   * [_getRoles]: Called to gather a list of [RoleInfo] objects from the DB.
   */
  private _getRoles() {
    this.userSelectProvider.getRoles().subscribe(
      (roles: UserSelectModel.RoleInfo[]) => {
        //set model
        this.userSelectProvider.roles = roles;

        this.userSelectProvider.roles.forEach(role => {
          //instantiate GUI Data
          role.GUIData = new UserSelectModel.RoleInfoGUIData();
        });

      },
      (error) => {
        console.log('userselect-error: ', error);

      }
    );
  }

  private _preselectOfficers(){
    if(this.preselectUsers && this.preselectUsers.length){
      Array.from(this.userSelectProvider.officers).forEach(officer => {
        Array.from(this.preselectUsers).forEach(user => {
          if(officer.UserID === user.UserID){
            officer.GUIData.IsSelected = true;
          }
        })
      })
    }
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  private async _init(){
    this._officersServerSideSearchCounter = 0;

    this.officerSearchFilterIsActive = false;

    this.officerSearchFilterWarningMessage = "";

    this.selectAllOfficersFlag = false;

    //data gather fxns
    await this._getUsers();
    this._getRoles();
    this._preselectOfficers();
  }
  
  ngOnInit() {
    this._init();
  }

}
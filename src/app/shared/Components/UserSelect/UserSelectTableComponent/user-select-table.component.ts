import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { UserSelectProvider } from '../Providers/userselect.service';
import * as UserSelectModel from '../Providers/userselect.model'
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatSort, Sort } from '@angular/material/sort';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'user-selector-table',
  templateUrl: 'user-select-table.component.html',
  styleUrls: ['user-select-table.component.scss'],
  providers: [UserSelectProvider]
})
export class UserSelectTableComponent implements OnInit, OnChanges {

  //default constructor
  constructor(
    public userSelectProvider: UserSelectProvider,
    private _filterPipe: GenericFilterPipe) {
  }
  ngOnChanges(changes: SimpleChanges): void {

    for (let propName in changes) {  
      
      if (propName === 'isSelectAll' 
      && !changes[propName].firstChange) {

        this.selectAllUsersFlag = !this.isSelectAll;
        console.log("this on change", this.selectAllUsersFlag);
        this.onSelectAllUsersChangeParent()
      }      
    }
  }
  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Input() headerText: string;
  @Input() selectedValues: Array<any>;
  @Input() isSelectAll: boolean;

  @Output() onUsersSelected: EventEmitter<UserSelectModel.UserInfo[]> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public isInitialized: boolean = false;
  public isSearching: boolean = false;

  public users: UserSelectModel.UserInfo[] = [];

  public selectAllUsersFlag: boolean = false;

  public userSearchFilterText: string = "";
  public userSearchFilterIsActive: boolean = false;
  public userSearchFilterWarningMessage: string;

  public userRoles: UserSelectModel.RoleInfo[];
  public selectedRoles: any[] = [];
  public selectedUsers: Array<any>;

  public userTableDataSource: any = [];
  public totalUserCount: number = 0;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) userTablePaginator: MatPaginator;

  public userTableDisplayedColumns: any[] = [
    'FullName',
    'Role',
    'PSID',
    'EmployeeID',
    'SelectUser'
  ];

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /******************************************
  /* PUBLIC METHODS
  /******************************************/

  /**
   * Event triggered by clicking on an individual user row.
   */
  public onUserRowClicked() {
    this._emitSelectedUsers();
  }

  /**
   * [onSelectAllUsersChange] triggers when the 'Select all' checkbox is clicked
   */
  public onSelectAllUsersChange() {
    this._selectAllUsers();
  }
  
  /**
   * [onSelectAllUsersChangeParent] triggers when the 'Select all' checkbox is clicked
   */
  public onSelectAllUsersChangeParent() {
    this.selectAllUsersFlag = !this.selectAllUsersFlag;
    this._selectAllUsers();
  }

  /**
   * [onCategoryFilterChanged] triggers when the 'Category' dropdown is changed
   */
  public onCategoryFilterChanged() {
    this.isSearching = true;

    this._setFilteredRecords();

    this.isSearching = false;
  }

  /**
   * [onSearchFilterChanged] triggers when the 'Search' input is changed
   */
  public onSearchFilterChanged() {
    this.isSearching = true;

    this._setFilteredRecords();

    this.isSearching = false;
  }

  public onSortChange(sort: Sort) {
    const data = this.userTableDataSource.data.slice();

    if (!sort.active || sort.direction === '') {
      this.userTableDataSource.data = data;
      return;
    }

    this.userTableDataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'fullname':
          return this._filterPipe.compare(a.FullName, b.FullName, isAsc);
        case 'rank':
          return this._filterPipe.compare(a.Rank, b.Rank, isAsc);
        case 'psid':
          return this._filterPipe.compare(a.AcadisID, b.AcadisID, isAsc);
        case 'employeeID':
          return this._filterPipe.compare(a.EmployeeID, b.EmployeeID, isAsc);
        
        default:
          return 0;
      }
    });
  }


  /******************************************
  /* PRIVATE METHODS
  /*****************************************/

  /**
   * [_emitSelectedUsers] handles the emission of the currently selected list of users back to the parent component
   */
  private _emitSelectedUsers() {
    this.onUsersSelected.emit(this.userTableDataSource.data.filter(
      user => user.GUIData.IsSelected));
  }

  private _selectAllUsers() {
    //Loop just the users in the [ctrl.users] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllUsersFlag] flag             
    this.userTableDataSource.data.forEach(user => {
      user.GUIData.IsSelected = this.selectAllUsersFlag;
    });

    //emit newly selected list of users
    this._emitSelectedUsers();
  };

  /**
   * [_setFilteredRecords] applies the category and search input filters to the user
   * list table
   */
  private _setFilteredRecords() {

    // filter the base [users] list by category selection
    let usersFilteredByCategory = this._getUsersByCategory();

    // filter the categorized list by the search input data
    this.userTableDataSource.data = this._filterPipe.transform(usersFilteredByCategory, { text: this.userSearchFilterText });
    this.totalUserCount = this.userTableDataSource.data.length;
  }

  /**
   * Checks against each user in the listing to see if any of the selected values match the assigned
   * category values for the users.
   */
  private _getUsersByCategory() {
    //if there are no categories selected, show all users
    if (this.selectedRoles.length != 0) {

      // compare the base [users] data against the selected category list and filter based on that selection
      return this.users.filter(user => this.selectedRoles.indexOf(user.Rank) >= 0);

    } else {
      // return the base unfiltered result set
      return this.users;
    }
  }

  /**
   * [_setPreSelectedUsers] set pre-selected users.
   */
   private _setPreSelectedUsers() {
    this.selectedUsers = this.selectedValues;   
    if(this.selectedUsers != undefined){
      this.userTableDataSource.data.forEach(user => {
        if(this.selectedUsers.find(x => x === user.UserID) != undefined){
          user.GUIData.IsSelected = true;
        }
      });
    }
   
  }

  private async _getPolicyUsers(): Promise<void>{
    return new Promise((resolve, reject) => {
      combineLatest([
        this.userSelectProvider.getUsers(),
        this.userSelectProvider.getRoles(),
      ]).subscribe(
        ([users, roles]) => {
          this.users = users as UserSelectModel.UserInfo[];
          this.userRoles = roles as UserSelectModel.RoleInfo[];
  
          // setup the GUIData object for each user
          this.users.forEach(user => {
            //instantiate GUI data
            user.GUIData = new UserSelectModel.UserInfoGUIData();
          });
  
          // assign the data source
          this.userTableDataSource = new MatTableDataSource(this.users);
  
          // assign the paginator data
          this.userTableDataSource.paginator = this.userTablePaginator;
          this.totalUserCount = this.users.length;
  
          this.isInitialized = true;
          if(this.selectAllUsersFlag){
            this._selectAllUsers()  
          }
          this._setPreSelectedUsers();
          resolve();
        },
        (error) => {
          console.error('userselect-error: ', error);
          reject();
        }
      );
    });
}
  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.isInitialized = false;
    this.selectAllUsersFlag = this.isSelectAll;
    this._getPolicyUsers();
    // this._setDataForPreSelectedUsers();
  }


}

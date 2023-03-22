import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserSelectProvider } from '../../../shared/Components/UserSelect/Providers/userselect.service';
import * as UserSelectModel from '../../../shared/Components/UserSelect/Providers/userselect.model'
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { PoliciesAsessmentInfo, PoliciesInfo } from '../../Providers/policies.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatSort, Sort } from '@angular/material/sort';
import { combineLatest } from 'rxjs';
import { isNullOrUndefined } from 'is-what';
import { AlertDialogComponent, AlertDialogFactory } from '../../../shared/Utilities/AlertDialog/alert-dialog';

@Component({
  selector: 'user-selector-table-dialog',
  templateUrl: 'user-select-table-dialog.html',
  styleUrls: [
    '../../policies.page.scss'
  ],
  providers: [UserSelectProvider]
})
export class UserSelectTableComponent_Dialog implements OnInit {

  //default constructor
  constructor(
    public userSelectProvider: UserSelectProvider,
    private _filterPipe: GenericFilterPipe, 
    private _alertDialogFactory: AlertDialogFactory,
    private _userSelectTableDialog_Factory: PolicyManagement_UserSelectTableDialog_Factory,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any ) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Input() headerText: string;

  @Output() onUsersSelected: EventEmitter<UserSelectModel.UserInfo[]> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public isInitialized: boolean = false;
  public isSearching: boolean = false;

  public users: UserSelectModel.UserInfo[] = [];

  public selectAllUsersFlag: boolean = false;

  public isSelectAllUser: boolean;
  public userSearchFilterText: string = "";
  public userSearchFilterIsActive: boolean = false;
  public userSearchFilterWarningMessage: string;

  public userRoles: UserSelectModel.RoleInfo[];
  public selectedRoles: any[] = [];
  public selectedUser: Array<any>;

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
   * Close Dialog.
   */
 
  public closeDialog(): void {
    this._userSelectTableDialog_Factory.closeDialog(false, this.selectedUser);
  }

  selectAllChecked(event) {
    if ( event.target.checked ) {
        this.isSelectAllUser = true;
    }
    else{
        this.isSelectAllUser = false;
    }
  }

  public sendUserData(){
    return this._dialogData.userInfo;
  }
  
  public assignUser(){
    if(this.selectedUser == null || this.selectedUser.length == 0){
      this._alertDialogFactory.openDialog({
          header: 'Error',
          message: 'Kindly assign users to Policy',
          buttonText: 'OK',
          // [disableClose] - Let user click outside to close.
          disableClose: false
      });
    }
    else{
      this._userSelectTableDialog_Factory.closeDialog(true, this.selectedUser);
    }
  }

  /**
   * [_emitSelectedUsers] handles the emission of the currently selected list of users back to the parent component
   */
  public _emitSelectedUsers(eventData) {
    this.selectedUser = [];  
        eventData.forEach(element => {
            this.selectedUser.push(element.UserID);
        });   
    this.onUsersSelected.emit(this.selectedUser);
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.isInitialized = false;
    this.selectedUser = this._dialogData.userInfo;
    this.isSelectAllUser = this._dialogData.isSelectAll;
    // gather user roles and user list
  }
}

@Injectable()
export class PolicyManagement_UserSelectTableDialog_Factory {
    constructor(
        private matDialog: MatDialog,
    ) { }

    private _matDialogRef: MatDialogRef<UserSelectTableComponent_Dialog>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(userInfo: Array<any>, isSelectAll: boolean)
        : MatDialogRef<UserSelectTableComponent_Dialog> {
            // this.isEdit = true;
        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(userInfo, isSelectAll);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(userInfo, isSelectAll);
        }

        return this._matDialogRef;
    }

    private _openDialog(userInfo: Array<any>, isSelectAll: boolean) {
        this._matDialogRef = this.matDialog.open(UserSelectTableComponent_Dialog, {
            data: {
                userInfo: userInfo,
                isSelectAll: isSelectAll
            },
            width: '1200px',
            autoFocus: false
        });
    }

    public closeDialog(confirmed: boolean, record: Array<any>): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record
        });

        this._matDialogRef = null;
    }
}

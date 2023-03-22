import { Component, Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Author: JTC
 * ----
 * Purpose of this dialog + factory is to help when showing alerts while an angular mat-dialog is
 * already opened. Ionic's alertController dialogs are shown below mat-dialogs. This new service
 * was an option to resolve that issue.
 */

@Component({
  selector: 'alert-dialog',
  templateUrl: 'alert-dialog.html'
})

export class AlertDialogComponent {
  constructor(    
    @Inject(MAT_DIALOG_DATA) public dialogData: AlertDialogConfig) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class AlertDialogFactory {
  constructor(
    private _matDialog: MatDialog
  ) { }

  /**
  * PUBLIC METHODS
  */
  openDialog(config: AlertDialogConfig) {
    this._matDialog.open(AlertDialogComponent, {
      disableClose: config.disableClose,
      data: config
    });
  }
}

export class AlertDialogConfig {
  header: string;
  message: string;
  buttonText: string;
  disableClose: boolean;
}
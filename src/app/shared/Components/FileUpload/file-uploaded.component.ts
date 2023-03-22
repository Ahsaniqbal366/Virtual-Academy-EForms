import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmComponent } from '../Confirm/confirm.component';

@Component({
    selector: 'file-uploaded-component',
    templateUrl: 'file-uploaded.component.html',
    styleUrls: ['file-upload.scss']
})
/**
 * [SkeletonTableComponent] is a quick way to generate a skeletonized table for use as a placeholder
 * when loading in elements/data to a view.
 */
export class FileUploadedComponent implements OnInit {

    //default constructor
    constructor(private _matDialog: MatDialog
    ) {
    }

    /*******************************************
    * COMPONENT INPUT VARIABLES/EVENTS
    *******************************************/
    @Input() uploadedFile: any;
    @Input() disabled: boolean;

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    @Output() removeButtonClickEvent: EventEmitter<number> = new EventEmitter<number>();
    /*******************************************
    * PUBLIC METHODS
    *******************************************/
    public onRemoveButtonClick(event: Event) {
        event.stopImmediatePropagation();
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        dialogConfig.data = {
            body: 'Are you sure you want to remove this upload?',
            title: 'Remove Upload'
        };

        const dialogRef = this._matDialog.open(ConfirmComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((decision: Boolean) => {
            //delete local key(so we can alert again if they cancel)
            localStorage.removeItem("showUpgradeConfirm");
            if (decision) {
                this.removeButtonClickEvent.emit();
            }
        });
    }

    public onFileCardClicked() {
        window.open(this.uploadedFile.filePath, '_blank');
    }
    /*******************************************
    * PRIVATE METHODS
    *******************************************/

    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
    }
}


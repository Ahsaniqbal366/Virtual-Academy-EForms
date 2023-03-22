import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'is-what';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from './LoadingDialog/Loading.Dialog';

@Injectable({
    providedIn: 'root'
})
export class MaterialLoadingService {
    loader: HTMLIonLoadingElement;
    isLoading: boolean;
    loaderPresented: boolean;

    constructor(
        private matDialog: MatDialog
    ) {
    }

    private _matDialogRef: MatDialogRef<LoadingDialogComponent>;

    /**
     * [presentLoading] - Uses Angular MatDialog to show a loading spinner+message.
     * Dev/code is responsible for dismissing when ready.
     */
    public presentLoading(loadingMessage: string = null) {
        if (isNullOrUndefined(this._matDialogRef)) {
            this._matDialogRef = this.matDialog.open(LoadingDialogComponent, {
                data: { loadingMessage: loadingMessage },
                disableClose: true
            });
        }
        else {
            // [_matDialogRef] is already defined, just update it's input data.
            this._matDialogRef.componentInstance.data = {
                loadingMessage: loadingMessage
            };
        }
    }

    /**
     * [dismissLoading] kills the Angular MatDialog.
     */
    public dismissLoading() {
        if (!isNullOrUndefined(this._matDialogRef)) {
            this._matDialogRef.close();
            this._matDialogRef = null;
        }
    }
}

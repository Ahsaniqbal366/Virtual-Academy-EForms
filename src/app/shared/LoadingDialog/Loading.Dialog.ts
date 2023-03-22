import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-loading-dialog',
    templateUrl: './Loading.Dialog.html',
    styleUrls: [],
})
export class LoadingDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any
        ) { }

    ngOnInit() { }
}
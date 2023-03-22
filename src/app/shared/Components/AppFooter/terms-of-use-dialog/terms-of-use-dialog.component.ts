import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-terms-of-use-dialog',
  templateUrl: './terms-of-use-dialog.component.html',
  styleUrls: ['./terms-of-use-dialog.component.scss'],
})
export class TermsOfUseDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TermsOfUseDialogComponent>) { }

  ngOnInit() {}

   //called on cancel click
   closeDialog():void{
    this.dialogRef.close(); 
  }
}

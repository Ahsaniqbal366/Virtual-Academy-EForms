import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss'],
})
export class PrivacyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PrivacyDialogComponent>) { }

  ngOnInit() {}

   //called on cancel click
 closeDialog():void{
  this.dialogRef.close(); 
 }

}

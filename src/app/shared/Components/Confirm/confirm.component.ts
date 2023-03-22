import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef <ConfirmComponent>,  @Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit() {}

  confirm() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }

}

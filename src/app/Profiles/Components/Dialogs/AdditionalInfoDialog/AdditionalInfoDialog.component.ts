import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-additional-info-dialog',
  templateUrl: './VariableTemplates/Default.AdditionalInfoDialog.component.html',
  styleUrls: ['./AdditionalInfoDialog.component.scss'],
})
export class AdditionalInfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AdditionalInfoDialogComponent>,  @Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  public hasOrganizationurl = false;

  ngOnInit() {
    if (typeof this.dialogData.userData.Organizationurl !== 'undefined'
                        && this.dialogData.userData.Organizationurl !== null
                        && this.dialogData.userData.Organizationurl.split(' ').join('') !== ''
                        && this.dialogData.userData.Organizationurl.toLowerCase() !== 'n/a') {
                          this.hasOrganizationurl = true;
                    }
  }

  // Called on cancel click
  closeDialog(): void {
    this.dialogRef.close();
  }

}

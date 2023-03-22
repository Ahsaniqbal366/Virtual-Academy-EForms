import { Component, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { PrivacyDialogComponent } from './privacy-dialog/privacy-dialog.component';
import { TermsOfUseDialogComponent } from './terms-of-use-dialog/terms-of-use-dialog.component';

@Component({
  selector: "app-footer",
  templateUrl: "./app-footer.component.html",
  styleUrls: ["./app-footer.component.scss"],
})
export class AppFooterComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  showPrivacyStatementDialog():void{
    this.dialog.open(PrivacyDialogComponent);
  }

  showTermsOfUseDialog():void{
    this.dialog.open(TermsOfUseDialogComponent);
  }


}

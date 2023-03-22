import { Component, OnInit, Inject, Input } from '@angular/core';
import * as ProfilesModel from '../../Providers/profiles.model';
import { MatDialog } from '@angular/material/dialog';
import { MessageUserDialogComponent } from '../Dialogs/MessageUserDialog/MessageUserDialog.component';
import { AdditionalInfoDialogComponent } from '../Dialogs/AdditionalInfoDialog/AdditionalInfoDialog.component';
import { ProfilesProvider } from '../../Providers/profiles.service';

@Component({
  selector: 'profile-card',
  templateUrl: './ProfileCard.html',
  styleUrls: ['../../profiles.page.scss'],
})
export class ProfileCardComponent implements OnInit {

  constructor(private dialog: MatDialog) {   }

  @Input() public profile: ProfilesModel.SectionUserProfile;
  @Input() public profilesProvider: ProfilesProvider;
  @Input() public showSessionSearch: boolean;

  public openAdditionalInfoDialog(profile) {
    this.dialog.open(AdditionalInfoDialogComponent, {
      data: {userData: profile}
    });
  }


  public openMessageDialog(profile) {
    this.dialog.open(MessageUserDialogComponent, {
      data: {profile, profilesProvider: this.profilesProvider},
      disableClose: true
    });
  }

  ngOnInit() {}
}

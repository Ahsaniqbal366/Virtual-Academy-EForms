import { Component, OnInit, Input, Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as Model from 'src/app/JobTraining/Providers/Model';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';

@Component({
    selector: 'program-user-popover-menu',
    templateUrl: './program-users.popover-menu.component.html',
    styleUrls: []
})

export class ProgramUserPopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() userInfo: Model.ProgramUserInfo;

    /**
     * A local copy of the given [userInfo]'s roles, so we don't break their cached roles 
     * while the user interacts with the role selector in the GUI.
     */
    public popoverRoleIDs: number[];

    // define service provider and route provider when component is constructed
    constructor(
        public jobTrainingService: JobTrainingProvider,
        private popoverController: PopoverController
    ) { }

    ngOnInit() { 
      //Stash our own temporary local copy of [userInfo.RoleIDs]
      this.popoverRoleIDs = this.userInfo.RoleIDs;
    }

    public onUpdateRolesClick() {
      this._dismissPopover({
        selectedOption: 'updateRoles',
        roleIDs: this.popoverRoleIDs
      });
    }

    public onRemoveUserClick() {
      this._dismissPopover({
        selectedOption: 'removeUser'
      });
    }

    public onCloseClick() {
      this._dismissPopover({
        selectedOption: 'close'
      });
    }

    private _dismissPopover(dismissData: any) {
        this.popoverController.dismiss(dismissData);
    }

}

@Injectable()
export class ProgramUserPopoverMenuFactory {
  constructor(
    public popoverController: PopoverController,
    public jobTrainingService: JobTrainingProvider) {
  }

  /**
  * PUBLIC METHODS
  */
  public async openUserPopover(event: Event, userInfo: Model.ProgramUserInfo): Promise<object> {
    const modalData = {};

    const popover = await this.popoverController.create({
      component: ProgramUserPopoverMenuComponent,
      componentProps: {
        userInfo: userInfo
      },
      event,
      translucent: true,
    });

    await popover.present();

    return popover.onDidDismiss();

  }
}
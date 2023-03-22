import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PoliciesInfo } from '../../Providers/policies.model';

@Component({
    selector: 'policies-management-actions-popover-menu',
    templateUrl: './policies-management-table.popover-menu.component.html',
    styleUrls: []
})

export class PoliciesManagementTablePopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() policiesInfo: PoliciesInfo;

    // define service provider and route provider when component is constructed
    constructor(
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}

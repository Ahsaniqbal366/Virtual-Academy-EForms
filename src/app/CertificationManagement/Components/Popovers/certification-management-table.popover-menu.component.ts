import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CertificationInfo } from '../../Providers/certification-management.model';

@Component({
    selector: 'certification-management-actions-popover-menu',
    templateUrl: './certification-management-table.popover-menu.component.html',
    styleUrls: []
})

export class CertificationManagementTablePopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() certificationInfo: CertificationInfo;

    // define service provider and route provider when component is constructed
    constructor(
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}

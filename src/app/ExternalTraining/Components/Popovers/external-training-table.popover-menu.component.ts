import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ExternalCreditCourseInfo } from '../../Providers/external-training.model';

@Component({
    selector: 'external-training-actions-popover-menu',
    templateUrl: './external-training-table.popover-menu.component.html',
    styleUrls: []
})

export class ExternalTrainingTablePopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() externalTrainingInfo: ExternalCreditCourseInfo;

    // define service provider and route provider when component is constructed
    constructor(
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}

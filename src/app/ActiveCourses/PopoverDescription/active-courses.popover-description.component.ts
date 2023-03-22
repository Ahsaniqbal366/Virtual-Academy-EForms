import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'active-courses-popover-description',
    templateUrl: './active-courses.popover-description.component.html',
    styleUrls: []
})

export class ActiveCoursesPopoverDescriptionComponent implements OnInit {
    // Data passed in
    @Input() description: string;

    // define service provider and route provider when component is constructed
    constructor(
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }
}

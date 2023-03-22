import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AnnouncementCommentInfo } from 'src/app/Announcements/Providers/announcements.model';

@Component({
    selector: 'announcement-comment-actions-popover-menu',
    templateUrl: './announcement-comment-actions.popover-menu.component.html',
    styleUrls: []
})

export class AnnouncementCommentActionsPopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() comment: AnnouncementCommentInfo;

    // define service provider and route provider when component is constructed
    constructor(
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}

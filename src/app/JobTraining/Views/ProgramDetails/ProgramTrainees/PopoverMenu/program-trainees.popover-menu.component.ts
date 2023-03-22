import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as Model from 'src/app/JobTraining/Providers/Model';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';

@Component({
    selector: 'program-trainee-popover-menu',
    templateUrl: './program-trainees.popover-menu.component.html',
    styleUrls: []
})

export class ProgramTraineePopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() traineeUserInfo: Model.TraineeUserInfo;

    // define service provider and route provider when component is constructed
    constructor(
        public jobTrainingService: JobTrainingProvider,
        private popoverController: PopoverController
    ) { }

    ngOnInit() {}

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}

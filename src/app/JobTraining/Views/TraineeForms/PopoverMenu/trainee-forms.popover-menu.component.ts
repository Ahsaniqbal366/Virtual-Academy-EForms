import { Component, OnInit, Input, Injectable } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import * as JobTrainingModel from 'src/app/JobTraining/Providers/Model';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { Observable, Subscriber } from 'rxjs';
import { TraineeFormsService } from '../trainee-forms.service';

@Component({
    selector: 'trainee-forms-popover-menu',
    templateUrl: './trainee-forms.popover-menu.component.html',
    styleUrls: []
})

export class TraineeFormsPopoverMenuComponent implements OnInit {
    // Data passed in
    @Input() traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo;

    // define service provider and route provider when component is constructed
    constructor(
        public jobTrainingService: JobTrainingProvider,
        private popoverController: PopoverController
    ) { }

    ngOnInit() { }

    dismissPopover(selectedOption: string) {
        this.popoverController.dismiss(selectedOption);
    }

}


@Injectable()
export class TraineeFormsPopoverMenuFactory {
    // define service provider and route provider when component is constructed
    constructor(
        private alertController: AlertController,
        private toastService: ToastService,
        private loadingService: IonicLoadingService,
        private jobTrainingService: JobTrainingProvider,
        private traineeFormsService: TraineeFormsService,
        private popoverController: PopoverController
    ) { }

    public openPopover(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {        
        const observable = new Observable<string>((subscriber: Subscriber<string>) => {
            this.popoverController.create({
                component: TraineeFormsPopoverMenuComponent,
                componentProps: {
                    traineeFormRecordInfo: traineeFormRecordInfo
                },
                event,
                translucent: true,
            }).then((popover: HTMLIonPopoverElement) => {
                popover.onDidDismiss()
                .then((result) => {
                    const selectedOption = result.data;

                    switch (selectedOption) {
                        case 'removeForm':
                            this._onDeleteForm(traineeFormRecordInfo, subscriber);
                            break;
                        case 'changeFormPhase':
                            this._onUpdateFormPhase(traineeFormRecordInfo, subscriber);
                            break;
                    }
                });

                popover.present();
            });
        });
        return observable;
    }


    /** The change event for the phase dropdown of a form popover */
    private _onUpdateFormPhase(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo, subscriber: Subscriber<string>) {
        this.loadingService.presentLoading('Updating...');
        this.jobTrainingService.UpdateFormPhase(traineeFormRecordInfo).subscribe(
            (result: any) => {
                subscriber.next('onFormPhaseChanged');
                subscriber.complete();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                subscriber.error(error);
                this.loadingService.dismissLoading();
            });
    }

    /** Click event for the delete option on the form row popover */
    private _onDeleteForm(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo, subscriber: Subscriber<string>) {
        this.alertController.create({
            header: 'Are you sure?',
            message: 'Do you really want to delete this record of ' + traineeFormRecordInfo.BasicFormInfo.Name
                + ' from ' + this.traineeFormsService.traineeUserInfo.DisplayName + '?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        // User canceled the delete action. It's not an error, so we resolve w/ no action.
                        subscriber.next('noAction');
                        subscriber.complete();
                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.loadingService.presentLoading('Deleting...');
                        this.jobTrainingService.removeTraineeFormRecord(traineeFormRecordInfo.RecordID).subscribe(
                            (result: any) => {
                                this.toastService.presentToast(traineeFormRecordInfo.BasicFormInfo.Name + ' Deleted');
                                subscriber.next('onFormDeleted');
                                subscriber.complete();
                            },
                            (error) => {
                                console.log('trainingPrograms-error: ', error);
                                subscriber.error(error);
                                this.loadingService.dismissLoading();
                            });
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

}

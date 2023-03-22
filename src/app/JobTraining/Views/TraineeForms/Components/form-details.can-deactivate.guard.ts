import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    CanDeactivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { FormDetailsComponent } from './form-details';
import { AlertController } from '@ionic/angular';

@Injectable()
export class FormDetailsCanDeactivateGuard implements CanDeactivate<FormDetailsComponent> {

    constructor(
        private alertController: AlertController
    ) { }

    canDeactivate(
        formDetailsComponent: FormDetailsComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        /**
         * Confirm an instance of [formDetailsComponent] actually exists.
         * This case may not happen, but it is something that came up often during
         * early development of this guard.
         */
        if (formDetailsComponent) {
            if (formDetailsComponent.traineeFormsService.hasFormOpenInInlineMode) {
                // Allow synchronous navigation (TRUE) if no unsaved changes.
                var hasUnsavedChanges = formDetailsComponent.hasUnsavedChanges();
                if (!hasUnsavedChanges) {
                    return true;
                }
                // Otherwise ask the user with the dialog service and return its
                // observable which resolves to true or false when the user decides
                // JDB 7/10/2020 - Converted this from window.confirm to an Observable using AlertController
                return new Observable<boolean>(subscriber => {
                    this.alertController.create({
                        message: 'Discard changes?',
                        buttons: [
                            {
                                text: 'Cancel',
                                handler: () => {
                                    subscriber.next(false);
                                    subscriber.complete();
                                }
                            }, 
                            {
                                text: 'Discard',
                                handler: () => {
                                    subscriber.next(true);
                                    subscriber.complete();
                                }
                            }
                        ]
                    }).then(alert => alert.present());
                });
            }
            else {
                //Allow synchronous navigation (TRUE) if the "FormDetails" view doesn't appear to be open.
                return true;
            }
        }
        else {
            //Allow synchronous navigation (TRUE) if the "FormDetails" view doesn't appear to be open.
            return true;
        }
    }
}
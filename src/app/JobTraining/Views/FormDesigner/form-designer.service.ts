/**
 * trainee-forms.service.ts is used to aid in communication
 * between the trainee-forms page and some of it's injected sub-components.
 * 
 * Some of the sub-components will need to set flags, etc that affect the parent view a bit.
 * This was a very easy way to have the parent & child share flags as needed.
 * 
 * https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
 */
import { Injectable } from '@angular/core';
import { FullFormInfo } from '../../Providers/Forms.Model';
import { NavController } from '@ionic/angular';

@Injectable()
export class FormDesignerService {
    // define service provider and route provider when component is constructed
    constructor(private navController: NavController) { }

    /**
     * [selectedFormInfo] will be the currently selected form.
     * It's on the shared service because it's data is referenced & updated as child views
     * affect the data.
     */
    public selectedFormInfo: FullFormInfo;

    /**
     * [selectedTabName] defaults to 'settings', will get reset as user navigates around 
     * the form designer.
     */
    public selectedTabName: string = '';

    public setSelectedTabName(name: string){
        if(this.selectedTabName !== name){
            /**
             * Using [setTimeout] because the <ion-segment> component that references the [selectedTabName]
             * variable here doesn't like us changing the value manually.
             * 
             * We change the value manually to keep things in sync across page loads.
             */
            setTimeout(() => {
                this.selectedTabName = name; 
            }, 0);
        }
    }

    public clearSelectedTab() {
        var route = '/jobtraining'
            + '/programdetail/' + this.selectedFormInfo.ProgramID
            + '/forms/' + this.selectedFormInfo.FormID
            + '/none';
        this.navController.navigateRoot(route);
    }
}
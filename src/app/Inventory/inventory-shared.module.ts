// https://angular.io/guide/sharing-ngmodules
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/Shared.Module';



@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        // Components


    ],
    exports: [
        // Components


    ]
})
export class InventorySharedModule {
}

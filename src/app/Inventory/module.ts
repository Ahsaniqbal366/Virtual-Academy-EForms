import { NgModule } from '@angular/core';

import { InventoryPage } from './page';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventorySharedModule } from './inventory-shared.module';

import { InventoryListPage } from './Views/InventoryList/inventory-list';

import { SharedModule } from '../shared/Shared.Module';

import { InventoryProvider } from './Providers/Service';

/**************************************POPOVERS ****************************************/
import { CategoryEditPopoverFactory, CategoryEditPopover } from './Components/PopoverMenus/category-edit-popover';

/**************************************DIALOGS******************************************/
import {EditInventoryFieldDialog} from './Components/Dialogs/edit-inventory-field-dialog';
import {AssignInventoryItemDialog} from './Components/Dialogs/assign-inventory-item-dialog';

// define module
@NgModule({
  imports: [

    SharedModule,
    InventorySharedModule,
    InventoryRoutingModule
  ],
  declarations: [
    // Pages
    InventoryPage,
    InventoryListPage,
    CategoryEditPopover,
    EditInventoryFieldDialog,
    AssignInventoryItemDialog
  ],
  entryComponents: [
  ],
  providers: [            
    InventoryProvider,
    CategoryEditPopoverFactory
  ]
})

// export entire module
export class InventoryPageModule { }

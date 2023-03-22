//leaves-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryPage } from './page';
import { InventoryListPage } from './Views/InventoryList/inventory-list';


// define routes
const routes: Routes = [
  {
    path: '',
    component: InventoryPage,
    children: [
      {
        path: '',
        component: InventoryListPage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }

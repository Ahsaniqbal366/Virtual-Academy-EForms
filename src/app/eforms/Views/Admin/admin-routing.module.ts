import { AdminHomeComponent } from './Components/admin-home/admin-home.component';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard.component';
import { AdminViewFormComponent } from './Components/admin-view-form/admin-view-form.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin-home',
    pathMatch: 'full',
  },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    children: [
      { path: '', component: AdminDashboardComponent},
      { path: 'view', component: AdminViewFormComponent}
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
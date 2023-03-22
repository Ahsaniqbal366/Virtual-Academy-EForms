import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EFormsPage } from './eforms.page';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'admin',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () =>
  //     import(`./Views/Admin/admin.module`).then((m) => m.AdminModule),
  // },

  {
    path: '',
    component: EFormsPage,
    children : [
      {path : "", redirectTo : 'admin', pathMatch : 'full'},
      {
        path: 'admin',
        loadChildren: () =>
        import(`./Views/Admin/admin.module`).then((m) => m.AdminModule),
      }
    ]
    // loadChildren: () =>
    //   import(`./Views/Admin/admin.module`).then((m) => m.AdminModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class EFormsPageRoutingModule {}

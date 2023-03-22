import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { SigninPage } from './signin.page';
import { AuthService } from './providers/auth.service';

// define routes
const routes: Routes = [
  { path: '', component: SigninPage}
];

// define module
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SigninPage],
  providers: [
    AuthService
  ]
})

// export entire module
export class SigninPageModule {}

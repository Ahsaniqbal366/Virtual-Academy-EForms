import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./signin/signin.module').then(m => m.SigninPageModule)
  },
  {
    path: 'jobtraining',
    loadChildren: () => import('./JobTraining/module')
      .then(m => m.JobTrainingPageModule)
  },
  {
    path: 'announcements',
    loadChildren: () => import('./Announcements/announcements.module')
      .then(m => m.AnnouncementsPageModule)
  },
  {
    path: 'activeCourses',
    loadChildren: () => import('./ActiveCourses/active-courses.module')
      .then(m => m.ActiveCoursesPageModule)
  },
  {
    path: 'reporting',
    loadChildren: () => import('./Reporting/reporting.module')
      .then(m => m.ReportingPageModule)
  },
  {
    path: 'externalTraining',
    loadChildren: () => import('./ExternalTraining/external-training.module')
      .then(m => m.ExternalTrainingModule)
  },
  // Profiles
  {
    path: 'profiles/myProfile',
    loadChildren: () => import('./Profiles/profiles.module')
      .then(m => m.ProfilesPageModule)
  },
  {
    path: 'profiles/mainRoster',
    loadChildren: () => import('./Profiles/profiles.module')
      .then(m => m.ProfilesPageModule)
  },
  // Message Center
  {
    path: 'messagecenter',
    loadChildren: () => import('./MessageCenter/message-center.module')
      .then(m => m.MessageCenterPageModule)
  },
  // Inventory
  {
    path: 'inventory',
    loadChildren: () => import('./Inventory/module')
      .then(m => m.InventoryPageModule)
  },
   // Certification Management
   {
    path: 'certificationManagement',
    loadChildren: () => import('./CertificationManagement/certification-management.module')
      .then(m => m.CertificationManagementModule)
  },
   // Policies
   {
    path: 'policies',
    loadChildren: () => import('./Policies/policies.module')
      .then(m => m.PoliciesModule)
  },
  //EForms
  {
    path: 'eforms',
    loadChildren: () => import('./eforms/eforms.module')
      .then(m => m.EFormsPageModule)
  },
  /** Classroom Routes */
  {
    // TODO? change to a 'classroom/' route?
    path: 'profiles/:sectionID/classroomRoster',
    loadChildren: () => import('./Profiles/profiles.module')
      .then(m => m.ProfilesPageModule)
  },
  {
    path: 'classroom/:sectionID/announcements',
    loadChildren: () => import('./Announcements/announcements.module')
      .then(m => m.AnnouncementsPageModule)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // preloadingStrategy: PreloadAllModules,
      // enableTracing: true // <-- [enableTracing: true] is for debugging purposes only.
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

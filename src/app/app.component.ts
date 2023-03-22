import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { DNNEmbedService } from "./shared/DNN.Embed.Service";

import { SwUpdate } from "@angular/service-worker";
import { interval } from "rxjs";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmComponent } from './shared/Components/Confirm/confirm.component';
import { AppUpdateData } from './shared/Utilities/app-update-data';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  /*******************************************
   * PUBLIC VARIABLES
   *******************************************/

  // [showNavMenu] will get set on ngInit. Controls visibility of content in the DOM.
  public showNavMenu: boolean;

  public appPages = [
    {
      title: "Signin",
      url: "/signin",
      icon: "",
    },
    {
      title: "Home",
      url: "/home",
      icon: "home",
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: "",
    },
    {
      title: "Job Training",
      url: "/jobtraining",
      icon: "",
    },
    {
      title: "Active Courses",
      url: "/activeCourses",
      icon: "",
    },
    {
      title: "Reporting",
      url: "/reporting",
      icon: "",
    }
    ,
    {
      title: "External Training",
      url: "/externalTraining",
      icon: "",
    },
    {
      title: 'My Profile',
      url: '/profiles/myProfile',
      icon: '',
    },
    {
      title: 'Classroom Roster',
      url: '/profiles/4064/classroomRoster',
      icon: '',
    },
    {
      title: 'Main Roster',
      url: '/profiles/mainRoster',
      icon: '',
    },
    {
      title: 'Message Center',
      url: '/messagecenter',
      icon: '',
    },
    {
      title: 'Inventory',
      url: '/inventory',
      icon: '',
    },
    {
      title: 'Certification Management',
      url: '/certificationManagement',
      icon: '',
    },
    {
      title: 'Policies',
      url: '/policies',
      icon: '',
    },
    {
      title: "E Forms",
      url: "/eforms",
      icon: "",
    }
  ];

  /*******************************************
   * SELF INIT
   *******************************************/
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dnnEmbedService: DNNEmbedService,
    private swUpdate: SwUpdate,
    private dialog: MatDialog
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.showNavMenu = !this.dnnEmbedService.getConfig().IsEmbedded;
    });
  }
  /*This is how ngsw works
   * https://gist.github.com/angular-academy-devs/866315cdf28790b6181dc05b080076e0#file-06-ts
   * https://blog.angular-university.io/angular-service-worker/
   * The avaiable subscribe can take in an event as listed here https://angular.io/api/service-worker/SwUpdate, so we can add patch notes to show users 
   * when they need to update their system. I'm commenting the confirm and reload for now as it will probably not be good for FTO until it gets a bit more polish
   * Example of the event object can be found at https://angular.io/api/service-worker/UpdateAvailableEvent
   * Patch notes are added to the ngsw-config.json object unde rthe property of appData. 
   */
  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(event => {
        console.log('Update Available:', event.available.appData);
        if (event.available.appData != null) {
          var appData = new AppUpdateData(event.available.appData);
          console.log(appData);
          if (appData.PromptUser) {
            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;

            dialogConfig.data = {
              body: appData.PromptBody,
              title: appData.PromptTitle
            };
            //check local storage to see if showUpgradeConfirm exists, if so we show the confirm, else its already open
            if (Object.keys(localStorage).indexOf("showUpgradeConfirm") < 0) {
              //set local storage key
              localStorage.setItem("showUpgradeConfirm", "true");
              const dialogRef = this.dialog.open(ConfirmComponent, dialogConfig);
              dialogRef.afterClosed().subscribe((decision: Boolean) => {
                //delete local key(so we can alert again if they cancel)
                localStorage.removeItem("showUpgradeConfirm");
                if (decision) {
                  this.swUpdate.activateUpdate().then(() => {
                    document.location.reload();
                  });

                }
              });
            }
          }
        }
      });
      let intvervalMillis = 1000 * 10 * 60; //check every 10 minutes
      interval(intvervalMillis).subscribe(() => {
        console.log('checking for update')
        this.swUpdate.checkForUpdate();
      });
    }
  }
}

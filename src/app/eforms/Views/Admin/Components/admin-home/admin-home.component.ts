import { ActivationStart, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent  implements OnInit {

  @ViewChild(RouterOutlet) outlet: RouterOutlet;
  constructor(private router : Router) { }

  ngOnInit() {  
    debugger;
    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart)
      this.outlet.deactivate();
    });
  }

  // public onRouterOutletActivate(event : any) {
  //   this.outlet.deactivate();
  // }
}

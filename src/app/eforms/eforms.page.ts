import { ActivationStart, Router, RouterOutlet } from '@angular/router';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-eforms',
  templateUrl: './eforms.page.html',
  styleUrls: ['./eforms.page.scss'],
})
export class EFormsPage implements OnInit {

  @ViewChild(RouterOutlet) outlet: RouterOutlet;
  constructor(private router : Router) { }

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart)
      this.outlet.deactivate();
    });
  }
}

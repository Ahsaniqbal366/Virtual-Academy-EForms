/**
 * HOW TO USE
 *
 * 1 - Add "#header" to the <ion-header> you want to auto hide. Ensure it's not setup with an *ngIf="this.Initialized"
 * 2 - Add "scrollEvents="true" appHideHeader [header]="header"" to the <ion-content> that wil be scrolling.
 */
import { Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit {
  // The cut off percent for this effect to prevent glitchy behavior.
  private SCROLL_PERCENTAGE_CUTOFF = 95;

  // The speed (in milliseconds) of the transition
  private SCROLL_TRANSITION_SPEED_MS = 700;

  // The [header] is the <ion-header> passed into the component, can include any number of children
  @Input() header: any;

  // Used to track our previous Y position to determine the scroll direction
  private lastY = 0;

  // To keep the header from being 'jumpy', we won't adjust it during a transition
  private InTransition = false;

  // [isDNNEmbeddedHeader] will get set on ngInit. Controls visibility of content in the DOM.
  public isDNNEmbeddedHeader: boolean;

  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController,
    public dnnEmbedService: DNNEmbedService
  ) { }

  ngOnInit(): void {
    this.isDNNEmbeddedHeader = this.dnnEmbedService.getConfig().IsEmbedded;

    // Set the transition for the change, allows it to look smooth
    this.header = this.header.el;
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.header, 'transition', `margin-top ${this.SCROLL_TRANSITION_SPEED_MS}ms`);
    });
  }

  // Listen for scroll events emitted by <ion-content> where this directive is used
  @HostListener('ionScroll', ['$event']) async onContentScroll($event: any) {
    // We don't wanna have this effect on the embeded app.
    if (!this.isDNNEmbeddedHeader && !this.InTransition) {
      const scrollElement = await $event.target.getScrollElement();

      /**
       * minus clientHeight because trigger is scrollTop, otherwise you hit the bottom
       * of the page before the top screen can get to 80% total document height
       */
      const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
      const currentScrollDepth = $event.detail.scrollTop;

      // use the [SCROLL_PERCENTAGE_CUTOFF] of the screen scrolled before disabling the auto-hide effect.
      const triggerDepth = ((scrollHeight / 100) * this.SCROLL_PERCENTAGE_CUTOFF);

      /**
       * Important, we have to ensure that they're able to scroll back up to reveal the header,
       * so if that won't be possible, don't hide the header.
       */
      if (this.header.clientHeight < triggerDepth) {
        /**
         * Ionic seems to gently adjust the scroll when we reach the bottom. Becasue of
         * this, the auto-hide header goes hay wire and begins an awful flicker.
         *
         * The implemented solution: after the page is fully scrolled, disable this effect.
         *
         * If tweaks need to be made, we can adjust [SCROLL_PERCENTAGE_CUTOFF], it seems
         * best set around 95 so that there's some padding when the page reaches the bottom and Ionic
         * tries to make it smoothly 'bounce' off the bottom.
         */
        if (currentScrollDepth < triggerDepth) {
          // If we're scrolling down, hide the header, otherwise, show it.
          if ($event.detail.scrollTop >= this.lastY) {
            this._hideHeader();
          } else {
            this._showHeader();
          }
        }
      } else {
        // Not enough room to hide the header, failsafe: Show the header
        this._showHeader();
      }
    }
    // Log this Y to be used next time as the previous Y.
    this.lastY = $event.detail.scrollTop;
  }

  /** Anytime the window is resized, show the header as a failsafe. This
   * is basically a native orientation check workaround until that plugin is added
   */
  @HostListener('window:resize', ['$event'])
  onresize($event: any) {
    this._showHeader();
  }

  /**
   * Hide the header by setting it's top margin equal to negative of it's height
   */
  private _hideHeader() {
    if (!this.InTransition) {
      this.InTransition = true;
      this.domCtrl.write(() => {
        this.renderer.setStyle(this.header, 'margin-top', `-${this.header.clientHeight}px`);
      });
      setTimeout(() => {
        this.InTransition = false;
      }, this.SCROLL_TRANSITION_SPEED_MS);
    }
  }

  /**
   * Show the header by resetting the top margin to 0
   */
  private _showHeader() {
    if (!this.InTransition) {
      this.InTransition = true;
      this.domCtrl.write(() => {
        this.renderer.setStyle(this.header, 'margin-top', '0');
      });
      setTimeout(() => {
        this.InTransition = false;
      }, this.SCROLL_TRANSITION_SPEED_MS);
    }
  }
}

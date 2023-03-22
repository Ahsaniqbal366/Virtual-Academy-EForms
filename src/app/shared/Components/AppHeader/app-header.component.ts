import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';

// define component
@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: []
})

/** This component is for the Job Training header with ion back and menu button */
export class AppHeaderComponent implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(public dnnEmbedService: DNNEmbedService) { }

  /*******************************************
  * COMPONENT INPUT VARIABLES
  *******************************************/
  // [defaultHref] - Default back path.
  @Input() defaultHref: string;

  /**
   * [headerText] is the main text shown on the header component.
   * Examples:
   * 'Annoucements'
   * 'Job Training'
   */
  @Input() headerText: string;

  /**
   * [hideBackButton] - Might be set to false to prevent user from being able to navigate back TOO far.
   * One use case is when the ionic app is embedded in the DNN site. The base page of the embedded module
   * might not let the user go all the way back to the "home" page.
   */
  @Input() hideBackButton: boolean;

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/

  /**
   * [backButtonClickOutputEvent]
   * ----
   * See [onBackButtonClick] for more detail.
   */
  @Output() backButtonClickOutputEvent: EventEmitter<any> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  // [isDNNEmbeddedHeader] will get set on ngInit. Controls visibility of content in the DOM.
  public isDNNEmbeddedHeader: boolean;
  // [isDNNFullScreened] boolean will TRY to keep track of the full screen request state. Defaults to false.
  public isDNNFullScreened: boolean;
  // [headerColor] drives color using the ionic color attr in the HTML.
  public headerColor: string;

  /*******************************************
  * PUBLIC METHODS
  *******************************************/

  /**
   * [onBackButtonClick]
   * ----
   * Handles click event for the back button, duh!
   * Emits and event that other components can listen for.
   * Not all back button clicks will change a route.
   */
  public onBackButtonClick(): void {
    this.backButtonClickOutputEvent.emit();
  }

  public onFullScreenButtonClick() {
    /**
     * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
     * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
     * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
     */
    this.dnnEmbedService.tryMessageDNNSite('request-fullscreen-toggle');
    // Flip-flop [isDNNFullScreened] flag;
    this.isDNNFullScreened = !this.isDNNFullScreened;
    this._setHeaderColor();
  }

  /*******************************************
  * PRIVATE METHODS
  *******************************************/
  private _setHeaderColor() {
    if (this.isDNNEmbeddedHeader && !this.isDNNFullScreened) {
      this.headerColor = 'light';
    }
    else {
      this.headerColor = 'dark';
    }

  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.isDNNEmbeddedHeader = this.dnnEmbedService.getConfig().IsEmbedded;
    this._setHeaderColor();
  }

}

import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

// define component
@Component({
  selector: 'app-status-cell',
  templateUrl: 'status-cell.html',
  styleUrls: ['../../page.scss', './status-cell.scss']
})

/** This component is for the Status cell of a row */
export class StatusCellComponent implements OnInit {
  // Define Inputs gere to be passed into the component
  @Input() statusMessage: string;
  @Input() statusHoverMessage: string;
  // This will control the color and icon
  @Input() statusTheme: string;

  // define service provider and route provider when component is constructed
  constructor() { }

  public formattedStatusTheme: string;

  private _setupStatusTheme() {
    switch (this.statusTheme) {
      case 'success':
        this.formattedStatusTheme = 'bootstrap-bg-success';
        break;
      case 'warning':
        this.formattedStatusTheme = 'bootstrap-bg-warning';
        break;
      default:
        this.formattedStatusTheme = this.statusTheme;
        break;
    }
  }

  ngOnInit() {
  }

  // Listen for changes to the @input and reinit if needed.
  ngOnChanges(changes: SimpleChanges) {
    this._setupStatusTheme();
  }

}

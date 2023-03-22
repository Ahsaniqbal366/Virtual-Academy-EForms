import { Component, OnInit, Input } from '@angular/core';

// define component
@Component({
  selector: 'app-trend-cell',
  templateUrl: 'trend-cell.html',
  styleUrls: ['../../page.scss']
})

/** This component is for the Job Training header with ion back and menu button */
export class TrendCellComponent implements OnInit {
  @Input() Trend: number;

  // define service provider and route provider when component is constructed
  constructor() {  }

ngOnInit() {}

}

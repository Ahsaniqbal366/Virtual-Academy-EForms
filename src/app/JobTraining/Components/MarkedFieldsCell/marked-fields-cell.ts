import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// define component
@Component({
  selector: 'app-marked-fields-cell',
  templateUrl: 'marked-fields-cell.html',
  styleUrls: ['../../page.scss']
})

/** This component is for the JobTraining header with ion back and menu button */
export class MarkedFieldsCellComponent implements OnInit {
  @Input() TotalMarkedFields: number;
  @Input() PossibleMarkedFields: number;

  // define service provider and route provider when component is constructed
  constructor() { }

  ngOnInit() {

  }
}

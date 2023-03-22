import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// define component
@Component({
  selector: 'app-score-cell',
  templateUrl: 'score-cell.html',
  styleUrls: ['../../page.scss']
})

/** This component is for the JobTraining header with ion back and menu button */
export class ScoreCellComponent implements OnInit {
  @Input() TotalScore: number;
  @Input() PossibleScore: number;

  // define service provider and route provider when component is constructed
  constructor() { }

  ngOnInit() {
  }
}

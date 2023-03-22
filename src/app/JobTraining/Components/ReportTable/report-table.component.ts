import { Component, OnInit, Input } from '@angular/core';
import * as JT_ReportingModel from 'src/app/JobTraining/Providers/Reports.Model';
import { isNullOrUndefined } from 'is-what';

// define component
@Component({
  selector: 'report-table-component',
  templateUrl: 'report-table.component.html',
  styleUrls: [
    '../../page.scss',
    'report-table.component.scss'
  ]
})

/** This component is for the JobTraining header with ion back and menu button */
export class ReportTableComponent implements OnInit {
  @Input() report: JT_ReportingModel.FormattedReportInfo;

  constructor() { }

  ngOnInit() {
    if (isNullOrUndefined(this.report)) {
      /**
       * One example where [report] might get sent in as null is in the form designer when
       * there is no REAL data to show.
       * We'll just fall back to a new empty object in that case.
       */
      this.report = new JT_ReportingModel.FormattedReportInfo();
    }
  }
}

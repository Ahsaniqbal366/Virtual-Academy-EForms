import { Component, OnInit, Input } from '@angular/core';
import { JobTrainingProvider } from '../../Providers/Service';

// define component
@Component({
  selector: 'archived-program-header-component',
  templateUrl: 'archived-program-header.component.html',
  styleUrls: ['../../page.scss']
})

export class ArchivedProgramHeaderComponent implements OnInit {
  @Input() Trend: number;

  // define service provider and route provider when component is constructed
  constructor(
    public jobTrainingService: JobTrainingProvider,      
  ) {  }

ngOnInit() {}

}

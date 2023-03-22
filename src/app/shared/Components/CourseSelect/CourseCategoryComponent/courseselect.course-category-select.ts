import { Component, OnInit, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { CourseSelectProvider } from '../Providers/courseselect.service';
import * as CourseSelectModel from '../Providers/courseselect.model';

@Component({
  selector: 'course-category-select',
  templateUrl: 'courseselect.course-category-select.html',
 // styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})
export class CourseCategorySelectComponent implements OnInit {

  //default constructor
  constructor(
    public courseSelectProvider: CourseSelectProvider) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Output() onCourseCategorySelected: EventEmitter<CourseSelectModel.CourseInfo[]> = new EventEmitter();

  @Input() config: any;
  @Input() catalogTabs: any[];
  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  onCatalogTabClick(catalogTab) {
    this.onCourseCategorySelected.emit(catalogTab);
  }


  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /****************************************************************************************/
  /* PUBLIC METHODS
  /****************************************************************************************/
  public courseAssemblyStatusFilter() {

  }


  /****************************************************************************************/
  /* PRIVATE METHODS
  /****************************************************************************************/



  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {

  }


}

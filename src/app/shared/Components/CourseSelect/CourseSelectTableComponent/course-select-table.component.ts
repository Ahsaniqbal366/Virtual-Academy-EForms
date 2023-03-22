import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CourseSelectProvider } from '../Providers/courseselect.service';
import * as CourseSelectModel from '../Providers/courseselect.model'
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'course-selector-table',
  templateUrl: 'course-select-table.component.html',
  styleUrls: ['course-select-table.component.scss'],
  providers: [CourseSelectProvider]
})
export class CourseSelectTableComponent implements OnInit {

  //default constructor
  constructor(
    public courseSelectProvider: CourseSelectProvider,
    private _filterPipe: GenericFilterPipe) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Input() headerText: string;
  @Input() courseType: string;


  @Output() onCoursesSelected: EventEmitter<CourseSelectModel.CourseInfo[]> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public isInitialized: boolean = false;
  public isSearching: boolean = false;

  public courses: CourseSelectModel.CourseInfo[] = [];

  public selectAllCoursesFlag: boolean = false;

  public courseSearchFilterText: string = "";
  public courseSearchFilterIsActive: boolean = false;
  public courseSearchFilterWarningMessage: string;

  public courseCategories: CourseSelectModel.CourseCategoryInfo[];
  public selectedCategories: any[] = [];

  public courseTableDataSource: any = [];
  public totalCourseCount: number = 0;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) courseTablePaginator: MatPaginator;

  public courseTableDisplayedColumns: any[] = [
    'CallNumber',
    'CourseName',
    'SME',
    'CourseHours',
    'SelectCourse'
  ];

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /******************************************
  /* PUBLIC METHODS
  /******************************************/

  /**
   * Event triggered by clicking on an individual course row.
   */
  public onCourseRowClicked() {
    this._emitSelectedCourses();
  }

  /**
   * [onSelectAllCoursesChange] triggers when the 'Select all' checkbox is clicked
   */
  public onSelectAllCoursesChange() {
    this.selectAllCoursesFlag = !this.selectAllCoursesFlag;
    this._selectAllCourses();
  }

  /**
   * [onCategoryFilterChanged] triggers when the 'Category' dropdown is changed
   */
  public onCategoryFilterChanged() {
    this.isSearching = true;

    this._setFilteredRecords();

    this.isSearching = false;
  }

  /**
   * [onSearchFilterChanged] triggers when the 'Search' input is changed
   */
  public onSearchFilterChanged() {
    this.isSearching = true;
    
    this._setFilteredRecords();

    this.isSearching = false;
  }

  public onSortChange(sort: Sort) {
    const data = this.courseTableDataSource.data.slice();

    if (!sort.active || sort.direction === '') {
      this.courseTableDataSource.data = data;
        return;
    }

    this.courseTableDataSource.data = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
            case 'callnumber':
                return this._filterPipe.compare(a.CallNo, b.CallNo, isAsc);
            case 'coursename':
                return this._filterPipe.compare(a.CourseName, b.CourseName, isAsc);
            case 'sme':
                return this._filterPipe.compare(a.SME.Name, b.SME.Name, isAsc);
            case 'coursehours':
                return this._filterPipe.compare(a.FormattedCreditHoursText, b.FormattedCreditHoursText, isAsc);
            default:
                return 0;
        }
    });
}


  /******************************************
  /* PRIVATE METHODS
  /*****************************************/

  /**
   * [_emitSelectedCourses] handles the emission of the currently selected list of courses back to the parent component
   */
  private _emitSelectedCourses() {
    this.onCoursesSelected.emit(this.courseTableDataSource.data.filter(
      course => course.GUIData.IsSelected));
  }

  //[onSelectAllCoursesChange] handles the change event of the "Select All" courses checkbox
  private _selectAllCourses() {
    //Loop just the courses in the [ctrl.course] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllCoursesFlag] flag                
    this.courseTableDataSource.data.forEach(course => {
      course.GUIData.IsSelected = this.selectAllCoursesFlag;
    });

    //emit newly selected list of courses
    this._emitSelectedCourses();
  };

  /**
   * [_setFilteredRecords] applies the category and search input filters to the course
   * list table
   */
  private _setFilteredRecords() {

    // filter the base [courses] list by category selection
    let coursesFilteredByCategory = this._getCoursesByCategory();

    // filter the categorized list by the search input data
    this.courseTableDataSource.data = this._filterPipe.transform(coursesFilteredByCategory, { text: this.courseSearchFilterText });
    this.totalCourseCount = this.courseTableDataSource.data.length;
  }

  /**
   * Checks against each course in the listing to see if any of the selected values match the assigned
   * category values for the course.
   */
  private _getCoursesByCategory() {
    //if there are no categories selected, show all courses
    if (this.selectedCategories.length != 0) {

      // compare the base [courses] data against the selected category list and filter based on that selection
      return this.courses.filter(course => course.CourseCategoryIDs.some(category => this.selectedCategories.indexOf(category) >= 0));

    } else {
      // return the base unfiltered result set
      return this.courses;
    }
  }


  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.isInitialized = false;

    this.courseSelectProvider.getCoursesByCourseType(this.courseType).subscribe(
      (data: any) => {
        this.courses = data.courseInfo;

        this.courses.forEach(course => {
          //instantiate GUI data
          course.GUIData = new CourseSelectModel.CourseInfoGUIData();
        });

        this.courseCategories = data.categoryInfo;

        // for the special case of external training, some of the applicable columns
        // would just be empty
        if(this.courseType == "External Training"){
          this.courseTableDisplayedColumns = [
            'CourseName',
            'SelectCourse'
          ];
        }

        this.courseTableDataSource = new MatTableDataSource(this.courses);

        this.courseTableDataSource.paginator = this.courseTablePaginator;
        this.totalCourseCount = this.courses.length;

        this.isInitialized = true;
      },
      (error: APIResponseError) => {
        this.isInitialized = true;
        console.log('courseselect-error: ', error);

      }
    );
  }


}

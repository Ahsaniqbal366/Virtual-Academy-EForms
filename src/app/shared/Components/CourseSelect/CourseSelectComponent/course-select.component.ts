import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CourseSelectProvider } from '../Providers/courseselect.service';
import * as CourseSelectModel from '../Providers/courseselect.model'
import { APIResponseError } from 'src/app/shared/API.Response.Model';

@Component({
  selector: 'course-selector',
  templateUrl: 'course-select.component.html',
  styleUrls: ['course-select.component.scss'],
  providers: [CourseSelectProvider]
})
export class CourseSelectComponent implements OnInit {

  //default constructor
  constructor(
    public courseSelectProvider: CourseSelectProvider) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Input() headerText: string;
  @Input() courseType: string;


  @Output() onCoursesSelected: EventEmitter<number[]> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public courses: CourseSelectModel.CourseInfo[];

  public selectAllCoursesFlag: boolean;

  public courseSearchFilterText: string;
  public courseSearchFilterIsActive: boolean;
  public courseSearchFilterWarningMessage: string;

  public courseCategories: CourseSelectModel.CourseCategoryInfo[];
  public selectedCategories: any[];

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
   * Event trigger when text is entered or removed from the search input.
   */
  public onCourseFilterTextChange() {
    this._filterCoursesBySearchText();
  }

  /**
   * Event trigger when changing the category select filter.
   */
  public onCategorySelectionChanged() {

    this._getCoursesByCategory();

  }

  /**
   * [onSelectAllCoursesChange] triggers when the 'Select all' checkbox is clicked
   */
  public onSelectAllCoursesChange() {
    this._selectAllCourses();
  }

  /******************************************
  /* PRIVATE METHODS
  /*****************************************/
  
  /**
   * [_emitSelectedCourses] handles the emission of the currently selected list of courses back to the parent component
   */
  private _emitSelectedCourses(){
    this.onCoursesSelected.emit(this.courses.filter(
      course => course.GUIData.IsSelected).map(course => course.SNPCourseID));
  }

  //[onSelectAllCoursesChange] handles the change event of the "Select All" courses checkbox in the table header
  private _selectAllCourses () {
    //Loop just the courses in the [ctrl.course] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllCoursesFlag] flag                
    this.courses.forEach(course => {
      course.GUIData.IsSelected = this.selectAllCoursesFlag;
    });

    //As the selected course change, if we know the OFFICER search filter is active we need to recall
    //the course search change event to keep all warning messages & filters correct.
    if (this.courseSearchFilterIsActive) {
      this._filterCoursesBySearchText();
    }

    //emit newly selected list of courses
    this._emitSelectedCourses();
  };

  /**
   * Compares the input of the search box against the list of available courses to filter any unwanted courses from the list.
   */
  private _filterCoursesBySearchText() {

    //if the length of the search box is 0, then disregard any search input values and attempt to show all available
    if (this.courseSearchFilterText.length === 0) {
      //If there is NOT any text in the course search box:
      //- Clear course search flags and messages
      //- Unhide any courses that were hidden by the search

      //- Clear course search flags and messages
      this.courseSearchFilterIsActive = false;
      //this.courseSearchHasWarning = false;
      //this.courseSearchFilterWarningMessage = '';

      //- Unhide any courses that were hidden by the search
      this.courses.forEach(course => {
        course.GUIData.IsHiddenBySearch = false;
      });

      //run the user list through the role select filter to check for any existing filters
      this._getCoursesByCategory();
    }
    else {
      //If the user entered text into the course search box:
      //- Set "search is active" flag
      //- Loop all courses and show/hide the courses according to the search text
      //- While looping, keep track of # of hidden & selected courses for warning message formatting
      //- Format search warning text as necessary

      //- Set "search is active" flag
      this.courseSearchFilterIsActive = true;

      //- Loop all courses and show/hide the courses according to the search text
      var nHiddenAndSelectedCourses = 0;
      this.courses.forEach(course => {
        var formattedCourseName = course.CourseName.toLowerCase();
        var formattedSMEName = course.SME.Name.toLowerCase();

        var formattedSearchText = this.courseSearchFilterText.toLowerCase();
        //If the course name DOES NOT contain the search text that course needs
        //to be hidden in the DOM.
        if (formattedCourseName.indexOf(formattedSearchText) === -1 && formattedSMEName.indexOf(formattedSearchText) === -1) {
          course.GUIData.IsHiddenBySearch = true;

          //- While looping, keep track of # of hidden & selected courses for warning message formatting
          if (course.GUIData.IsSelected) {
            nHiddenAndSelectedCourses++;
          }

        }
        else {
          //The course name DID contain the search text, unide that course if necessary
          course.GUIData.IsHiddenBySearch = false;
        }
      });

      //- Format search warning text as necessary
      if (nHiddenAndSelectedCourses !== 0) {
        //Some selected courses were hidden by the search text.
        //Show that information in a message that will get display to the user.
        //this.courseSearchHasWarning = true;
        //if (nHiddenAndSelectedCourses === 1) {
        //  this.courseSearchFilterWarningMessage = nHiddenAndSelectedCourses + ' selected course is hidden by your search.';
        //}
        //else {
        //  this.courseSearchFilterWarningMessage = nHiddenAndSelectedCourses + ' selected courses are hidden by your search.';
        //}

      }
      else {
        //No search warnings to report in this case. Clear relevant flags/data.
        //this.courseSearchHasWarning = false;
        this.courseSearchFilterWarningMessage = '';
      }
    }
  }

  /**
   * Checks against each course in the listing to see if any of the selected values match the assigned
   * category values for the course.
   */
  private _getCoursesByCategory(){
    //iterate courses
    this.courses.forEach(course => {
      //define matching values tracker
      let matchingValues = 0;

      //if there are no categories selected, show all courses
      if (this.selectedCategories.length != 0) {

        //compare selected categories with the courses category list
        this.selectedCategories.forEach(selectedCategory => {
          if (course.CourseCategoryIDs.indexOf(parseInt(selectedCategory)) > -1) {
            matchingValues++;
          }
        });

        //if any matches were found at all, show the course, otherwise, hide it
        if (matchingValues == 0) {
          course.GUIData.IsHiddenByCategory = true;
        } else {
          course.GUIData.IsHiddenByCategory = false;
        }

      }else{
        //if no categories are selected, show all courses
        course.GUIData.IsHiddenByCategory = false;
      }
    });
  }


  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.courseSelectProvider.getCoursesByCourseType(this.courseType).subscribe(
      (data: any) => {
        this.courses = data.courseInfo;

        this.courses.forEach(course => {
          //instantiate GUI data
          course.GUIData = new CourseSelectModel.CourseInfoGUIData();
        });

        this.courseCategories = data.categoryInfo;
      },
      (error: APIResponseError) => {
        console.log('courseselect-error: ', error);

      }
    );
  }


}

@Component({
  selector: 'general-order-selector',
  templateUrl: 'general-order-select.component.html',
  styleUrls: ['course-select.component.scss'],
  providers: [CourseSelectProvider]
})
export class GeneralOrderSelectComponent implements OnInit {

  //default constructor
  constructor(
    public courseSelectProvider: CourseSelectProvider) {
  }

  /*******************************************
  * COMPONENT INPUT VARIABLES/EVENTS
  *******************************************/
  @Input() headerText: string;
  @Input() courseType: string;
  
  @Output() onCoursesSelected: EventEmitter<CourseSelectModel.GeneralOrderInfo[]> = new EventEmitter();

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/
  public courses: CourseSelectModel.GeneralOrderInfo[];

  public selectAllCoursesFlag: boolean;

  public courseSearchFilterText: string;
  public courseSearchFilterIsActive: boolean;
  public courseSearchFilterWarningMessage: string;

  public selectedCategories: any[];

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
   * Event trigger when text is entered or removed from the search input.
   */
  public onCourseFilterTextChange() {
    this._filterCoursesBySearchText();
  }

  /**
   * [onSelectAllCoursesChange] triggers when the 'Select all' checkbox is clicked
   */
  public onSelectAllCoursesChange() {
    this._selectAllCourses();
  }

  /******************************************
  /* PRIVATE METHODS
  /*****************************************/
  
  /**
   * [_emitSelectedCourses] handles the emission of the currently selected list of courses back to the parent component
   */
  private _emitSelectedCourses(){
    this.onCoursesSelected.emit(this.courses.filter(
      course => course.GUIData.IsSelected));
  }

  //[onSelectAllCoursesChange] handles the change event of the "Select All" courses checkbox in the table header
  private _selectAllCourses () {
    //Loop just the courses in the [ctrl.course] array and flag those
    //as selected/unselected now based on the [ctrl.selectAllCoursesFlag] flag                
    this.courses.forEach(course => {
      course.GUIData.IsSelected = this.selectAllCoursesFlag;
    });

    //As the selected course change, if we know the OFFICER search filter is active we need to recall
    //the course search change event to keep all warning messages & filters correct.
    if (this.courseSearchFilterIsActive) {
      this._filterCoursesBySearchText();
    }

    //emit newly selected list of course
    this._emitSelectedCourses();
  };

  /**
   * Compares the input of the search box against the list of available courses to filter any unwanted courses from the list.
   */
  private _filterCoursesBySearchText() {

    //if the length of the search box is 0, then disregard any search input values and attempt to show all available
    if (this.courseSearchFilterText.length === 0) {
      //If there is NOT any text in the course search box:
      //- Clear course search flags and messages
      //- Unhide any courses that were hidden by the search

      //- Clear course search flags and messages
      this.courseSearchFilterIsActive = false;
      //this.courseSearchHasWarning = false;
      //this.courseSearchFilterWarningMessage = '';

      //- Unhide any courses that were hidden by the search
      this.courses.forEach(course => {
        course.GUIData.IsHiddenBySearch = false;
      });

    }
    else {
      //If the user entered text into the course search box:
      //- Set "search is active" flag
      //- Loop all courses and show/hide the courses according to the search text
      //- While looping, keep track of # of hidden & selected courses for warning message formatting
      //- Format search warning text as necessary

      //- Set "search is active" flag
      this.courseSearchFilterIsActive = true;

      //- Loop all courses and show/hide the courses according to the search text
      var nHiddenAndSelectedCourses = 0;
      this.courses.forEach(course => {
        var formattedCourseName = course.GeneralOrderName.toLowerCase();
        var formattedCourseSearchText = this.courseSearchFilterText.toLowerCase();
        //If the course name DOES NOT contain the search text that course needs
        //to be hidden in the DOM.
        if (formattedCourseName.indexOf(formattedCourseSearchText) === -1) {
          course.GUIData.IsHiddenBySearch = true;

          //- While looping, keep track of # of hidden & selected courses for warning message formatting
          if (course.GUIData.IsSelected) {
            nHiddenAndSelectedCourses++;
          }

        }
        else {
          //The course name DID contain the search text, unide that course if necessary
          course.GUIData.IsHiddenBySearch = false;
        }
      });

      //- Format search warning text as necessary
      if (nHiddenAndSelectedCourses !== 0) {
        //Some selected courses were hidden by the search text.
        //Show that information in a message that will get display to the user.
        //this.courseSearchHasWarning = true;
        //if (nHiddenAndSelectedCourses === 1) {
        //  this.courseSearchFilterWarningMessage = nHiddenAndSelectedCourses + ' selected course is hidden by your search.';
        //}
        //else {
        //  this.courseSearchFilterWarningMessage = nHiddenAndSelectedCourses + ' selected courses are hidden by your search.';
        //}

      }
      else {
        //No search warnings to report in this case. Clear relevant flags/data.
        //this.courseSearchHasWarning = false;
        this.courseSearchFilterWarningMessage = '';
      }
    }
  }

  


  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this.courseSelectProvider.getGeneralOrders().subscribe(
      (data: any) => {
        this.courses = data.generalOrderInfo;

        this.courses.forEach(course => {
          //instantiate GUI data
          course.GUIData = new CourseSelectModel.CourseInfoGUIData();
        });

      },
      (error: APIResponseError) => {
        console.log('courseselect-error: ', error);

      }
    );
  }


}

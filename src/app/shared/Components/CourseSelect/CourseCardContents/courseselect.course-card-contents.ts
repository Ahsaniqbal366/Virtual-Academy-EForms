import { Component, OnInit, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import {CoursePromoVideoDialog} from '../CourseCardContents/Dialogs/CoursePromoVideo/course-promo-video-dialog';
import { CourseSelectProvider } from '../Providers/courseselect.service';
import  * as CourseSelectModel  from '../Providers/courseselect.model';

@Component({
  selector: 'course-card-contents',
  templateUrl: 'courseselect.course-card-contents.html',
  //styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})

export class CourseCardContentsComponent implements OnInit {

  constructor(
    public courseSelectProvider: CourseSelectProvider) {
  }

  @Input() course: any;
  @Input() config: CourseSelectModel.CourseSelectConfig;



  ngOnInit() {
    // Init public properties on ctrl object here.
    this.config.IsRollCallCourse = false;
    this.config.IsStandardCourse = false;
    this.config.PreviewText = "Preview";
    this.config.ShowPreview = false;

    if (this.course.courseType == "RollCall") {
      this.config.IsRollCallCourse = true;
      this.config.PreviewText = 'Review';
    } else {
      this.config.IsStandardCourse = true;
      this.config.PreviewText = 'Preview';
    }

  }
}

/**
 * Component for the description element of the [CourseCardContents] component.
 */
@Component({
  selector: 'course-card-contents-description',
  templateUrl: 'courseselect.course-card-contents-description.html',
 // styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})
export class CourseCardContentsDescriptionComponent implements OnInit {

  //define components to instantiate when this component is constructed
  constructor(
    private popoverController: PopoverController
  ) {
  }

  @Input() course: any;
  @Input() config: CourseSelectModel.CourseSelectConfig;


  /**
   * Button click event for Description tag of the [CourseCardContentsDescription] component.
   * @param event 
   * @param description 
   */
  async onPopoverDescriptionButtonClick(event: Event, description: string) {
    //stop any other event propogation from happening
    event.stopImmediatePropagation();

    //define a description popover component
    const popover = await this.popoverController.create({
      component: CourseSelectPopoverDescriptionComponent,
      componentProps: {
        description
      },
      event
    });

    //display the defined popover component
    return await popover.present();
  }

  ngOnInit() {

  }
}


/**
 * Component for rendering a popover when clicking on the "Description" element of [CourseCardContentsDescription] component
 */
@Component({
  selector: 'course-select-popover-description',
  templateUrl: './Popovers/courseselect.course-card-contents-description.popover.html',
 // styleUrls: ['../courseselect.module.scss']
})

export class CourseSelectPopoverDescriptionComponent implements OnInit {
  // Data passed in
  @Input() description: string;

  // define service provider and route provider when component is constructed
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() { }

  //define what should happen on the dismiss event
  dismissPopover() {
    this.popoverController.dismiss();
  }
}


@Component({
  selector: 'course-card-contents-image',
  templateUrl: 'courseselect.course-card-contents-image.html',
 // styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})
export class CourseCardContentsImageComponent implements OnInit {

  @Input() course: any;
  @Input() config: CourseSelectModel.CourseSelectConfig;

  ngOnInit() {

  }
}

@Component({
  selector: 'course-card-contents-sme',
  templateUrl: 'courseselect.course-card-contents-sme.html',
  //styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})
export class CourseCardContentsSMEComponent implements OnInit {

  @Input() course: any;
  @Input() config: CourseSelectModel.CourseSelectConfig;

  ngOnInit() {
  }
}

@Component({
  selector: 'course-card-contents-preview-button',
  templateUrl: 'courseselect.course-card-contents-preview-button.html',
 // styleUrls: ['../courseselect.module.scss'],
  providers: [CourseSelectProvider]
})
export class CourseCardContentsPreviewButtonComponent implements OnInit {

 // define service provider and route provider when component is constructed
 constructor(
  private modalController: ModalController
) { }

  @Input() course: any;
  @Input() config: CourseSelectModel.CourseSelectConfig;

  /**
   * [onPreviewBtnClick] defines the click event for the "Preview/Review" button
   */
  public onPreviewBtnClick(event){
    this._onPlayPreviewVideoClick(event);
  }

  /**
   * [_onPlayPreviewVideoClick] defines the event for stock courses with promo videos
   */
  private async _onPlayPreviewVideoClick(event) {
    if (this.course.HasPromoVideo) {
        
      const modal = await this.modalController.create({
        backdropDismiss: true,
        component: CoursePromoVideoDialog,
        componentProps: {
          course:this.course,
          event:event
        }
      });
  
      //present the modal control
      return await modal.present();
     
    }
}

  ngOnInit() {

  }
}

/**
 * Pipe intended to handle the rendering of [CourseCardContents] objects.
 * 
 * Filter arguments are as follows:
 * filterText: A simple text match case
 * selectedCategory: A CourseCategoryID matching case
 */
@Pipe({ name: 'filteredCourses' })
export class FilterCoursesPipe implements PipeTransform {
  transform(courses: any[], args: any[]) {

    //parse search filter text from argument list
    let filterText = args[0].filterText;
    //parse selected category from argument list
    let selectedCategories = args[0].selectedCategories;

    //filter and return back the filtered list of courses
    return courses.filter(course =>
      //filter search input
      (typeof filterText == 'undefined' || filterText.length == 0 ? true : course.CourseName.toLowerCase().indexOf(filterText.toLowerCase()) > -1)
      //filter course category
      && (selectedCategories.length != 0 ? this.intersection(selectedCategories, course.CourseCategoryIDs) : true));

  }

  intersection(selectedCategories:any[], courseCategories:any[]){
    return courseCategories.filter(e => selectedCategories.indexOf(e) !== -1).length > 0;
  }
}
import { Component, OnInit, Input, ViewChild, Pipe, Injectable, PipeTransform } from "@angular/core";
import { ModalController, AlertController, IonInput } from "@ionic/angular";
import {
  FileUploadService,
  FileUploadConfig,
} from "src/app/shared/FileUpload.Service";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

import { ReportingProvider } from "../../../Providers/reporting.service";
import * as ReportingModel from "../../../Providers/reporting.model";

import { HttpResponse } from "@angular/common/http";

// define component
@Component({
  selector: "view-course-credit-details-dialog",
  templateUrl: "view-course-credit-details-dialog.html",
  styleUrls: ["../../../reporting.page.scss"],
})
export class ViewCourseCreditDetailsDialog implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController,
    public reportingProvider: ReportingProvider,
    private alertController: AlertController,
    public fileUploadService: FileUploadService
  ) { }

  @Input() LearnerInformation: any;

  public externalTrainingCourses: any;

  public externalTrainingTableDisplayedColumns: string[] = [
    'CourseName',
    'CourseType',
    'CourseHours',
    'StartDate',
    'EndDate',
    'CanAccrue'
  ];
  /**
   * ASYNC: Close this modal, return "new data"* and [confirmed] flag to
   * flag to indicate that the user submitted the dialog, as opposed to cancelled it.
   *
   * "new data"* might not be returned if the user cancelled the action.
   */
  public async dismiss(confirmed) {
    // using the injected ModalController this page can "dismiss" itself and
    // optionally pass back data
    await this.modalCtrl.dismiss({ dismissed: true, confirmed: confirmed });
  }

  /** SELF INIT */

  ngOnInit() {
    this.externalTrainingCourses = this.LearnerInformation.CourseDetails;
  }
}

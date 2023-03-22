import { Component, OnInit, Input, ViewChild, Pipe, Injectable, PipeTransform } from "@angular/core";
import { ModalController, AlertController, IonInput } from "@ionic/angular";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

import { ReportingProvider } from "../../../Providers/reporting.service";
import * as ReportingModel from "../../../Providers/reporting.model";

import { HttpResponse } from "@angular/common/http";
import { FileUploadConfig, FileUploadService } from 'src/app/shared/Components/FileUpload/file-upload.service';

// define component
@Component({
  selector: "course-credit-dialog",
  templateUrl: "course-credit-dialog.html",
  styleUrls: ["../../../reporting.page.scss"],
})
export class CourseCreditDialog implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController,
    public reportingProvider: ReportingProvider,
    private alertController: AlertController,
    private _fileUploadService: FileUploadService
  ) { }

  @Input() LearnerInformation: any;

  //the global override for Number of Hours taken and Completion Date
  public startDate: Date;
  public endDate: Date;
  public completedHours: number;
  public additionalDetails: string;
  public additionalDetailsUpload: string;
  public additionalExternalTrainingTemplateUpload: string;
  public courseName: string;
  public isStateApproved: boolean;

  //the selected course type that will be submitted
  public selectedCourseType: ReportingModel.ExternalCreditCourseType = new ReportingModel.ExternalCreditCourseType();

  //the selected credit type that will be submitted
  public availableCreditTypes: any[];
  public selectedCreditType: ReportingModel.ExternalCreditType = new ReportingModel.ExternalCreditType();

  //the selected users that credit will be assigned to
  public selectedUsers: any[] = [];

  /**
   * This event handles the [UserSelect] component callback when the list of users is changed
   */
  public setUserSelection($event): void {
    this.selectedUsers = $event;
  }

  public isUploadingFile: boolean;

  public onFileUploaded($event): void {
    this.isUploadingFile = true;

    let config = new FileUploadConfig();
    config.relativeAPIRoute = "courses/uploadCourseDescription";

    Array.from($event.target.files).forEach((attachment) => {
      this._fileUploadService
        .asyncSaveFileToCloud(attachment as File, config)
        .then(
          (response: any) => {
            if (response && response.data) {
              this.additionalDetailsUpload = response.data;
            }

            this.isUploadingFile = false;
          },
          (error) => {
            // [hasError] will result in an error state displayed
            this.isUploadingFile = false;
            console.log("error: ", error);
          }
        );
    });
  }

  public isUploadingAdditionalExternalTrainingFile: boolean;

  public onAdditionalExternalTrainingDataUploaded($event): void {
    this.isUploadingAdditionalExternalTrainingFile = true;

    let config = new FileUploadConfig();

    Array.from($event.target.files).forEach((attachment) => {
      this.reportingProvider
        .importExternalTraining(attachment as File, config)
        .then(
          (response: any) => {
            
          },
          (error) => {
            
            console.log("error: ", error);
          }
        );
  });
}

  public getAlternativeSubmissionTemplate() {
    this.reportingProvider.getAlternativeTemplate().subscribe((result: HttpResponse<any>) => {
      this.reportingProvider.generateFileDownload(result, "text/csv");
    });
  }

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

  /**
   * [onConfirm] - The click event for the submit button.
   */
  public onConfirm() {
    this.alertController
      .create({
        header: "Submit External Training",
        message:
          "Are you sure you want to submit this external training record?",
        buttons: [
          {
            text: "No",
            role: "cancel",
          },
          {
            text: "Yes",
            handler: () => {
              if (this._isFormValid()) {
                // Show that the user confirmed submitting the dialog.
                const confirmed = true;
                this.reportingProvider
                  .addExternalCredit(this._buildSubmissionData())
                  .subscribe((result: HttpResponse<any>) => {
                    //dismiss the modal once complete
                    this.dismiss(confirmed);
                  });
              } else {
                this.alertController
                  .create({
                    message:
                      "All fields must be filled and users must be selected.",
                    buttons: [
                      {
                        text: "OK",
                        role: "ok",
                      },
                    ],
                  })
                  .then((alertElement) => {
                    alertElement.present();
                  });
              }
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  /** PRIVATE METHODS */

  /**
   * [_isFormValid] performs simple validation on the credit entry form.
   */
  private _isFormValid() {
    if (
      this.selectedUsers.length > 0 &&
      this.completedHours != null &&
      this.startDate != null &&
      this.endDate != null &&
      this.selectedCreditType.ExternalCreditTypeID != null &&
      this.selectedCourseType.ExternalCreditCourseTypeID != null
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * [_buildTableData] - accepts the user selection data and builds a data set formatted to handle [ExternalCredit] information
   * so that it can be more easily bound and sent to the API.
   */
  private _buildSubmissionData() {
    let tableData = new ReportingModel.ExternalCreditCourse();

    // the default type will be used in the instances that the user just wants to
    // enter a non-accrued external credit they do have the ability to select this
    // manually, but just in case, this default one will be used for when the user
    // does not select one manually
    let defaultCreditTypeID = this.reportingProvider.serverInfo.ExternalCreditTypes.filter(
      (creditType) => creditType.IsDefault
    )[0].ExternalCreditTypeID;

    tableData.Name = this.courseName;
    tableData.CreditTypeID =
      typeof this.selectedCreditType.ExternalCreditTypeID == "undefined"
        ? defaultCreditTypeID
        : this.selectedCreditType.ExternalCreditTypeID;
    tableData.CourseTypeID = this.selectedCourseType.ExternalCreditCourseTypeID;
    tableData.AdditionalDetails = this.additionalDetails;
    tableData.AdditionalDetailsUploadPath = this.additionalDetailsUpload;
    tableData.AlternativeTemplatePath = this.additionalExternalTrainingTemplateUpload;
    tableData.IsStateApproved = this.isStateApproved;
    tableData.CreatedOnDate = new Date();
    tableData.IsDeleted = false;
    tableData.CourseCreditInfo = [];

    this.selectedUsers.forEach((user) => {
      const formattedData = {
        UserID: user.UserID,
        CourseID: 0,
        StartDate: this.startDate,
        EndDate: this.endDate,
        HoursCompleted: this.completedHours,
        IsDeleted: false,
      } as ReportingModel.ExternalCredit;

      tableData.CourseCreditInfo.push(formattedData);
    });

    return tableData;
  }


  /** SELF INIT */

  ngOnInit() {
    this.availableCreditTypes = this.reportingProvider.serverInfo.ExternalCreditTypes.filter(
      (creditType) => !creditType.IsDefault
    );
  }
}

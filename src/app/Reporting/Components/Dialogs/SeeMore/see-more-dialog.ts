import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import { HttpResponse } from '@angular/common/http';
import { LoadingService } from 'src/app/shared/Loading.Service';
import { PDFExportService } from 'src/app/Reporting/Providers/pdf-export.service';
import { MatTableConfig } from 'src/app/Reporting/Providers/reporting.model';
import { Sort, MatSort } from '@angular/material/sort';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';

// define component
@Component({
  selector: 'see-more-dialog',
  templateUrl: 'see-more-dialog.html',
  styleUrls: ['../../../reporting.page.scss']
})

export class SeeMoreDialog implements OnInit {

  // define service provider and route provider when component is constructed
  constructor(
    private _modalCtrl: ModalController,
    private _loadingService: LoadingService,
    private _filterPipe: GenericFilterPipe,
    public reportingProvider: ReportingProvider) {
  }

  @Input() LearnerInformation: any;

  public initialized: boolean;

  //the course table data source and column definitions
  public courseTableDataSource: any = [];
  public totalCourseCount: number = 0;
  @ViewChild(MatSort) courseTableSort: MatSort;
  @ViewChild(MatPaginator) courseTablePaginator: MatPaginator;

  public courseTableConfig = {
    displayedColumns: [
      'CourseName',
      'CourseType',
      'DateOfCompletion',
      'CourseHours',
      'Grade',
      'DownloadCertificate'
    ],
    exportHeader: "Courses for Training Year",
    exportColumnDefinitions: [
      {
        FriendlyName: 'Course',
        TechnicalName: 'courseName',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Type',
        TechnicalName: 'CourseType',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Date of Completion',
        TechnicalName: 'submitDate',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Hours',
        TechnicalName: 'numCredits',
        HideForPrint: false,
        Datatype: 'number'
      },
      {
        FriendlyName: 'Grade',
        TechnicalName: 'studentGrade',
        HideForPrint: false,
        Datatype: 'number'
      }
    ]
  };

  //the roll call table data source and column definitions
  public rollCallTableDataSource: any = [];
  public totalRollCallCount: number = 0;
  @ViewChild(MatSort) rollCallTableSort: MatSort;
  @ViewChild(MatPaginator) rollCallTablePaginator: MatPaginator;

  public rollCallTableConfig = {
    displayedColumns: [
      'RollCallCourseName',
      'HasCompleted',
      'CompletionDate'
    ],
    exportHeader: "Roll Calls for Training Year",
    exportColumnDefinitions: [
      {
        FriendlyName: 'Course',
        TechnicalName: 'CourseName',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Has Completed',
        TechnicalName: 'HasCompleted',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Completion Date',
        TechnicalName: 'SubmitDate',
        HideForPrint: false,
        Datatype: 'string'
      }
    ]
  };

  //the policy table data source and column definitions
  public policyTableDataSource: any = [];
  public totalPolicyCount: any = [];
  @ViewChild(MatSort) policyTableSort: MatSort;
  @ViewChild(MatPaginator) policyTablePaginator: MatPaginator;

  public policyTableConfig = {
    displayedColumns: [
      'CourseName',
      'StartDate',
      'IsComplete'
    ],
    exportHeader: "Policies for Training Year",
    exportColumnDefinitions: [
      {
        FriendlyName: 'Course',
        TechnicalName: 'courseName',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Start Date',
        TechnicalName: 'startDate',
        HideForPrint: false,
        Datatype: 'date-string'
      },
      {
        FriendlyName: 'Is Complete',
        TechnicalName: 'isComplete',
        HideForPrint: false,
        Datatype: 'boolean'
      }
    ]
  };

  //the external training table data source and column definitions
  public externalTrainingTableDataSource: any = [];
  public totalExternalTrainingCount: any = [];
  @ViewChild(MatSort) externalTrainingTableSort: MatSort;
  @ViewChild(MatPaginator) externalTrainingTablePaginator: MatPaginator;

  public externalTrainingTableConfig = {
    displayedColumns: [
      'CourseTitle',
      'ExTrainingCourseHours',
      'ExTrainingGrade',
      'ExTrainingStartDate',
      'ExTrainingSubmitDate',
      'POSTApproved',
      'AdditionalInfo'
    ],
    exportHeader: "External Training for Training Year",
    exportDisplayMode: "landscape",
    exportColumnDefinitions: [
      {
        FriendlyName: 'Course',
        TechnicalName: 'CourseTitle',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Course Hours',
        TechnicalName: 'CourseHours',
        HideForPrint: false,
        Datatype: 'string'
      },
      {
        FriendlyName: 'Grade',
        TechnicalName: 'Grade',
        HideForPrint: false,
        Datatype: 'number'
      },
      {
        FriendlyName: 'Start Date',
        TechnicalName: 'Startdate',
        HideForPrint: false,
        Datatype: 'date-string'
      },
      {
        FriendlyName: 'Submit Date',
        TechnicalName: 'SubmitDate',
        HideForPrint: false,
        Datatype: 'date-string'
      },
      {
        FriendlyName: 'Post Approved?',
        TechnicalName: 'IsStateApproved',
        HideForPrint: false,
        Datatype: 'boolean'
      },
      {
        FriendlyName: 'Additional Info',
        TechnicalName: '',
        HideForPrint: false,
        Datatype: 'string'
      }
    ]
  };

  /**
   * ASYNC: Close this modal, return "new data"* and [confirmed] flag to
   * flag to indicate that the user submitted the dialog, as opposed to cancelled it.
   *
   * "new data"* might not be returned if the user cancelled the action.
   */
  public async dismiss(confirmed) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this._modalCtrl.dismiss({
      dismissed: true,
      confirmed
    });
  }

  /**
   * [onConfirm] - The click event for the submit button.
   */
  public onConfirm() {
    // Show that the user confirmed submitting the dialog.
    const confirmed = true;

    if (confirmed) {

      this.dismiss(confirmed);
    } else {
      this.dismiss(confirmed);
    }

  }

  /**
   * Using the provided course object, export a pdf certificate of course completion.
   * 
   * The sectionID is taken from the [Course].[SectionInfo] object and the learner ID is taken from the dialog's input parameter.
   */
  public generateCertification(course: any) {

    if (course.isComplete) {
      this._loadingService.presentLoading('Generating certificate...');
      //generate a certificate PDF file for the given section/user
      this.reportingProvider.generateCertificate(course.sectionInfo.sectionID, this.LearnerInformation.studentID).subscribe((result: HttpResponse<any>) => {

        //extract filename from HTTPResponse
        const regExpFilename = /filename="(?<filename>.*)"/;
        let filename = regExpFilename.exec(result.headers.get('content-disposition'))?.groups?.filename;

        //create new PDF blob from the HTTPResonse body
        const pdfBlob = new Blob([result.body], { type: "application/pdf" })
        const blobUrl = window.URL.createObjectURL(pdfBlob);

        //setup download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        link.click();
        link.remove();

        //revoke/destroy the blob URL
        URL.revokeObjectURL(blobUrl);

        this._loadingService.dismissLoading();
      },
        (error) => {
          console.log('reporting-error: ', error);
          this._loadingService.dismissLoading();
        });
    }
  }

  /**
   * [printTable] will generate a PDF file using PDFMake based on the given table parameters
   * 
   * @param tableConfig - The defined set of columns to display and the header name preface
   * @param data - The physical table data to be mapped
   */
  public printTable(tableConfig: any, data: any) {
    // use PDFMake to generate a PDF for the visible table data
    let pdfExportService = new PDFExportService();
    pdfExportService.exportMatTableToPDF(tableConfig.exportHeader + "- " + this.LearnerInformation.studentName,
      tableConfig.exportDisplayMode, tableConfig.exportColumnDefinitions, data);
  }

  /**
   * [printCollatedSummary] will generate a collated PDF file using PDFMake based on the provided table data
   */
  public printCollatedSummary() {
    // use PDFMake to generate a PDF for the visible table data
    let pdfExportService = new PDFExportService();

    // define the tables to be appended to the compiled report
    let tableConfigurations: MatTableConfig[] = [
      {
        TableHeader: this.courseTableConfig.exportHeader,
        TableColumns: this.courseTableConfig.exportColumnDefinitions,
        TableData: this.courseTableDataSource
      },
      {
        TableHeader: this.rollCallTableConfig.exportHeader,
        TableColumns: this.rollCallTableConfig.exportColumnDefinitions,
        TableData: this.rollCallTableDataSource
      },
      {
        TableHeader: this.policyTableConfig.exportHeader,
        TableColumns: this.policyTableConfig.exportColumnDefinitions,
        TableData: this.policyTableDataSource
      },
      {
        TableHeader: this.externalTrainingTableConfig.exportHeader,
        TableColumns: this.externalTrainingTableConfig.exportColumnDefinitions,
        TableData: this.externalTrainingTableDataSource
      }
    ];

    // generate the PDF
    pdfExportService.exportMatTableListToPDF("Training Summary for " + this.LearnerInformation.studentName, "landscape", tableConfigurations);
  }

  public generateCSV(tableConfig: any, data: any) {
    // use PDFMake to generate a PDF for the visible table data
    let pdfExportService = new PDFExportService();
    pdfExportService.exportMatTableToCSV(tableConfig.exportHeader + this.LearnerInformation.studentName, tableConfig.exportColumnDefinitions, data);
  }

  /**
     * [reportSortChange] is triggered when any of the mat-table sort headers are clicked
     */
  public reportSortChange(dataSource: any, sort: Sort) {
    const data = dataSource.data.slice();

    if (!sort.active || sort.direction === '') {
      dataSource.data = data;
      return;
    }

    dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'CourseName':
          return this._filterPipe.compare(a.courseName, b.courseName, isAsc);
        case 'CourseTitle':
          return this._filterPipe.compare(a.CourseTitle, b.CourseTitle, isAsc);
        case 'RollCallCourseName':
          return this._filterPipe.compare(a.CourseName, b.CourseName, isAsc);
        case 'DateOfCompletion':
          return this._filterPipe.compare(a.submitDate, b.submitDate, isAsc);
        case 'CompletionDate':
          return this._filterPipe.compare(a.submitDate, b.submitDate, isAsc);
        case 'CourseHours':
          return this._filterPipe.compare(a.numCredits, b.numCredits, isAsc);
        case 'Grade':
          return this._filterPipe.compare(a.studentGrade, b.studentGrade, isAsc);
        case 'HasCompleted':
          return this._filterPipe.compare(a.HasCompleted, b.HasCompleted, isAsc);
        case 'StartDate':
          return this._filterPipe.compare(a.startDate, b.startDate, isAsc);
        case 'SubmitDate':
          return this._filterPipe.compare(a.submitDate, b.submitDate, isAsc);
        case 'EndDate':
          return this._filterPipe.compare(a.EndDate, b.EndDate, isAsc);
        case 'CompletionDate':
          return this._filterPipe.compare(a.CompletionDate, b.CompletionDate, isAsc);
        case 'Completed':
          return this._filterPipe.compare(a.IsComplete, b.IsComplete, isAsc);
        case 'Grade':
          return this._filterPipe.compare(a.Grade, b.Grade, isAsc);
        case 'ExTrainingCourseHours':
          return this._filterPipe.compare(a.CourseHours, b.CourseHours, isAsc);
        case 'ExTrainingGrade':
          return this._filterPipe.compare(a.Grade, b.Grade, isAsc);
        case 'ExTrainingStartDate':
          return this._filterPipe.compare(a.Startdate, b.Startdate, isAsc);
        case 'ExTrainingSubmitDate':
          return this._filterPipe.compare(a.SubmitDate, b.SubmitDate, isAsc);
        case 'POSTApproved':
          return this._filterPipe.compare(a.IsStateApproved, b.IsStateApproved, isAsc);
        default:
          return 0;
      }
    });
  }

  /** PRIVATE METHODS */

  /**
   * [_buildTables] attaches paginators and datasources to the [mat-table] components on the page
   */
  private _buildTables(data: any) {
    this.courseTableDataSource = new MatTableDataSource(data.courses);

    this.courseTableDataSource.paginator = this.courseTablePaginator;
    this.totalCourseCount = data.courses.length;

    this.rollCallTableDataSource = new MatTableDataSource(data.RollCallInfo);

    this.rollCallTableDataSource.paginator = this.rollCallTablePaginator;
    this.totalRollCallCount = data.RollCallInfo.length;

    this.policyTableDataSource = new MatTableDataSource(data.PolicyInfo);

    this.policyTableDataSource.paginator = this.policyTablePaginator;
    this.totalPolicyCount = data.PolicyInfo.length;

    this.externalTrainingTableDataSource = new MatTableDataSource(data.ExternalTrainingInfo);

    this.externalTrainingTableDataSource.paginator = this.externalTrainingTablePaginator;
    this.totalExternalTrainingCount = data.ExternalTrainingInfo.length;

  }



  /** SELF INIT */

  ngOnInit() {
    this.initialized = false;


  }

  ngAfterViewInit() {
    //gather the grades of the selected user
    var selectedYear = this.reportingProvider.selectedCourseYear != "0" ? this.reportingProvider.selectedCourseYear : "0";

    this.reportingProvider.generateStudentGrades(this.LearnerInformation.UserID, selectedYear, "at", selectedYear).subscribe((data: any) => {
      this.LearnerInformation = data;
      this._buildTables(data);

      this.initialized = true;

    });
  }

}

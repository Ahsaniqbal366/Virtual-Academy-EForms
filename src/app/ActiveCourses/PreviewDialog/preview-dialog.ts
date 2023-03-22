import { Component, OnInit, Input, Injectable } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'is-what';


// define component
@Component({
  selector: 'preview-dialog',
  templateUrl: 'preview-dialog.html',
  styleUrls: ['../active-courses.page.scss']
})

export class CoursePreviewDialogPage implements OnInit {
  @Input() videoURL: string;
  @Input() courseName: string;

  // define service provider and route provider when component is constructed
  constructor(
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public alertController: AlertController) {
  }

  ngOnInit() {
  }

  /** ASYNC: CLose this modal, return [selectedForm] and [confirmed], a
   *  flag to indicate that the user confirmed the addition
   */
  async dismiss(traineeFormRecordInfo, confirmed) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this.modalCtrl.dismiss({
      dismissed: true,
      traineeFormRecordInfo,
      confirmed
    });
  }
}

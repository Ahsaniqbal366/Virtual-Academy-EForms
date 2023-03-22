import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageCenterTab, MessageInfo } from '../../Providers/message-center.model';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { event } from 'jquery';
import { ToastService } from 'src/app/shared/Toast.Service';

@Component({
  selector: 'sls-message-table',
  templateUrl: './sls-message-table.html',
})
export class MessageTableComponent implements OnInit {
  constructor(
    public messageCenterProvider: MessageCenterProvider,
    private alertController: AlertController,
    public router: Router,
    public navController: NavController,
    private toastService: ToastService
  ) { }
  
  // Filtering variables
  public filter = {
    searchText: '',
    numberToRender: 25,
    numberToChangeRender: 25,
    sortBy: 'DateCreated',
    sortAscending: false,
    start: 0,
    endOfMessages: false
  };

  // Master Checkbox variables
  public allSelected: boolean;

  public onInfiniteScrollUpTriggered($event) {
    setTimeout(() => {
      if(this.filter.start != 0){
        this.filter.start -= this.filter.numberToChangeRender;
        this.filter.numberToRender -= this.filter.numberToChangeRender;
      }
      if(this.filter.numberToRender >= this.messageCenterProvider.cachedMessages.length){
        this.filter.endOfMessages = true;
      }else{
        this.filter.endOfMessages = false;
      }
      $event.target.complete();
    }, 500);
  }
  
  
  public onInfiniteScrollDownTriggered($event) {
    setTimeout(() => {
      if(this.filter.numberToRender >= 100){
        this.filter.start += this.filter.numberToChangeRender;
        this.filter.numberToRender += this.filter.numberToChangeRender;
      }else{
        this.filter.numberToRender += this.filter.numberToChangeRender;
      }
      if(this.filter.numberToRender >= this.messageCenterProvider.cachedMessages.length){
        this.filter.endOfMessages = true;
      }else{
        this.filter.endOfMessages = false;
      }
      $event.target.complete();
    }, 500);
  }

  public onTableHeaderCellClickSortBy(sortBy: string) {
    this.filter.sortBy = sortBy;
    this.filter.sortAscending = !this.filter.sortAscending;
  }

  public onClearSearchTextClick() {
    this.filter.searchText = '';
  }

  // Checks/Unchecks all items
  public onCheckMaster($event: any) {
    setTimeout(() => {
      this.messageCenterProvider.cachedMessages.forEach(message => {
        message.GUIData.isChecked = this.allSelected;
      });
      this.onCheckMessageClick($event);
    });
  }
  // Handles state of master checkbox
  public onCheckMessageClick($event: Event) {
    // Stop propagation of other events, like the row click event
    $event.stopImmediatePropagation();
    this._updateMasterCheckbox();
  }

  public onCheckMessageChange() {
    this._updateMasterCheckbox();
  }

  private _updateMasterCheckbox() {
    const totalMessages = this.messageCenterProvider.cachedMessages.length;

    let checked = 0;
    this.messageCenterProvider.cachedMessages.filter(message => {
      if (message.GUIData.isChecked) { checked++; }
    });

    if (checked > 0 && checked < totalMessages) {
      // If even one item is checked but not all
      this.messageCenterProvider.masterActions.someSelected = true;
      this.allSelected = false;
      this.messageCenterProvider.masterActions.selectDisabled = false;
    } else if (checked === totalMessages) {
      // If all are checked
      this.allSelected = true;
      this.messageCenterProvider.masterActions.someSelected = false;
      this.messageCenterProvider.masterActions.selectDisabled = false;
    } else {
      // If none is checked
      this.messageCenterProvider.masterActions.someSelected = false;
      this.allSelected = false;
      this.messageCenterProvider.masterActions.selectDisabled = true;
    }
    this.messageCenterProvider.masterActions.numberOfSelected = checked;

  }

  // When a message row is clicked
  public onMessageClick($event: any, message: MessageInfo) {
    // Use the [subView] to know the [selectedTab]
    const subView = this.messageCenterProvider.subView;
    // Update the path with the correct route and [messageID]
    const path = this.router.url.replace(subView, subView + '/messageview/' + message.MessageID);
    // Store the [MessageID] on the provider for the message view to use
    this.messageCenterProvider.messageID = message.MessageID;
    // Navigate
    this.navController.navigateRoot(path);
    if(this.messageCenterProvider.subView != 'sent'){
      this.messageCenterProvider.updateMessageReadStatus($event, message, true);
    }
  }

  private async _Init() {
    this.messageCenterProvider.updateCachedMessages();
    this.messageCenterProvider.masterActions.selectDisabled = true;
    this.messageCenterProvider.masterActions.numberOfSelected = 0;
    this.messageCenterProvider.masterActions.someSelected = false;
    if(this.filter.numberToRender >= this.messageCenterProvider.cachedMessages.length){
      this.filter.endOfMessages = true;
    }
    this.messageCenterProvider.isLoading = false;
  }

  ionViewWillEnter() {
    this._Init();
  }

  ngOnInit() {
    this._Init();
  }
}

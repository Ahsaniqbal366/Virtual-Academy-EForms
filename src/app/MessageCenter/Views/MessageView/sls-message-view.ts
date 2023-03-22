import { Component, OnInit, Input } from '@angular/core';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageCenterTab, MessageInfo } from '../../Providers/message-center.model';
import { AlertController, NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'sls-message-view',
  templateUrl: './sls-message-view.html',
})
export class MessageViewComponent implements OnInit {

  constructor(
    public messageCenterProvider: MessageCenterProvider,
    private alertController: AlertController,
    public router: Router,
    public navController: NavController,
    public datepipe: DatePipe
  ) { }
  @Input() selectedTab: MessageCenterTab;

  public initialized = false;
  public selectedMessage: MessageInfo;

  public getLengthLikeIndex() {
    return this.messageCenterProvider.filteredAndSortedMessages.length - 1;
  }

  public goToNeighboringMessage(message: MessageInfo, direction: number) {
    // Get the index of the current message
    const index = this.messageCenterProvider.filteredAndSortedMessages.indexOf(message);
    // Use it to get the message we're moving to
    this.selectedMessage = this.messageCenterProvider.filteredAndSortedMessages[index + direction];
    // Cache the [messageID] we're moving to
    this.messageCenterProvider.messageID = this.selectedMessage.MessageID;
    // Navigate
    this.navController.navigateRoot(
      '/messagecenter/' + this.messageCenterProvider.subView + '/messageview/' + this.messageCenterProvider.messageID
    );
  }

  // Change view to compose with username and subjectdata
  public onReplyClick() {
    this.messageCenterProvider.replyInfo.isReplying = true;
    this.messageCenterProvider.replyInfo.replySubject = this.selectedMessage.MsgSubject;
    this.messageCenterProvider.replyInfo.replyUser.UserID = this.selectedMessage.SenderID;
    this.messageCenterProvider.replyInfo.replyUser.FullName = this.selectedMessage.DisplayName;
    this.messageCenterProvider.replyInfo.replyUser.Username = this.selectedMessage.UserName;
    this.messageCenterProvider.replyInfo.replyBody = this.selectedMessage.MsgMessage;
    this.messageCenterProvider.replyInfo.replyReceipt = formatDate(this.selectedMessage.DateCreated, 'short', 'en-US');
    this.messageCenterProvider.subView = 'compose';
    this.messageCenterProvider.messageID = -1;
  }

  // Returns to subview
  public onReturnClick() {
    // Navigate
    this.navController.navigateRoot('/messagecenter/' + this.messageCenterProvider.subView);
    this.messageCenterProvider.messageID = -1;
  }

  public onAttachmentClick(path) {
    window.open(path, '_system');
  }
  /*******************************************
  * SELF INIT
  *******************************************/
  // Called from [_init()]
  private _checkForRefresh(): void {
    if (!this.messageCenterProvider.cachedMessages) {
      this.navController.navigateRoot('/messagecenter/inbox');
    }
  }

  // Called from [_init()]
  private _getRouteParams(): void {
    this.messageCenterProvider.messageID = parseInt(this.router.url.split('/').pop(), 10);
  }

  // Called from [_init()]
  private _getSelectedMessage(): void {
    switch (this.messageCenterProvider.subView) {
      case 'inbox':
        this.selectedMessage = this.messageCenterProvider.activeMessages.find(message => {
          return message.MessageID === this.messageCenterProvider.messageID;
        });
        break;
      case 'sent':
        console.log();
        this.selectedMessage = this.messageCenterProvider.sentMessages.find(message => {
          return message.MessageID === this.messageCenterProvider.messageID;
        });
        break;
      case 'trash':
        this.selectedMessage = this.messageCenterProvider.deletedMessages.find(message => {
          return message.MessageID === this.messageCenterProvider.messageID;
        });
        break;
      case 'archive':
        this.selectedMessage = this.messageCenterProvider.archivedMessages.find(message => {
          return message.MessageID === this.messageCenterProvider.messageID;
        });
        break;
    }
    if (this.selectedMessage === undefined) {
      this.navController.navigateBack('/messagecenter');
      this.messageCenterProvider.subView = 'inbox';
    }
  }

  // Called from [_init()], sets, if needed, [messageCenterProvider.signatureInfo]
  private async _checkForAttachments(): Promise<void> {
    // Returning the wait of a promise of an eventual result
    return await new Promise(async (resolve, reject) => {
      if (!this.selectedMessage.SLS_MessageCenterMessagesAttachments.length) {
        this.messageCenterProvider.checkForAttachments(this.selectedMessage.MessageID).subscribe(
          (attachments: any) => {
            this.selectedMessage.SLS_MessageCenterMessagesAttachments = attachments;
            resolve();
          },
          (error) => {
            console.log('error: ', error);
            // Resolve to complete the wait for this method
            reject(error);
          }
        );
      } else {
        // Resolve to complete the wait for this method
        resolve();
      }
    });
  }


  private async _init() {
    this._checkForRefresh();
    this._getRouteParams();
    this._getSelectedMessage();

    await this._checkForAttachments();

    this.initialized = true;
  }

  ngOnInit() {
    this._init();
  }
}

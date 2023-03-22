export class MessageCenterServerInfo {
    public Sections: any[];
    public Groups: any[];
    public Districts: any[];
    public showSectionDropDown: boolean;
    public showToSectionRadioBtn: boolean;
    public showGroupsSelect: boolean;
    public showDistrictsSelect: boolean;
    public showDistrictRow: boolean;
    public showGroupRow: boolean;
    public showAllUsersCheckbox: boolean;
    public showReadReciepts: boolean;
}

export class MessageInfo {
    public DateCreated: any;
    public DisplayName: any;
    public GroupIsReadReceipt: any;
    public GroupMessageID: any;
    public HasAttachement: any;
    public IsArchived: any;
    public IsDeletedRecipient: any;
    public IsDeletedSender: any;
    public IsEradicatedRecipient: any;
    public IsGroupMessage: any;
    public IsReadReceipt: any;
    public MessageID: any;
    public MessageType: any;
    public MsgMessage: any;
    public MsgSubject: any;
    public OriginalMessageID: any;
    public RecipientID: any;
    public RoleID: any;
    public SLS_MessageCenterMessagesAttachments: any;
    public SLS_MessageCenterMessagesGroupMessage: any;
    public SLS_MessageCenterMessagesType: any;
    public SectionID: any;
    public SenderID: any;
    public UpdateDateRecipient: any;
    public UserName: any;
    public GUIData: MessageGUIData;
}

export class MessageGUIData {
    isChecked: boolean;
}

export class MessageToBeSent {
    public Recipients: any[];
    public Section: number;
    public Districts: any[];
    public Groups: any[];
    public Subject: string;
    public Attachments: any[];
    public Message: string;
    public GUIData: MessageToBeSentGUIData;
}

export class MessageToBeSentGUIData {
    recipientType: string;
}

export enum MessageCenterTab {
    Inbox = 'inbox',
    Compose = 'compose',
    Sent = 'sent',
    Trash = 'trash',
    Archive = 'archive'
}

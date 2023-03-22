/******************************* SERVER INFO *************************/
export interface ServerInfo {
    BasicUserInfo: BasicUserInfo;

}

export interface BasicUserInfo {    
    UserID: number;
    DisplayName: string;
}

/******************************* CATEGORY INFO ***********************/
export class InventoryCategoryInfo{
    InventoryCategoryID: number;
    Name: string;
    ParentCategoryID: number;
    CreatedByUserID: number;
    CreatedOn: Date;
    LastModifiedByUserID: number;
    LastModifiedOn: Date;
    IsDeleted: boolean;

    ChildItems: InventoryCategoryInfo[] = [];
    CategoryItems: InventoryItemInfo[] = [];

    GUIData: InventoryCategoryGUIData;

    constructor(){
       this.GUIData = new InventoryCategoryGUIData();
    }

}

export class InventoryCategoryGUIData{
    IsOpen: boolean = false;
    IsSelected: boolean = false;
}

/******************************* ITEM INFO ***********************/
export class InventoryItemInfo{
    InventoryItemID: number;
    Name: string;
    Details: string;
    CreatedByUserID: number;
    CreatedOn: Date;
    LastModifiedByUserID: number;
    LastModifiedOn: Date;
    IsDeleted: boolean;

    FieldInfo: InventoryItemFieldInfo[];

    InventoryItemAssignmentInfo: InventoryItemAssignmentInfo;

    GUIData: InventoryItemGUIData;

    constructor() {
        this.GUIData = new InventoryItemGUIData();
    }
}

export class InventoryItemFieldInfo{
    InventoryItemFieldID: number;
    FieldName: string;
    Value: string;

    constructor(obj:any ={}){
        Object.assign(this,obj);
    }
    
}

export class InventoryItemAssignmentInfo{
    UserID: number;
    AssignedBy: number;
    AssignmentDate: Date;

    constructor(obj:any ={}){
        Object.assign(this,obj);
    }
}

export class InventoryItemGUIData{
    IsSelected: boolean = false;
}



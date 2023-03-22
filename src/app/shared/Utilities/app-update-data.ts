export class AppUpdateData {
    constructor(obj:any = {}){
        Object.assign(this, obj);
    }
    VersionNumber:string = "";
    VersionName: string = "";
    ReleaseDate: string = "";
    PromptUser:boolean = false;
    PromptTitle: string = "A new version of this application is available";
    PromptBody: string = "Would you like to reload the page to get the latest version of this application?";
}

export class APIResponse {
    public requestAuthenticated: boolean;
    public userAccessToken: string;
    public success: boolean;
    public error: APIResponseError;
    public stackTrace: string;
    public data: any;
}

export class APIResponseError {
    public publicResponseMessage: string;
    public info: string;
    public errorCode: string;

    constructor(publicResponseMessage: string, info: string, errorCode: string) {
        this.publicResponseMessage = publicResponseMessage;
        this.info = info;
        this.errorCode = errorCode;
    }
}

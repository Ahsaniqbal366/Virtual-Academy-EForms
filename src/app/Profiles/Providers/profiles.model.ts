export class ProfilesServerInfo {
    public additionalInfoTemplate: any;
    public isFbinaaSite: boolean;
    public passwordRequirementMessage: string;
    public passwordRequirementRegex: string;
    public showOrganizationFields: boolean;
    public showSchool: boolean;
    public showSessionSearch: boolean;
}

class PasswordResponseInfo {
    public message: string;
    public color: any;

    constructor() { }
}

export class ProfilesAuthenticationInfo {
    public currentPassword: string;
    public newPassword: string;
    public confirmPassword: string;
    // the response frmo the server which is displayed as a message to the user if errors
    public passwordResponse: PasswordResponseInfo;

    // Constructor
    constructor() {
        this.passwordResponse = new PasswordResponseInfo();
    }
}

export class SectionUserProfile {
    public LastName: string;
    public FirstName: string;
    public Username: string;
    public PreferredName: string;
    public UserID: number;
    public Name: string;
    public Email: string;
    public Cell: string;
    public Office: string;
    public Session: string;
    public OfficeHours: string;
    public Chapter: string;
    public AdditionalInfo: string;
    public Photopath: string;
    public PasswordExpireDate: string;
    public EmailNotifications: boolean;
    public TextNotifications: boolean;
    public CarrierID: number;
    public DOB: string;
    public Department: string;
    public District: string;
    public HideCellPhone: boolean;
    public AddressLine1: string;
    public AddressLine2: string;
    public AddressCity: string;
    public AddressState: string;
    public AddressZip: string;
    public AddressCounty: string;
    public Race: string;
    public Gender: string;
    public MiddleName: string;
    public Suffix: string;
    public SSN: string;
    public Jobtitle: string;
    public Organizationurl: string;
    public Organizationalinfo: string;
    public Organization: string;

    constructor() { }
}

export class CarrierInfo {
    public name: string;
    public ID: number;
}

export class FormattedReportInfo {
    HeaderMessage: string;
    HeaderRow: FormattedReportRowInfo;
    BodyRows: FormattedReportRowInfo[];

    constructor() {
        this.HeaderRow = new FormattedReportRowInfo(); 
        this.BodyRows = []; 
    }
}

export class FormattedReportRowInfo {
    Cells: FormattedReportCellInfo[];

    constructor() {
        this.Cells = []; 
    }
}

export class FormattedReportCellInfo{
    Text: string;
    CSSClass: string;
    _ColSpan: number;

    constructor() {
        this.Text = ''; 
        this.CSSClass = ''; 
        this._ColSpan = 1; 
    }
}
export class KeywordDictionaryInfo {
    Keyword: string;
    Category: string;
    One: KeywordInfo;
    Many: KeywordInfo;
    Unclear: KeywordInfo;
}

export class KeywordInfo {
    public Lower: string;
    public Title: string;
}

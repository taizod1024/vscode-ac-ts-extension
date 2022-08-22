import { XLanguage } from "./XLanguage";

export interface XSite {
    // prop
    site: string;
    siteurl: string;
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage: string;
    contest: string;
    task: string;
    extension: string;
    language: string;
    xlanguages: XLanguage[];

    // method
    checkLogin(): void;
    initPropAsync(withtask: boolean): void;
    loginSiteAsync(): void;
    getTestAsync(): any;
    submitTaskAsync(): void;
    browseTask(): void;
    getLanguageId(): any;
    loadState(json: any): void;
    saveState(json: any): void;
}

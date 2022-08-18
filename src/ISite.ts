export interface ISite {
    // prop
    name: string;
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage: string;
    contest: string;
    task: string;
    extension: string;

    // method
    isSelected(): boolean;
    checkLogin(): void;
    initPropAsync(withtask: boolean): void;
    loginSiteAsync(): void;
    getTestAsync(): any;
    submitTaskAsync(): void;
    browseTask(): void;
    loadConfig(json: any): void;
    saveConfig(json: any): void;
}

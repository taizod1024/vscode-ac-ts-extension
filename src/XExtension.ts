export interface XExtension {
    // prop
    extension: string;

    // method
    checkLang(): void;
    compileTask(): void;
    testTask(): any;
    debugTask(): any;
}

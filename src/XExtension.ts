export interface XExtension {
    // prop
    extension: string;
    language: string;

    // method
    initProp(): void;
    initTask(): void;
    compileTask(): void;
    testTask(): any;
    debugTask(): any;
    submitTask(): void;
}

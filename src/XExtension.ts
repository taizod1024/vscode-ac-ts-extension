export interface XExtension {
    // prop
    extension: string;

    // method
    isSelected(): boolean;
    checkLang(): void;
    compileTask(): void;
    testTask(): any;
    debugTask(): any;
}

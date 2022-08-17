export interface XExtension {
    // prop
    name: string;
    extension: string;

    // method
    isSelected(): boolean;
    checkLang(): void;
    compileTask(): void;
    testTask(): any;
    debugTask(): any;
}

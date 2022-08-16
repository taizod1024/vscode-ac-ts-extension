export interface Lang {
    // prop
    name: string;
    extension: string;

    // method
    isSelected(): boolean;
    checkLang(): void;
    testLang(debug: boolean): any;
}

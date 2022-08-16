// python / typescript / javascript

export interface BaseLang {
    // prop
    name: string;
    extension: string;

    // method
    isSelected(): boolean;
    checkLang(): void;
    testLang(debug: boolean): any;
}

import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Cpp implements XExtension {
    // implements

    // prop
    public readonly extension = ".cpp";
    public readonly language = "c++";

    // method
    public initProp(): void {
        xexthelper.checkLang(this.language);
    }

    public initTask(): void {}

    public compileTask(): void {
        xexthelper.compileTask(this.language);
    }

    public debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    public testTask(): any {
        return xexthelper.testTask(this.language);
    }

    public submitTask(): void {}
}
export const cpp = new Cpp();

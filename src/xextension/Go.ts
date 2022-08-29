import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Go implements XExtension {
    // implements

    // prop
    public readonly extension = ".go";
    public readonly language = "go";

    // method
    public checkLang(): void {
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
export const go = new Go();

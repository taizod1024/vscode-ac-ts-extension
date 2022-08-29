import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Rust implements XExtension {
    // implements

    // prop
    public readonly extension = ".rs";
    public readonly language = "rust";

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
export const rust = new Rust();

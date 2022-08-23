import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Cc implements XExtension {
    // implements

    // prop
    extension = ".c";
    language = "c";

    // method
    checkLang(): void {
        xexthelper.checkLang(this.language);
    }

    initTask(): void {}

    compileTask(): void {
        xexthelper.compileTask(this.language);
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        return xexthelper.testTask(this.language);
    }

    submitTask(): void {}
}
export const cc = new Cc();

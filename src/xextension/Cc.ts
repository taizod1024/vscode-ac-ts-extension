import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Cc implements XExtension {
    // implements

    // prop
    extension = ".c";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    checkLang(): void {
        xexthelper.checkLang("cChecker");
    }

    compileTask(): void {
        xexthelper.compileTask("cCompiler", "cExecutor");
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        return xexthelper.testTask("cExecutor");
    }
}
export const cc = new Cc();

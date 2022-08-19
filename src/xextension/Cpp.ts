import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Cpp implements XExtension {
    // implements

    // prop
    extension = ".cpp";

    // method
    checkLang(): void {
        xexthelper.checkLang("c++Checker");
    }

    compileTask(): void {
        xexthelper.compileTask("c++Compiler", "c++Executor");
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        return xexthelper.testTask("c++Executor");
    }
}
export const cpp = new Cpp();

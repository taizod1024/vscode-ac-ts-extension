import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class User1 implements XExtension {
    // implements

    // prop
    get extension() {
        if (!acts) {
            return ".user1";
        }
        const config = vscode.workspace.getConfiguration(`${acts.appcfgkey}.${this.language}`);
        const extension = config.extension;
        return extension;
    }
    language = "user1";

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
export const user1 = new User1();

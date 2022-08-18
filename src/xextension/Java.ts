import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Java implements XExtension {
    // implements

    // prop
    extension = ".java";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    checkLang(): void {
        xexthelper.checkLang("javaChecker");
    }

    compileTask(): void {
        // modify taskfile and execfile
        const taskfile = acts.taskfile;
        const tmptaskfile = `${process.env.TEMP}\\${acts.appid}\\Main.java`;
        fs.copyFileSync(taskfile, tmptaskfile);
        acts.taskfile = tmptaskfile;
        acts.tmpexecfile = `${process.env.TEMP}\\${acts.appid}\\Main.class`;

        try {
            xexthelper.compileTask("javaCompiler", "javaExecutor");
        } catch (ex) {
            // rewrite taskfile and execfile
            if (ex instanceof String) {
                const err = ex.split(tmptaskfile).join(taskfile);
                throw err;
            }
            throw ex;
        }
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        return xexthelper.testTask("javaExecutor");
    }
}
export const java = new Java();

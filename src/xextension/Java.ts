import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import * as path from "path";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Java implements XExtension {
    // implements

    // prop
    extension = ".java";
    language = "java";

    // method
    checkLang(): void {
        xexthelper.checkLang(this.language);
    }

    initTask(): void {
        // rewrite class name to task name
        let text = fs.readFileSync(acts.taskfile).toString();
        text = text.replace(new RegExp("class template", "g"), `class ${acts.xsite.task}`);
        fs.writeFileSync(acts.taskfile, text);
    }

    compileTask(): void {
        acts.execfile = acts.taskfile.replace(".java", ".class");
        xexthelper.compileTask(this.language);
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        return xexthelper.testTask(this.language);
    }

    submitTask(): void {
        // replace and rewrite taskfile
        const tmptaskfile = path.normalize(`${acts.tmppath}/Main.java`);
        let text = fs.readFileSync(acts.taskfile).toString();
        text = text.replace(new RegExp(`class ${acts.xsite.task}`, "g"), "class Main");
        fs.writeFileSync(tmptaskfile, text);
        acts.taskfile = tmptaskfile;
    }
}
export const java = new Java();

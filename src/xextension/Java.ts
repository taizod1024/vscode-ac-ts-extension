import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Java implements XExtension {
  // implements

  // prop
  public readonly extension = ".java";
  public readonly language = "java";

  // method
  public initProp(): void {
    acts.execfile = acts.taskfile.replace(".java", ".class");
    xexthelper.checkLang(this.language);
  }

  public initTask(): void {
    // rewrite class name to task name
    let text = fs.readFileSync(acts.taskfile).toString();
    text = text.replace(new RegExp("class template", "g"), `class ${acts.xsite.task}`);
    fs.writeFileSync(acts.taskfile, text);
  }

  public compileTask(): void {
    xexthelper.compileTask(this.language);
  }

  public debugTask(): any {
    if (acts.islinux) {
      throw "ERROR: debug is not supported in linux";
    }
    const debugconfig = {
      type: "java",
      name: acts.appid,
      request: "launch",
      mainClass: acts.taskfile,
      args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
      console: "integratedTerminal",
    };
    vscode.debug.startDebugging(acts.projectfolder, debugconfig);
  }

  public testTask(): any {
    return xexthelper.testTask(this.language);
  }

  public submitTask(): void {
    // replace and rewrite taskfile
    const tmptaskfile = path.normalize(`${acts.tmppath}/Main.java`);
    let text = fs.readFileSync(acts.taskfile).toString();
    text = text.replace(new RegExp(`class ${acts.xsite.task}`, "g"), "class Main");
    fs.writeFileSync(tmptaskfile, text);
    acts.taskfile = tmptaskfile;
  }
}
export const java = new Java();

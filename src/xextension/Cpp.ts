import * as vscode from "vscode";
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
    if (acts.islinux) {
      throw "ERROR: debug is not supported on linux";
    }
    const debugconfig = {
      name: acts.appid,
      type: "cppdbg",
      request: "launch",
      program: acts.execfile,
      cwd: acts.taskpath,
      args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
      console: "integratedTerminal",
    };
    vscode.debug.startDebugging(acts.projectfolder, debugconfig);
  }

  public testTask(): any {
    return xexthelper.testTask(this.language);
  }

  public submitTask(): void {}
}
export const cpp = new Cpp();

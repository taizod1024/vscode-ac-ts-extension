import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Cc implements XExtension {
  // implements

  // prop
  public readonly extension = ".c";
  public readonly language = "c";

  // method
  public initProp(): void {
    xexthelper.checkLang(this.language);
  }

  public initTask(): void {}

  public compileTask(): void {
    xexthelper.compileTask(this.language);
  }

  public debugTask(): any {
    const debugconfig = {
      name: acts.appid,
      type: "cppdbg",
      request: "launch",
      program: acts.execfile,
      cwd: acts.taskpath,
      args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile],
      console: "integratedTerminal",
    };
    vscode.debug.startDebugging(acts.projectfolder, debugconfig);
  }

  public testTask(): any {
    return xexthelper.testTask(this.language);
  }

  public submitTask(): void {}
}
export const cc = new Cc();

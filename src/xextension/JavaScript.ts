import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class JavaScript implements XExtension {
  // implemente

  // prop
  public readonly extension = ".js";
  public readonly language = "javascript";

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
      type: "pwa-node",
      request: "launch",
      program: acts.taskfile,
      args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile],
      console: "integratedTerminal",
      skipFiles: ["node_modules/**"],
    };
    vscode.debug.startDebugging(acts.projectfolder, debugconfig);
  }

  public testTask(): any {
    return xexthelper.testTask(this.language);
  }

  public submitTask(): void {}
}
export const javascript = new JavaScript();

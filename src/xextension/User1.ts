import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class User1 implements XExtension {
  // implements

  // prop
  public get extension() {
    if (!acts) {
      return ".user1";
    }
    const config = vscode.workspace.getConfiguration(`${acts.appcfgkey}.${this.language}`);
    const extension = config.extension;
    return extension;
  }
  public readonly language = "user1";

  // method
  public initProp(): void {
    xexthelper.checkLang(this.language);
  }

  public initTask(): void {}

  public compileTask(): void {
    xexthelper.compileTask(this.language);
  }

  public debugTask(): any {
    throw `ERROR: debug is not supported in ${this.language}`;
  }

  public testTask(): any {
    return xexthelper.testTask(this.language);
  }

  public submitTask(): void {}
}
export const user1 = new User1();

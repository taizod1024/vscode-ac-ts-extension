import { acts } from "../AcTsExtension";
import { XSite } from "../XSite";
import { cc } from "../xextension/Cc";
import { cpp } from "../xextension/Cpp";
import { java } from "../xextension/Java";
import { python } from "../xextension/Python";
import { go } from "../xextension/Go";
import { javascript } from "../xextension/JavaScript";
import { typescript } from "../xextension/TypeScript";
import { user1 } from "../xextension/User1";

class Local implements XSite {
  // implements

  // prop
  public readonly site = "local";
  public readonly siteurl = "";
  public readonly contestregexp = /^(.+)$/;
  public readonly contestmessage = "input contest [e.g.: local01, local02]";
  public readonly taskregexp = /^(.+)_(.+)$/;
  public readonly taskmessage = "input task [e.g.: local01_a, local01_b]";
  public readonly xlanguages = [
    { id: 1, language: "C", xextension: cc },
    { id: 2, language: "C++", xextension: cpp },
    { id: 3, language: "Java", xextension: java },
    { id: 4, language: "Python", xextension: python },
    { id: 5, language: "JavaScript", xextension: javascript },
    { id: 6, language: "TypeScript", xextension: typescript },
    { id: 8, language: "Go", xextension: go },
    { id: 9, language: "User1", xextension: user1 },
  ];
  public get xextension() {
    const xlanguage = this.xlanguages.find(val => val.xextension.extension === this.extension);
    if (!xlanguage) {
      throw `ERROR: no such extension, extension=${this.extension}`;
    }
    return xlanguage.xextension;
  }
  public contest = "";
  public task = "";
  public extension = "";
  public language = "";

  // method
  // eslint-disable-next-line no-unused-vars
  public async initPropAsync(_withtask: boolean) {}

  public checkLogin() {}

  public async loginSiteAsync() {
    throw "ERROR: unable to login at local";
  }

  public async getTestAsync() {
    let text = "stdin" + acts.separator + "stdout" + acts.separator;
    return text;
  }

  public async submitTaskAsync() {
    throw "ERROR: unable to submit at local";
  }

  public browseTask() {
    throw "ERROR: unable to browse at local";
  }

  public getLanguageId(): string {
    return "";
  }

  public loadState(json: any) {
    local.contest = json.local?.contest;
    local.task = json.local?.task;
    local.extension = json.local?.extension;
    local.language = json.local?.language;
  }

  public saveState(json: any) {
    json.local = {};
    json.local.contest = local.contest;
    json.local.task = local.task;
    json.local.extension = local.extension;
    json.local.language = local.language;
  }

  public async loadStateAsync() {
    local.contest = await acts.context.secrets.get("local.contest");
    local.task = await acts.context.secrets.get("local.task");
    local.extension = await acts.context.secrets.get("local.extension");
    local.language = await acts.context.secrets.get("local.language");
  }

  public async saveStateAsync() {
    await acts.context.secrets.store("yukicoder.contest", local.contest);
    await acts.context.secrets.store("yukicoder.task", local.task);
    await acts.context.secrets.store("yukicoder.extension", local.extension);
    await acts.context.secrets.store("yukicoder.language", local.language);
  }

  public async deleteStateAsync() {
    await acts.context.secrets.delete("yukicoder.contest");
    await acts.context.secrets.delete("yukicoder.task");
    await acts.context.secrets.delete("yukicoder.extension");
    await acts.context.secrets.delete("yukicoder.language");
  }
}
export const local = new Local();

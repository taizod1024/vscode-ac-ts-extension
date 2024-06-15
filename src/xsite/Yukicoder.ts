import * as vscode from "vscode";
import * as fs from "fs";
import superagent from "superagent";
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

class Yukicoder implements XSite {
  // param
  public apikey: string;
  public problemid: string;

  // prop
  public problemnourl: string;
  public api_problemnourl: string;
  public api_problemidurl: string;
  public api_submiturl: string;
  public submissionsurl: string;

  // implements

  // prop
  public readonly site = "yukicoder";
  public readonly siteurl = "https://yukicoder.me/";
  public readonly contestregexp = /^[0-9]+$/;
  public readonly contestmessage = "input contestid from url [e.g.: 314, 315]";
  public readonly taskregexp = /^[0-9]+$/;
  public readonly taskmessage = "input problemno from url [e.g.: 1680, 1681]";
  public readonly xlanguages = [
    { id: "cpp14", language: "C++14 (gcc 11.2.0 + boost 1.78.0)", xextension: cpp },
    { id: "cpp17", language: "C++17 (gcc 11.2.0 + boost 1.78.0)", xextension: cpp },
    { id: "cpp-clang", language: "C++17(clang Beta) (clang 10.0.0 + boost 1.78.0)", xextension: cpp },
    { id: "cpp23", language: "C++23(draft) (gcc 11.2.0 + boost 1.78.0)", xextension: cpp },
    { id: "cpp", language: "C++11 (gcc 8.5.0)", xextension: cpp },
    { id: "c11", language: "C (gcc 11.2.0)", xextension: cc },
    { id: "c", language: "C90 (gcc 8.5.0)", xextension: cc },
    { id: "java8", language: "Java17 (openjdk 17.0.1)", xextension: java },
    { id: "csharp", language: "C# (csc 3.9.0)", xextension: user1 },
    { id: "csharp_mono", language: "C#(mono) (mono 6.12.0.158)", xextension: user1 },
    { id: "csharp_dotnet", language: "C#(.NET 6 Beta) (.NET 6.12.0)", xextension: user1 },
    { id: "perl", language: "Perl (5.26.3)", xextension: user1 },
    { id: "raku", language: "Raku (rakudo v2021.12-89-g196969167)", xextension: user1 },
    { id: "php", language: "PHP (7.2.24)", xextension: user1 },
    { id: "php7", language: "PHP8 (8.1.3)", xextension: user1 },
    { id: "python3", language: "Python3 (3.10.1 + numpy 1.22.3 + scipy 1.8.0)", xextension: python },
    { id: "pypy2", language: "PyPy2 (7.3.8)", xextension: python },
    { id: "pypy3", language: "PyPy3 (7.3.8)", xextension: python },
    { id: "ruby", language: "Ruby (3.1.1p18 )", xextension: user1 },
    { id: "d", language: "D (dmd 2.099.1)", xextension: user1 },
    { id: "go", language: "Go (1.18)", xextension: go },
    { id: "haskell", language: "Haskell (9.2.2)", xextension: user1 },
    { id: "scala", language: "Scala(Beta) (3.1.1)", xextension: user1 },
    { id: "nim", language: "Nim (1.6.4)", xextension: user1 },
    { id: "rust", language: "Rust (1.59.0)", xextension: user1 },
    { id: "kotlin", language: "Kotlin (1.6.10)", xextension: user1 },
    { id: "scheme", language: "Scheme (Gauche-0.9.11-p1)", xextension: user1 },
    { id: "crystal", language: "Crystal (1.3.2)", xextension: user1 },
    { id: "swift", language: "Swift (5.4.2)", xextension: user1 },
    { id: "ocaml", language: "OCaml (4.13.1)", xextension: user1 },
    { id: "clojure", language: "Clojure(Beta) (1.10.2.790)", xextension: user1 },
    { id: "fsharp", language: "F# (5.0)", xextension: user1 },
    { id: "elixir", language: "Elixir (1.7.4)", xextension: user1 },
    { id: "lua", language: "Lua (LuaJit 2.0.5)", xextension: user1 },
    { id: "fortran", language: "Fortran (gFortran 8.4.1)", xextension: user1 },
    { id: "node", language: "JavaScript (node v17.7.1)", xextension: javascript },
    { id: "typescript", language: "TypeScript (4.6.2)", xextension: typescript },
    { id: "lisp", language: "Common Lisp (sbcl 2.1.6)", xextension: user1 },
    { id: "sml", language: "Standard ML (MLton 20180207-6)", xextension: user1 },
    { id: "kuin", language: "Kuin (KuinC++ v.2021.9.17)", xextension: user1 },
    { id: "vim", language: "Vim script (v8.2)", xextension: user1 },
    { id: "sh", language: "Bash (Bash 4.4.19)", xextension: user1 },
    { id: "nasm", language: "Assembler (nasm 2.15.03)", xextension: user1 },
    { id: "clay", language: "cLay (20220312-1)", xextension: user1 },
    { id: "bf", language: "Brainfuck (BFI 1.1)", xextension: user1 },
    { id: "Whitespace", language: "Whitespace (0.3)", xextension: user1 },
    { id: "text", language: "Text (cat 8.3)", xextension: user1 },
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
  async initPropAsync(withtask: boolean) {
    if (withtask) {
      this.problemnourl = `https://yukicoder.me/problems/no/${this.task}`;
      this.api_problemnourl = `https://yukicoder.me/api/v1/problems/no/${this.task}`;

      // problemno to problemid
      this.problemid = await (async () => {
        const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);
        const res = await agent
          .get(this.api_problemnourl)
          .proxy(acts.proxy)
          .catch(res => {
            throw `ERROR: ${acts.responseToMessage(res)}`;
          });
        return JSON.parse(res.text).ProblemId;
      })();
      this.api_problemidurl = `https://yukicoder.me/api/v1/problems/${this.problemid}`;
      this.api_submiturl = `https://yukicoder.me/api/v1/problems/${this.problemid}/submit`;
      this.submissionsurl = `https://yukicoder.me/problems/no/${this.task}/submissions?status=&lang_id=&my_submission=enabled`;
    }
  }

  checkLogin() {
    if (!this.apikey) {
      throw "ERROR: do login site";
    }
  }

  async loginSiteAsync() {
    // show channel
    acts.channel.appendLine(`yukicoder.apikey: ********`);
  }

  async getTestAsync() {
    // show channel
    acts.channel.appendLine(`yukicoder.problemnourl: ${this.problemnourl}`);
    acts.channel.appendLine(`yukicoder.apikey: ********`);

    // get agent
    const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);

    // get file list
    let fileiurl = `${this.api_problemidurl}/file/in`;
    acts.channel.appendLine(`yukicoder.fileinurl: ${fileiurl}`);
    const resfilei = await agent
      .get(fileiurl)
      .proxy(acts.proxy)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`-> ${resfilei.status}`);

    // get file
    let text = "";
    let filei = JSON.parse(resfilei.text);
    for (let nx = 0; nx < filei.length; nx++) {
      // filename
      let fileix = filei[nx];

      // get response
      let fileixurl = `${this.api_problemidurl}/file/in/${fileix}`;
      acts.channel.appendLine(`yukicoder.fileiurl-${nx}: ${fileixurl}`);
      const resfileix = await agent
        .get(fileixurl)
        .proxy(acts.proxy)
        .catch(res => {
          throw `ERROR: ${acts.responseToMessage(res)}`;
        });

      let fileoxurl = `${this.api_problemidurl}/file/out/${fileix}`;
      acts.channel.appendLine(`yukicoder.fileourl-${nx}: ${fileoxurl}`);
      const resfileox = await agent
        .get(fileoxurl)
        .proxy(acts.proxy)
        .catch(res => {
          throw `ERROR: ${acts.responseToMessage(res)}`;
        });

      // response to test text
      text += resfileix.text.trim() + acts.separator;
      text += resfileox.text.trim() + acts.separator;
    }

    return text;
  }

  async submitTaskAsync() {
    // show channel
    acts.channel.appendLine(`yukicoder.problemnourl: ${this.problemnourl}`);
    acts.channel.appendLine(`yukicoder.apikey: ********`);

    // get agent
    const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);

    // submit task
    acts.channel.appendLine(`yukicoder.api_submiturl: ${this.api_submiturl}`);
    const code = fs.readFileSync(acts.taskfile).toString();
    const res3 = await agent
      .post(this.api_submiturl)
      .proxy(acts.proxy)
      .set("Content-Type", "multipart/form-data")
      .field("lang", this.getLanguageId())
      .field("source", code)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`-> ${res3.status}`);
    acts.channel.appendLine(`submissionsurl: ${this.submissionsurl}`);
  }

  browseTask() {
    acts.channel.appendLine(`taskurl: ${this.api_problemidurl}`);
    vscode.env.openExternal(vscode.Uri.parse(this.problemnourl));
  }

  getLanguageId(): string {
    const xlanguage = this.xlanguages.find(val => val.language === this.language);
    if (!xlanguage) {
      throw `ERROR: unsupported language, language=${this.language}`;
    }
    return String(xlanguage.id);
  }

  loadState(json: any) {
    yukicoder.apikey = json.yukicoder?.encapikey ? Buffer.from(json.yukicoder?.encapikey, "base64").toString() : "";
    yukicoder.contest = json.yukicoder?.contest;
    yukicoder.task = json.yukicoder?.task;
    yukicoder.extension = json.yukicoder?.extension;
    yukicoder.language = json.yukicoder?.language;
  }

  saveState(json: any) {
    json.yukicoder = {};
    json.yukicoder.encapikey = Buffer.from(yukicoder.apikey).toString("base64");
    json.yukicoder.contest = yukicoder.contest;
    json.yukicoder.task = yukicoder.task;
    json.yukicoder.extension = yukicoder.extension;
    json.yukicoder.language = yukicoder.language;
  }

  async loadStateAsync() {
    yukicoder.apikey = (await acts.context.secrets.get("yukicoder.apikey")) || "";
    yukicoder.contest = (await acts.context.secrets.get("yukicoder.contest")) || "";
    yukicoder.task = (await acts.context.secrets.get("yukicoder.task")) || "";
    yukicoder.extension = (await acts.context.secrets.get("yukicoder.extension")) || "";
    yukicoder.language = (await acts.context.secrets.get("yukicoder.language")) || "";
  }

  async saveStateAsync() {
    await acts.context.secrets.store("yukicoder.apikey", yukicoder.apikey);
    await acts.context.secrets.store("yukicoder.contest", yukicoder.contest);
    await acts.context.secrets.store("yukicoder.task", yukicoder.task);
    await acts.context.secrets.store("yukicoder.extension", yukicoder.extension);
    await acts.context.secrets.store("yukicoder.language", yukicoder.language);
  }

  async deleteStateAsync() {
    await acts.context.secrets.delete("yukicoder.apikey");
    await acts.context.secrets.delete("yukicoder.contest");
    await acts.context.secrets.delete("yukicoder.task");
    await acts.context.secrets.delete("yukicoder.extension");
    await acts.context.secrets.delete("yukicoder.language");
  }
}
export const yukicoder = new Yukicoder();

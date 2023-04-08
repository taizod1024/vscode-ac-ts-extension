import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import superagent from "superagent";
import * as cheerio from "cheerio";
import decompress from "decompress";
import { acts } from "../AcTsExtension";
import { XSite } from "../XSite";
import { XLanguage } from "../XLanguage";
import { cc } from "../xextension/Cc";
import { cpp } from "../xextension/Cpp";
import { java } from "../xextension/Java";
import { python } from "../xextension/Python";
import { go } from "../xextension/Go";
import { javascript } from "../xextension/JavaScript";
import { typescript } from "../xextension/TypeScript";
import { user1 } from "../xextension/User1";

class AtCoder implements XSite {
  // param
  public username: string;
  public password: string;

  // prop
  public loginurl: string;
  public taskurl: string;
  public submiturl: string;
  public submissionsurl: string;
  public aclibpath: string;
  public aclibzipfile: string;
  public aclibzip_extractpath: string;
  public aclibzip_aclibpath: string;

  // implements

  // prop
  public readonly site = "atcoder";
  public readonly siteurl = "https://atcoder.jp/";
  public readonly contestregexp = /^(.+)$/;
  public readonly contestmessage = "input contest [e.g.: abc190, abc191]";
  public readonly taskregexp = /^(.+)_(.+)$/;
  public readonly taskmessage = "input task [e.g.: abc190_a, abc190_b]";
  public readonly xlanguages: XLanguage[] = [
    { id: 4001, language: "C (GCC 9.2.1)", xextension: cc },
    { id: 4002, language: "C (Clang 10.0.0)", xextension: cc },
    { id: 4003, language: "C++ (GCC 9.2.1)", xextension: cpp },
    { id: 4004, language: "C++ (Clang 10.0.0)", xextension: cpp },
    { id: 4005, language: "Java (OpenJDK 11.0.6)", xextension: java },
    { id: 4006, language: "Python (3.8.2)", xextension: python },
    { id: 4007, language: "Bash (5.0.11)", xextension: user1 },
    { id: 4008, language: "bc (1.07.1)", xextension: user1 },
    { id: 4009, language: "Awk (GNU Awk 4.1.4)", xextension: user1 },
    { id: 4010, language: "C# (.NET Core 3.1.201)", xextension: user1 },
    { id: 4011, language: "C# (Mono-mcs 6.8.0.105)", xextension: user1 },
    { id: 4012, language: "C# (Mono-csc 3.5.0)", xextension: user1 },
    { id: 4013, language: "Clojure (1.10.1.536)", xextension: user1 },
    { id: 4014, language: "Crystal (0.33.0)", xextension: user1 },
    { id: 4015, language: "D (DMD 2.091.0)", xextension: user1 },
    { id: 4016, language: "D (GDC 9.2.1)", xextension: user1 },
    { id: 4017, language: "D (LDC 1.20.1)", xextension: user1 },
    { id: 4018, language: "Dart (2.7.2)", xextension: user1 },
    { id: 4019, language: "dc (1.4.1)", xextension: user1 },
    { id: 4020, language: "Erlang (22.3)", xextension: user1 },
    { id: 4021, language: "Elixir (1.10.2)", xextension: user1 },
    { id: 4022, language: "F# (.NET Core 3.1.201)", xextension: user1 },
    { id: 4023, language: "F# (Mono 10.2.3)", xextension: user1 },
    { id: 4024, language: "Forth (gforth 0.7.3)", xextension: user1 },
    { id: 4025, language: "Fortran (GNU Fortran 9.2.1)", xextension: user1 },
    { id: 4026, language: "Go (1.14.1)", xextension: go },
    { id: 4027, language: "Haskell (GHC 8.8.3)", xextension: user1 },
    { id: 4028, language: "Haxe (4.0.3); js", xextension: javascript },
    { id: 4029, language: "Haxe (4.0.3); Java", xextension: java },
    { id: 4030, language: "JavaScript (Node.js 12.16.1)", xextension: javascript },
    { id: 4031, language: "Julia (1.4.0)", xextension: user1 },
    { id: 4032, language: "Kotlin (1.3.71)", xextension: user1 },
    { id: 4033, language: "Lua (Lua 5.3.5)", xextension: user1 },
    { id: 4034, language: "Lua (LuaJIT 2.1.0)", xextension: user1 },
    { id: 4035, language: "Dash (0.5.8)", xextension: user1 },
    { id: 4036, language: "Nim (1.0.6)", xextension: user1 },
    { id: 4037, language: "Objective-C (Clang 10.0.0)", xextension: user1 },
    { id: 4038, language: "Common Lisp (SBCL 2.0.3)", xextension: user1 },
    { id: 4039, language: "OCaml (4.10.0)", xextension: user1 },
    { id: 4040, language: "Octave (5.2.0)", xextension: user1 },
    { id: 4041, language: "Pascal (FPC 3.0.4)", xextension: user1 },
    { id: 4042, language: "Perl (5.26.1)", xextension: user1 },
    { id: 4043, language: "Raku (Rakudo 2020.02.1)", xextension: user1 },
    { id: 4044, language: "PHP (7.4.4)", xextension: user1 },
    { id: 4045, language: "Prolog (SWI-Prolog 8.0.3)", xextension: user1 },
    { id: 4046, language: "PyPy2 (7.3.0)", xextension: python },
    { id: 4047, language: "PyPy3 (7.3.0)", xextension: python },
    { id: 4048, language: "Racket (7.6)", xextension: user1 },
    { id: 4049, language: "Ruby (2.7.1)", xextension: user1 },
    { id: 4050, language: "Rust (1.42.0)", xextension: user1 },
    { id: 4051, language: "Scala (2.13.1)", xextension: user1 },
    { id: 4052, language: "Java (OpenJDK 1.8.0)", xextension: java },
    { id: 4053, language: "Scheme (Gauche 0.9.9)", xextension: user1 },
    { id: 4054, language: "Standard ML (MLton 20130715)", xextension: user1 },
    { id: 4055, language: "Swift (5.2.1)", xextension: user1 },
    { id: 4056, language: "Text (cat 8.28)", xextension: user1 },
    { id: 4057, language: "TypeScript (3.8)", xextension: typescript },
    { id: 4058, language: "Visual Basic (.NET Core 3.1.101)", xextension: user1 },
    { id: 4059, language: "Zsh (5.4.2)", xextension: user1 },
    { id: 4060, language: "COBOL - Fixed (OpenCOBOL 1.1.0)", xextension: user1 },
    { id: 4061, language: "COBOL - Free (OpenCOBOL 1.1.0)", xextension: user1 },
    { id: 4062, language: "Brainfuck (bf 20041219)", xextension: user1 },
    { id: 4063, language: "Ada2012 (GNAT 9.2.1)", xextension: user1 },
    { id: 4064, language: "Unlambda (2.0.0)", xextension: user1 },
    { id: 4065, language: "Cython (0.29.16)", xextension: user1 },
    { id: 4066, language: "Sed (4.4)", xextension: user1 },
    { id: 4067, language: "Vim (8.2.0460)", xextension: user1 },
  ];
  public readonly acliburl = "https://github.com/atcoder/ac-library/archive/refs/heads/master.zip";
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
  public async initPropAsync(withtask: boolean) {
    this.loginurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";
    if (withtask) {
      this.taskurl = `https://atcoder.jp/contests/${this.contest}/tasks/${this.task}`;
      this.submiturl = `https://atcoder.jp/contests/${this.contest}/submit`;
      this.submissionsurl = `https://atcoder.jp/contests/${this.contest}/submissions/me`;
      this.aclibpath = path.normalize(`${acts.projectpath}/lib/atcoder`);
      this.aclibzipfile = path.normalize(`${acts.tmppath}/ac-library-master.zip`);
      this.aclibzip_extractpath = path.normalize(`${acts.tmppath}/ac-library-master`);
      this.aclibzip_aclibpath = path.normalize(`${acts.tmppath}/ac-library-master/atcoder`);
    }
    // atcoderでc/c++の場合
    if (this.extension === cpp.extension) {
      acts.channel.appendLine(`[${acts.timestamp()}] aclibpath: ${this.aclibpath}`);
      // .aclibpathがない場合
      if (!fs.existsSync(this.aclibpath)) {
        // ダウンロード済atcoder libraryがあれば削除
        if (fs.existsSync(this.aclibzipfile)) {
          fs.unlinkSync(this.aclibzipfile);
        }
        if (fs.existsSync(this.aclibzip_extractpath)) {
          fs.rmSync(this.aclibzip_extractpath, { recursive: true, force: true });
        }
        // atcoder libraryをダウンロード
        acts.channel.appendLine(`[${acts.timestamp()}] get_aclib: ${this.acliburl}`);
        const agent = superagent.agent();
        let response;
        try {
          response = await agent
            .get(this.acliburl)
            .responseType("blob")
            .proxy(acts.proxy)
            .catch(res => {
              throw acts.responseToMessage(res);
            });
          acts.channel.appendLine(`[${acts.timestamp()}] -> ${response.status}`);
        } catch (ex) {
          acts.channel.appendLine(`[${acts.timestamp()}] -> ${ex}`);
        }
        // ダウンロードできた場合だけファイルに保存して展開
        if (response.status === 200) {
          fs.writeFileSync(this.aclibzipfile, response.body);
          await decompress(this.aclibzipfile, acts.tmppath);
          // atcoderフォルダだけプロジェクトフォルダにコピー
          fs.mkdirSync(this.aclibpath, { recursive: true });
          fs.readdirSync(this.aclibzip_aclibpath).forEach(filename => {
            acts.channel.appendLine(`[${acts.timestamp()}] aclib: ${filename}`);
            const src = path.normalize(`${this.aclibzip_aclibpath}/${filename}`);
            const dst = path.normalize(`${this.aclibpath}/${filename}`);
            fs.copyFileSync(src, dst);
          });
        }
      }
    }
  }

  public checkLogin() {
    if (!this.username || !this.password) {
      throw "ERROR: do login site";
    }
  }

  public async loginSiteAsync() {
    // show channel
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.loginurl: ${this.loginurl}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.username: ${this.username}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.password: ********`);

    // get agent
    const agent = superagent.agent();

    // login get
    acts.channel.appendLine(`[${acts.timestamp()}] login_get:`);
    const res1 = await agent
      .get(this.loginurl)
      .proxy(acts.proxy)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res1.status}`);

    // login post
    acts.channel.appendLine(`[${acts.timestamp()}] login_post:`);
    const $ = cheerio.load(res1.text);
    const csrf_token = $("input").val();
    const res2 = await agent
      .post(this.loginurl)
      .proxy(acts.proxy)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        username: this.username,
        password: this.password,
        csrf_token: csrf_token,
      })
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res2.status}`);

    // check login
    if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
      throw `ERROR: atcoder login failed, userame="${this.username}", password="********"`;
    }
  }

  public async getTestAsync() {
    // show channel
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.taskurl: ${this.taskurl}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.username: ${this.username}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.password: ********`);

    // get agent
    const agent = superagent.agent();

    // login get
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.login_get:`);
    const res1 = await agent
      .get(this.loginurl)
      .proxy(acts.proxy)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res1.status}`);

    // login post
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.login_post:`);
    const $ = cheerio.load(res1.text);
    const csrf_token = $("input").val();
    const res2 = await agent
      .post(this.loginurl)
      .proxy(acts.proxy)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        username: this.username,
        password: this.password,
        csrf_token: csrf_token,
      })
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res2.status}`);

    // check login
    if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
      throw `ERROR: atcoder login failed, userame="${this.username}", password="********", csrf_token="${csrf_token}"`;
    }

    // get task
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.get_task:`);
    const response = await agent
      .get(this.taskurl)
      .proxy(acts.proxy)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${response.status}`);

    // response to test text
    let text = "";
    let idx = 1;
    while (true) {
      let m1 = response.text.match(new RegExp(`<h3>入力例 ${idx}<\/h3>[\s\r\n]*<pre>([^<]*)<\/pre>`));
      if (m1 === null) {
        break;
      }
      let m2 = response.text.match(new RegExp(`<h3>出力例 ${idx}<\/h3>[\s\r\n]*<pre>([^<]*)<\/pre>`));
      if (m2 === null) {
        break;
      }
      text += m1[1].trim() + acts.separator + m2[1].trim() + acts.separator;
      idx++;
    }
    idx--;
    text = text.replace("&lt;", "<");
    text = text.replace("&gt;", ">");

    return text;
  }

  public async submitTaskAsync() {
    // show channel
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.taskurl: ${this.taskurl}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.username: ${this.username}`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.password: ********`);
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.submiturl: ${this.submiturl}`);

    // get agent
    const agent = superagent.agent();

    // login get
    acts.channel.appendLine(`[${acts.timestamp()}] login_get:`);
    const res1 = await agent
      .get(this.loginurl)
      .proxy(acts.proxy)
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res1.status}`);

    // login post
    acts.channel.appendLine(`[${acts.timestamp()}] login_post:`);
    const $ = cheerio.load(res1.text);
    const csrf_token = $("input").val();
    const res2 = await agent
      .post(this.loginurl)
      .proxy(acts.proxy)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        username: this.username,
        password: this.password,
        csrf_token: csrf_token,
      })
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res2.status}`);

    // check login
    if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
      throw `ERROR: atcoder login failed, userame="${this.username}", password="${this.password}", csrf_token="${csrf_token}"`;
    }

    // submit task
    acts.channel.appendLine(`[${acts.timestamp()}] submit_task:`);
    const code = fs.readFileSync(acts.taskfile).toString();
    const res3 = await agent
      .post(this.submiturl)
      .proxy(acts.proxy)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        "data.TaskScreenName": this.task,
        "data.LanguageId": this.getLanguageId(),
        csrf_token: csrf_token,
        sourceCode: code,
      })
      .catch(res => {
        throw `ERROR: ${acts.responseToMessage(res)}`;
      });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${res3.status}`);
    acts.channel.appendLine(`[${acts.timestamp()}] submissionsurl: ${this.submissionsurl}`);
  }

  public browseTask() {
    acts.channel.appendLine(`[${acts.timestamp()}] taskurl: ${this.taskurl}`);
    vscode.env.openExternal(vscode.Uri.parse(this.taskurl));
  }

  public getLanguageId(): number {
    const xlanguage = this.xlanguages.find(val => val.language === this.language);
    if (!xlanguage) {
      throw `ERROR: unsupported language, language=${this.language}`;
    }
    return Number(xlanguage.id);
  }

  public loadState(json: any) {
    atcoder.username = json.atcoder?.username || "";
    atcoder.password = json.atcoder?.encpassword ? Buffer.from(json.atcoder?.encpassword, "base64").toString() : "";
    atcoder.contest = json.atcoder?.contest;
    atcoder.task = json.atcoder?.task;
    atcoder.extension = json.atcoder?.extension;
    atcoder.language = json.atcoder?.language;
  }

  saveState(json: any) {
    json.atcoder = {};
    json.atcoder.username = atcoder.username;
    json.atcoder.encpassword = Buffer.from(atcoder.password).toString("base64");
    json.atcoder.contest = atcoder.contest;
    json.atcoder.task = atcoder.task;
    json.atcoder.extension = atcoder.extension;
    json.atcoder.language = atcoder.language;
  }
}
export const atcoder = new AtCoder();

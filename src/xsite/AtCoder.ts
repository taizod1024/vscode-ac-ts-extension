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
    { id: 5001, language: "C++ 20 (gcc 12.2)", xextension: cpp},
    { id: 5002, language: "Go (go 1.20.6)", xextension: go},
    { id: 5003, language: "C# 11.0 (.NET 7.0.7)", xextension: user1},
    { id: 5004, language: "Kotlin (KotlinJVM 1.8.20)", xextension: user1},
    { id: 5005, language: "Java (OpenJDK 17)", xextension: java},
    { id: 5006, language: "Nim (Nim 1.6.14)", xextension: user1},
    { id: 5007, language: "V (V 0.4)", xextension: user1},
    { id: 5008, language: "Zig (Zig 0.10.1)", xextension: user1},
    { id: 5009, language: "JavaScript (Node.js 18.16.1)", xextension: javascript},
    { id: 5010, language: "JavaScript (Deno 1.35.1)", xextension: javascript},
    { id: 5011, language: "R (GNU R 4.2.1)", xextension: user1},
    { id: 5012, language: "D (DMD 2.104.0)", xextension: user1},
    { id: 5013, language: "D (LDC 1.32.2)", xextension: user1},
    { id: 5014, language: "Swift (swift 5.8.1)", xextension: user1},
    { id: 5015, language: "Dart (Dart 3.0.5)", xextension: user1},
    { id: 5016, language: "PHP (php 8.2.8)", xextension: user1},
    { id: 5017, language: "C (gcc 12.2.0)", xextension: cc},
    { id: 5018, language: "Ruby (ruby 3.2.2)", xextension: user1},
    { id: 5019, language: "Crystal (Crystal 1.9.1)", xextension: user1},
    { id: 5020, language: "Brainfuck (bf 20041219)", xextension: user1},
    { id: 5021, language: "F# 7.0 (.NET 7.0.7)", xextension: user1},
    { id: 5022, language: "Julia (Julia 1.9.2)", xextension: user1},
    { id: 5023, language: "Bash (bash 5.2.2)", xextension: user1},
    { id: 5024, language: "Text (cat 8.32)", xextension: user1},
    { id: 5025, language: "Haskell (GHC 9.4.5)", xextension: user1},
    { id: 5026, language: "Fortran (gfortran 12.2)", xextension: user1},
    { id: 5027, language: "Lua (LuaJIT 2.1.0-beta3)", xextension: user1},
    { id: 5028, language: "C++ 23 (gcc 12.2)", xextension: cpp},
    { id: 5029, language: "Common Lisp (SBCL 2.3.6)", xextension: user1},
    { id: 5030, language: "COBOL (Free) (GnuCOBOL 3.1.2)", xextension: user1},
    { id: 5031, language: "C++ 23 (Clang 16.0.6)", xextension: cpp},
    { id: 5032, language: "Zsh (Zsh 5.9)", xextension: user1},
    { id: 5033, language: "SageMath (SageMath 9.5)", xextension: python},
    { id: 5034, language: "Sed (GNU sed 4.8)", xextension: user1},
    { id: 5035, language: "bc (bc 1.07.1)", xextension: user1},
    { id: 5036, language: "dc (dc 1.07.1)", xextension: user1},
    { id: 5037, language: "Perl (perl 5.34)", xextension: user1},
    { id: 5038, language: "AWK (GNU Awk 5.0.1)", xextension: user1},
    { id: 5039, language: "なでしこ (cnako3 3.4.20)", xextension: user1},
    { id: 5040, language: "Assembly x64 (NASM 2.15.05)", xextension: user1},
    { id: 5041, language: "Pascal (fpc 3.2.2)", xextension: user1},
    { id: 5042, language: "C# 11.0 AOT (.NET 7.0.7)", xextension: user1},
    { id: 5043, language: "Lua (Lua 5.4.6)", xextension: user1},
    { id: 5044, language: "Prolog (SWI-Prolog 9.0.4)", xextension: user1},
    { id: 5045, language: "PowerShell (PowerShell 7.3.1)", xextension: user1},
    { id: 5046, language: "Scheme (Gauche 0.9.12)", xextension: user1},
    { id: 5047, language: "Scala 3.3.0 (Scala Native 0.4.14)", xextension: user1},
    { id: 5048, language: "Visual Basic 16.9 (.NET 7.0.7)", xextension: user1},
    { id: 5049, language: "Forth (gforth 0.7.3)", xextension: user1},
    { id: 5050, language: "Clojure (babashka 1.3.181)", xextension: user1},
    { id: 5051, language: "Erlang (Erlang 26.0.2)", xextension: user1},
    { id: 5052, language: "TypeScript 5.1 (Deno 1.35.1)", xextension: typescript},
    { id: 5053, language: "C++ 17 (gcc 12.2)", xextension: cpp},
    { id: 5054, language: "Rust (rustc 1.70.0)", xextension: user1},
    { id: 5055, language: "Python (CPython 3.11.4)", xextension: python},
    { id: 5056, language: "Scala (Dotty 3.3.0)", xextension: user1},
    { id: 5057, language: "Koka (koka 2.4.0)", xextension: user1},
    { id: 5058, language: "TypeScript 5.1 (Node.js 18.16.1)", xextension: typescript},
    { id: 5059, language: "OCaml (ocamlopt 5.0.0)", xextension: user1},
    { id: 5060, language: "Raku (Rakudo 2023.06)", xextension: user1},
    { id: 5061, language: "Vim (vim 9.0.0242)", xextension: user1},
    { id: 5062, language: "Emacs Lisp (Native Compile) (GNU Emacs 28.2)", xextension: user1},
    { id: 5063, language: "Python (Mambaforge / CPython 3.10.10)", xextension: python},
    { id: 5064, language: "Clojure (clojure 1.11.1)", xextension: user1},
    { id: 5065, language: "プロデル (mono版プロデル 1.9.1182)", xextension: user1},
    { id: 5066, language: "ECLiPSe (ECLiPSe 7.1_13)", xextension: user1},
    { id: 5067, language: "Nibbles (literate form) (nibbles 1.01)", xextension: user1},
    { id: 5068, language: "Ada (GNAT 12.2)", xextension: user1},
    { id: 5069, language: "jq (jq 1.6)", xextension: user1},
    { id: 5070, language: "Cyber (Cyber v0.2-Latest)", xextension: user1},
    { id: 5071, language: "Carp (Carp 0.5.5)", xextension: user1},
    { id: 5072, language: "C++ 17 (Clang 16.0.6)", xextension: cpp},
    { id: 5073, language: "C++ 20 (Clang 16.0.6)", xextension: cpp},
    { id: 5074, language: "LLVM IR (Clang 16.0.6)", xextension: user1},
    { id: 5075, language: "Emacs Lisp (Byte Compile) (GNU Emacs 28.2)", xextension: user1},
    { id: 5076, language: "Factor (Factor 0.98)", xextension: user1},
    { id: 5077, language: "D (GDC 12.2)", xextension: user1},
    { id: 5078, language: "Python (PyPy 3.10-v7.3.12)", xextension: python},
    { id: 5079, language: "Whitespace (whitespacers 1.0.0)", xextension: user1},
    { id: 5080, language: "><> (fishr 0.1.0)", xextension: user1},
    { id: 5081, language: "ReasonML (reason 3.9.0)", xextension: user1},
    { id: 5082, language: "Python (Cython 0.29.34)", xextension: python},
    { id: 5083, language: "Octave (GNU Octave 8.2.0)", xextension: user1},
    { id: 5084, language: "Haxe (JVM) (Haxe 4.3.1)", xextension: user1},
    { id: 5085, language: "Elixir (Elixir 1.15.2)", xextension: user1},
    { id: 5086, language: "Mercury (Mercury 22.01.6)", xextension: user1},
    { id: 5087, language: "Seed7 (Seed7 3.2.1)", xextension: user1},
    { id: 5088, language: "Emacs Lisp (No Compile) (GNU Emacs 28.2)", xextension: user1},
    { id: 5089, language: "Unison (Unison M5b)", xextension: user1},
    { id: 5090, language: "COBOL (GnuCOBOL(Fixed) 3.1.2)", xextension: user1},
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

  public async filterXLanguagesAsync(xlanguages: XLanguage[]) {
    // get agent
    const agent = superagent.agent();

    // login get
    this.loginurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";
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

    // get language ids
    this.submiturl = `https://atcoder.jp/contests/${this.contest}/submit`;
    acts.channel.appendLine(`[${acts.timestamp()}] atcoder.check_valid_language_ids:`);
    const response = await agent
        .get(this.submiturl)
        .proxy(acts.proxy)
        .catch(res => {
            throw `ERROR: ${acts.responseToMessage(res)}`;
        });
    acts.channel.appendLine(`[${acts.timestamp()}] -> ${response.status}`);
    
    const $submitpage = cheerio.load(response.text);
    const languageIds = $submitpage(`#select-lang-${this.task} select.form-control`)
        .find('option')
        .toArray()
        .flatMap(val => $submitpage(val).attr('value') ? $submitpage(val).attr('value') : []);
    if (languageIds.length === 0) {
      throw 'ERROR: failed to get language ids';
    }
    return xlanguages.filter(val => languageIds.includes(val.id.toString()));
  }
}
export const atcoder = new AtCoder();

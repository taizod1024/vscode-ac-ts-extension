import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import child_process from "child_process";
import { XSite } from "./XSite";
import { atcoder } from "./xsite/AtCoder";
import { yukicoder } from "./xsite/Yukicoder";
import { local } from "./xsite/Local";

// extension core
class AcTsExtension {
  // constant
  public readonly appname = "AtCoder Extension";
  public readonly appid = "ac-ts-extension";
  public readonly appcfgkey = "atcoderExtension";
  public readonly statefile: string;
  public readonly tmppath: string;
  public readonly iswindows: boolean = !!process.env.WINDIR;
  public readonly islinux: boolean = !process.env.WINDIR;
  public readonly projectfolder: vscode.WorkspaceFolder;
  public readonly channel: vscode.OutputChannel;

  // context
  public vscodeextensionpath: string;
  public projectpath: string;

  // secrets
  public enableSecrets = false;
  public secrets: vscode.SecretStorage;

  // param
  public site: string;

  // prop
  public get xsite() {
    const xsite = this.xsites.find(val => val.site === this.site);
    if (!xsite) {
      throw `ERROR: no such site, site=${this.site}`;
    }
    return xsite;
  }
  public tasktmplfile: string;
  public usertasktmplfile: string;
  public taskpath: string;
  public taskfile: string;
  public testfile: string;
  public execfile: string;
  public tmpstdinfile: string;
  public tmpstdoutfile: string;
  public separator: string;
  public proxy: any;
  public testtimeout: number;
  public debugstarttimeout: number;

  // const
  public get sites() {
    return this.xsites.map(val => val.site);
  }
  public xsites: XSite[];

  // setup function
  constructor() {
    // init constant
    if (this.iswindows) {
      this.statefile = path.normalize(`${process.env.USERPROFILE}/.${this.appid}.json`);
      this.tmppath = path.normalize(`${process.env.TEMP}/.${this.appid}`);
    } else {
      this.statefile = path.normalize(`${process.env.HOME}/.${this.appid}.json`);
      this.tmppath = path.normalize(`/tmp/${this.appid}/.${process.env.USER}`);
    }

    // coders and langs
    this.xsites = [atcoder, yukicoder, local];

    // init context
    this.channel = vscode.window.createOutputChannel(this.appname, { log: true });
    this.channel.show(true);
    this.channel.appendLine(`${this.appname}`);

    // load state
    this.loadState();
  }

  public async initPropAsync(withtask: boolean) {
    // init prop
    this.tasktmplfile = path.normalize(`${this.vscodeextensionpath}/template/template${this.xsite.extension}`);
    this.usertasktmplfile = path.normalize(`${this.projectpath}/template/template${this.xsite.extension}`);
    this.taskpath = path.normalize(`${this.projectpath}/src/${this.site}/${this.xsite.contest}`);
    this.taskfile = path.normalize(`${this.taskpath}/${this.xsite.task}${this.xsite.extension}`);
    this.testfile = path.normalize(`${this.taskpath}/${this.xsite.task}.txt`);
    this.execfile = path.normalize(`${this.taskpath}/${this.xsite.task}${this.iswindows ? ".exe" : ".out"}`);
    this.tmpstdinfile = path.normalize(`${this.tmppath}/test_stdin.txt`);
    this.tmpstdoutfile = path.normalize(`${this.tmppath}/test_stdout.txt`);
    this.separator = "\r\n--------\r\n";
    this.proxy = "";
    this.testtimeout = 5000;
    this.debugstarttimeout = 20000;

    // make tmppath
    if (!fs.existsSync(this.tmppath)) {
      fs.mkdirSync(this.tmppath, { recursive: true });
    }

    // make taskpath if task exist
    if (this.xsite.task) {
      if (!fs.existsSync(this.taskpath)) {
        fs.mkdirSync(this.taskpath, { recursive: true });
      }
    }

    // check and init site
    this.xsite.checkLogin();
    await this.xsite.initPropAsync(withtask);

    // check lang if extension exist
    if (this.xsite.extension) {
      // this.xextension is null when loginSite
      this.xsite.xextension.initProp();
    }

    // save state
    this.saveState();
  }

  public async loginSiteAsync() {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);

    // init command
    await this.initPropAsync(false);

    // login site
    await this.xsite.loginSiteAsync();

    this.channel.appendLine(`---- SUCCESS: ${this.site} done ----`);
  }

  public async initTaskAsync() {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);
    this.channel.appendLine(`contest: ${this.xsite.contest}`);
    this.channel.appendLine(`task: ${this.xsite.task}`);
    this.channel.appendLine(`extension: ${this.xsite.extension}`);

    // init command
    await this.initPropAsync(true);

    // check testfile not exits
    let text;
    if (!fs.existsSync(this.testfile)) {
      // get testtext
      text = await this.xsite.getTestAsync();
    }

    // create taskfile
    if (fs.existsSync(this.taskfile)) {
      this.channel.appendLine(`taskfile: ${this.taskfile} exist`);
    } else {
      if (fs.existsSync(this.usertasktmplfile)) {
        fs.copyFileSync(this.usertasktmplfile, this.taskfile);
        this.channel.appendLine(`taskfile: ${this.taskfile} created from user template`);
      } else {
        fs.copyFileSync(this.tasktmplfile, this.taskfile);
        this.channel.appendLine(`taskfile: ${this.taskfile} created from system template`);
      }
    }

    // create testfile
    if (fs.existsSync(this.testfile)) {
      this.channel.appendLine(`testfile: ${this.testfile} exist`);
    } else {
      fs.writeFileSync(this.testfile, text);
      this.channel.appendLine(`testfile: ${this.testfile} created`);
      if (text === "") {
        this.channel.appendLine(`WARN: there is no test set`);
      }
    }

    // init task with extension
    this.xsite.xextension.initTask();

    // open file
    vscode.workspace.openTextDocument(this.taskfile).then(
      (a: vscode.TextDocument) => {
        vscode.window.showTextDocument(a, 1, false);
      },
      (err: any) => {
        throw err;
      }
    );
    this.channel.appendLine(`---- SUCCESS: ${this.xsite.task} initialized ----`);
  }

  public async testTaskAsync(debug: boolean): Promise<void> {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);
    this.channel.appendLine(`contest: ${this.xsite.contest}`);
    this.channel.appendLine(`task: ${this.xsite.task}`);
    this.channel.appendLine(`extension: ${this.xsite.extension}`);
    this.channel.appendLine(`debug: ${debug}`);

    // init command
    await this.initPropAsync(true);

    // check taskfile
    this.channel.appendLine(`taskfile: ${this.taskfile}`);
    if (!fs.existsSync(this.taskfile)) {
      throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
    }

    // check testfile
    this.channel.appendLine(`testfile: ${this.testfile}`);
    if (!fs.existsSync(this.testfile)) {
      throw `ERROR: missing testfile="${this.testfile}", do init task`;
    }

    // delete files in tmppath
    fs.readdirSync(this.tmppath).forEach(filename => {
      const filepath = path.normalize(`${this.tmppath}/${filename}`);
      fs.rmSync(filepath, { recursive: true, force: true });
    });

    // read testfile
    const txt = fs.readFileSync(this.testfile).toString();
    const wrk = txt.split(this.separator.trim()).map(x => x.trim());
    if (wrk[wrk.length - 1] === "") {
      wrk.pop();
    }
    const ios: any[] = [];
    while (0 < wrk.length) {
      ios.push({
        in: wrk.shift(),
        out: wrk.shift(),
      });
    }

    // check test set
    if (ios.length === 0) {
      throw `WARN: there is no test set`;
    }

    // compile task
    this.xsite.xextension.compileTask();

    // run test set
    let ok = 0;
    let ng = 0;
    for (let iosx = 0; iosx < ios.length; iosx++) {
      this.channel.show(true);

      // create test input file
      const io = ios[iosx];
      this.channel.appendLine(`test-${iosx}:`);
      this.channel.appendLine(`- input ="${io.in}"`);
      this.channel.appendLine(`- output="${io.out}"`);
      fs.writeFileSync(this.tmpstdinfile, io.in);

      // exec command
      let child = null;
      let istimeout = false;

      // テスト実行
      if (debug) {
        // デバッグ実行時の開始
        this.xsite.xextension.debugTask();
        // デバッグセッションが開始するのを5秒間待機
        let timecount = 0;
        while (vscode.debug.activeDebugSession === undefined) {
          if (this.debugstarttimeout <= timecount) {
            throw `ERROR: debug session not started in ${this.debugstarttimeout} ms`;
          }
          timecount += 500;
          await this.sleep(500);
        }
        this.channel.appendLine(`- debug session=${vscode.debug.activeDebugSession?.id}`);
      } else {
        // 通常実行時
        child = this.xsite.xextension.testTask();
      }

      // テスト実行の終了待機
      if (debug) {
        // デバッグ実行時はvscode.debug.activeDebugSessionでデバッグセッションの有無を判断する。無条件でデバッグセッションの終了を待機
        while (vscode.debug.activeDebugSession !== undefined) {
          await this.sleep(500);
        }
        this.channel.appendLine(`- debug session=${vscode.debug.activeDebugSession?.id}`);
      } else {
        // 通常実行時はコマンド実行中は戻り値が確定するまで待つ。もしくはタイムアウトまで待機
        let timecount = 0;
        while (child.exitCode === null) {
          // タイムアウトした場合はプロセスを殺してフラグを設定
          if (this.testtimeout <= timecount) {
            if (this.iswindows) {
              child_process.execSync(`taskkill /pid ${child.pid} /t /f`);
            }
            if (this.islinux) {
              child_process.execSync(`kill ${child.pid}`);
            }
            istimeout = true;
            break;
          }
          timecount += 500;
          await this.sleep(500);
        }
      }

      // 念のため標準出力のリダイレクト先が存在するのを待機
      while (!fs.existsSync(this.tmpstdoutfile)) {
        await this.sleep(500);
      }

      // 念のため標準入力のリダイレクト元が削除できるのを待機
      while (true) {
        try {
          fs.unlinkSync(this.tmpstdinfile);
          break;
        } catch (ex) {
          if (ex instanceof Error) {
            if (!ex.message.match(/EBUSY/)) {
              throw ex;
            }
          }
          await this.sleep(500);
        }
      }

      // テスト実行完了
      this.channel.show(true);

      // 標準出力のリダイレクト先の読み込み
      const out = fs.readFileSync(this.tmpstdoutfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
      fs.unlinkSync(this.tmpstdoutfile);

      // テスト実行のキャンセル・タイムアウト・例外チェック
      this.channel.appendLine(`- stdout="${out}"`);
      this.channel.appendLine(`- exit  =${child?.exitCode}`);
      if (debug) {
        // デバッグ実行時は出力がない場合はキャンセルとして成功扱い、ただし中断
        if (out === "") {
          throw `WARN: CANCELED OR NO OUTPUT`;
        }
      } else {
        // 通常実行時はタイムアウトフラグを確認して失敗扱い
        if (istimeout) {
          throw `ERROR: timeout over ${this.testtimeout} ms`;
        }
        // 通常実行時は0以外の戻り値は失敗扱い
        if (child.exitCode !== 0) {
          throw `ERROR: error occurred`;
        }
      }

      // テスト実行の結果チェック
      if (out === io.out) {
        this.channel.appendLine(`  -> OK`);
        ok++;
      } else {
        this.channel.appendLine(`  -> NG`);
        ng++;
      }
    }

    // テスト完了
    let msg = `${this.xsite.task} OK=${ok}, NG=${ng}`;
    if (ng !== 0) {
      throw `ERROR: ${msg}`;
    }
    this.channel.appendLine(`---- SUCCESS: ${msg} ----`);
  }

  public async submitTaskAsync() {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);
    this.channel.appendLine(`contest: ${this.xsite.contest}`);
    this.channel.appendLine(`task: ${this.xsite.task}`);
    this.channel.appendLine(`extension: ${this.xsite.extension}`);
    this.channel.appendLine(`language: ${this.xsite.language}`);

    //  init command
    await this.initPropAsync(true);

    // check taskfile
    this.channel.appendLine(`taskfile: ${this.taskfile}`);
    if (!fs.existsSync(this.taskfile)) {
      throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
    }

    // submit task with extension
    this.xsite.xextension.submitTask();

    // submit task
    await this.xsite.submitTaskAsync();

    this.channel.appendLine(`---- SUCCESS: ${this.xsite.task} submitted ----`);
  }

  public async removeTaskAsync() {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);
    this.channel.appendLine(`contest: ${this.xsite.contest}`);
    this.channel.appendLine(`task: ${this.xsite.task}`);
    this.channel.appendLine(`extension: ${this.xsite.extension}`);

    // init command
    await this.initPropAsync(true);

    // remove Taskfile
    if (!fs.existsSync(this.taskfile)) {
      this.channel.appendLine(`taskfile: ${this.taskfile} missing`);
    } else {
      fs.unlinkSync(this.taskfile);
      this.channel.appendLine(`taskfile: ${this.taskfile} removed`);
    }

    // remove testfile
    if (!fs.existsSync(this.testfile)) {
      this.channel.appendLine(`testfile: ${this.testfile} missing`);
    } else {
      fs.unlinkSync(this.testfile);
      this.channel.appendLine(`testfile: ${this.testfile} removed`);
    }

    this.channel.appendLine(`---- SUCCESS: ${this.xsite.task} removed ----`);
  }

  public async browseTaskAsync() {
    // show channel
    this.channel.appendLine(`site: ${this.site}`);
    this.channel.appendLine(`contest: ${this.xsite.contest}`);
    this.channel.appendLine(`task: ${this.xsite.task}`);
    this.channel.appendLine(`extension: ${this.xsite.extension}`);

    // init command
    await this.initPropAsync(true);

    // open task
    this.xsite.browseTask();

    this.channel.appendLine(`---- SUCCESS: browse ${this.xsite.task} ----`);
  }

  // state
  public loadState() {
    const json = fs.existsSync(this.statefile)
      ? JSON.parse(fs.readFileSync(this.statefile).toString())
      : {
          site: "",
          contest: "",
          task: "",
          extension: "",
          language: "",
        };
    this.site = json.site || "";
    this.xsites.forEach(val => val.loadState(json));
  }

  public saveState() {
    const json = {
      site: this.site,
    };
    this.xsites.forEach(val => val.saveState(json));
    fs.writeFileSync(this.statefile, JSON.stringify(json));
  }

  public async loadStateAsync() {
    this.site = await this.secrets.get("site");
    this.xsites.forEach(async val => await val.loadStateAsync());
  }
  public async saveStateAsync() {
    await this.secrets.store("site", this.site);
    this.xsites.forEach(async val => await val.saveStateAsync());
  }

  // expand command
  public expandString(str: string): string {
    return str
      .replace(/\$taskfile/g, this.taskfile)
      .replace(/\$execfile/g, this.execfile)
      .replace(/\$taskpath/g, this.taskpath)
      .replace(/\$projectpath/g, this.projectpath)
      .replace(/\$tmppath/g, this.tmppath)
      .replace(/\$site/g, this.site)
      .replace(/\$contest/g, this.xsite.contest)
      .replace(/\$task/g, this.xsite.task)
      .replace(/\$extension/g, this.xsite.extension);
  }

  // message
  public responseToMessage(ex: any): string {
    let texts = [];
    if (ex.status) {
      texts.push(ex.status);
    }
    if (ex.message) {
      texts.push(ex.message);
    }
    if (ex.response?.text) {
      texts.push(ex.response.text);
    }
    let message = texts.join(" ");
    return message;
  }

  // sleep
  public async sleep(wait: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, wait));
  }
}
export const acts = new AcTsExtension();

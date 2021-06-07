import * as vscode from 'vscode';
import * as fs from "fs";
import superagent from "superagent";
import child_process, { ExecFileSyncOptions } from "child_process";
import { JSDOM } from "jsdom";
import { Buffer } from 'buffer';

// extension core
class AcTsExtension {

    // constant
    public appname: string;
    public appid: string;
    public loinurl: string;
    public configfile: string;
    public taskregexp: RegExp;

    // context
    public extensionpath: string;
    public projectfolder: vscode.WorkspaceFolder;
    public projectpath: string;
    public channel: vscode.OutputChannel;

    // param
    public cmd: string;
    public task: string;
    public username: string;
    public password: string;

    // prop
    public contest: string;
    public tasktmplfile: string;
    public usertasktmplfile: string;
    public taskurl: string;
    public submiturl: string;
    public submissionsurl: string;
    public taskpath: string;
    public taskfile: string;
    public taskbuildpath: string;
    public taskbuildfile: string;
    public testpath: string;
    public testfile: string;
    public tmptestpath: string;
    public tmptestinfile: string;
    public tmptestoutfile: string;
    public tmptesterrfile: string;
    public packagejsonfile: string;
    public packagelockjsonfile: string;
    public separator: string;
    public proxy: any;
    public timeout: number;

    // setup function
    constructor() {

        // init constant
        this.appname = "AtCoder TypeScript Extension";
        this.appid = "ac-ts-extension";
        this.loinurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";
        this.configfile = `${process.env.USERPROFILE}\\.${this.appid}.json`;
        this.taskregexp = /^(.*)_(.*)$/;

        // init context
        this.channel = vscode.window.createOutputChannel(this.appname);
        this.channel.show(true);
        this.channel.appendLine(`[${this.timestamp()}] ${this.appname}`);

        // load config
        this.loadConfig();
    }

    // inner function
    protected _initParam(args: string[]) {

        // usage
        if (args.length == 0) {
            throw `ERROR: invalid args, args=${args}`;
        }

        // check command
        this.cmd = args.shift();
        if (this.cmd == null) {
            throw "ERROR: missing command";
        }
        if (this.cmd == "login") {
            // check username, password
            const username = args.shift();
            const password = args.shift();
            if (!username || !password) {
                throw "ERROR: missing username or password";
            }
            // save config
            this.username = username;
            this.password = password;
            this.saveConfig();
        } else if (this.cmd == "init" || this.cmd == "test" || this.cmd == "submit" || this.cmd == "remove" || this.cmd == "browse") {
            let task = args.shift();
            // check task
            const match = task.match(this.taskregexp);
            if (match == null) {
                throw `ERROR: invalid task, task="${task}"`;
            }
            this.contest = match[1];
            // check username, password
            if (this.cmd == "init" || this.cmd == "submit") {
                if (!this.username || !this.password) {
                    throw "ERROR: do login command";
                }
            }
            // save config
            this.task = task;
            this.saveConfig();
        } else {
            throw `ERROR: unknown command, command="${this.cmd}"`;
        }

        // check no more param
        if (args.length != 0) {
            throw "ERROR: unknown parameter";
        }

        // init prop
        this.tasktmplfile = `${this.extensionpath}\\template\\default.ts`;
        this.usertasktmplfile = `${this.projectpath}\\template\\default.ts`;
        this.taskurl = `https://atcoder.jp/contests/${this.contest}/tasks/${this.task}`;
        this.submiturl = `https://atcoder.jp/contests/${this.contest}/submit`;
        this.submissionsurl = `https://atcoder.jp/contests/${this.contest}/submissions/me`;
        this.taskpath = `${this.projectpath}\\src\\atcoder\\${this.contest}`;
        this.taskfile = `${this.projectpath}\\src\\atcoder\\${this.contest}\\${this.task}.ts`;
        this.taskbuildpath = `${process.env.TEMP}\\${this.appid}\\build\\atcoder`;
        this.taskbuildfile = `${this.taskbuildpath}\\${this.task}.js`;
        this.testpath = `${this.projectpath}\\src\\atcoder\\${this.contest}`;
        this.testfile = `${this.projectpath}\\src\\atcoder\\${this.contest}\\${this.task}.txt`;
        this.tmptestpath = `${process.env.TEMP}\\${this.appid}`;
        this.tmptestinfile = `${process.env.TEMP}\\${this.appid}\\test_in.txt`;
        this.tmptestoutfile = `${process.env.TEMP}\\${this.appid}\\test_out.txt`;
        this.tmptesterrfile = `${process.env.TEMP}\\${this.appid}\\test_err.txt`;
        this.packagejsonfile = `${this.projectpath}\\package.json`;
        this.packagelockjsonfile = `${this.projectpath}\\package-lock.json`;
        this.separator = "\r\n--------\r\n";
        this.proxy = "";
        this.timeout = 5000;
    }
    // public interface
    public async loginSite(username: string, password: string) {

        this._initParam(["login", username, password]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] loginurl: ${this.loinurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.loinurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.loinurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="********"`;
        }

        this.channel.appendLine(`---- SUCCESS: ${this.username} logged in ----`);
    }
    public async initTask(task: string) {

        this._initParam(["init", task]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.taskurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);

        // make dir
        if (!fs.existsSync(this.taskpath)) fs.mkdirSync(this.taskpath, { recursive: true });
        if (!fs.existsSync(this.testpath)) fs.mkdirSync(this.testpath, { recursive: true });

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.loinurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.loinurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="********", csrf_token="${csrf_token}"`;
        }

        // get task
        this.channel.appendLine(`[${this.timestamp()}] get_task:`);
        const response = await agent.get(this.taskurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${response.status}`);

        // show input
        const imatch = response.text.match(new RegExp("<h3>入力</h3>[\r\n]*<p>入力は以下の形式で標準入力から与えられ(る|ます)。[ ]*</p>\r\n<pre>((.*|\r\n)*)", "m"));
        let itext = "";
        if (imatch == null) {
            // warning
            this.channel.appendLine(`[${this.timestamp()}] WARN: missing input`);
        } else {
            // html to text
            itext = imatch[2].substring(0, imatch[2].indexOf("</pre>"));
            itext = itext
                .replace(/<\/?code>/g, "'") // code tag to quote
                .replace(/<[^>]*>/g, "") // remove tag
                .replace(/\\[cvcdl]?dots/g, "") // remove ...
                .replace(/\.\.\./g, "") // remove ...
                .replace(/\\\S+/g, "") // remove escape sequence
                .replace(/ +/g, " ") // remove spaces
                .replace(/( ?\r\n)+/g, "\r\n") // remove newlines
                .replace(/, +/g, ",") // remove space with comma
                .replace(/[{,}]/g, "") // remove index separator
                .replace(/_([0-9][a-z]|[a-z][0-9]|[0-9][0-9])/g, "_11") // to index normalized
                .replace(/^\r\n/g, "") // remove blank lines
                .toLowerCase() // to lower case
                .trim(); // trim space
            this.channel.appendLine(`[${this.timestamp()}] input:`);
            this.channel.appendLine(itext);
        }

        // create taskfile
        if (fs.existsSync(this.taskfile)) {
            this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}" exist`);
        } else {
            if (fs.existsSync(this.usertasktmplfile)) {
                fs.copyFileSync(this.usertasktmplfile, this.taskfile);
                this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}" created from user template`);
            } else {
                fs.copyFileSync(this.tasktmplfile, this.taskfile);
                this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}" created from system template`);
            }
        }

        // create testfile
        if (fs.existsSync(this.testfile)) {
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" exist`);
        } else {
            let txt = "";
            let idx = 1;
            while (true) {
                let m1 = response.text.match(new RegExp(`<h3>入力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
                if (m1 == null)
                    break;
                let m2 = response.text.match(new RegExp(`<h3>出力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
                if (m2 == null)
                    break;
                txt += m1[1].trim() + this.separator + m2[1].trim() + this.separator;
                idx++;
            }
            idx--;
            fs.writeFileSync(this.testfile, txt);
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" created`);
        }

        // open file
        vscode.workspace.openTextDocument(actsextension.taskfile)
            .then((a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false);
            }, (err: any) => {
                throw err;
            });
        this.channel.appendLine(`---- SUCCESS: ${task} initialized ----`);
    }
    public async testTask(task: string, debug: boolean): Promise<void> {

        this._initParam(["test", task]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] debug: ${debug}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.taskurl}`);

        // check taskfile
        this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}"`);
        if (!fs.existsSync(this.taskfile)) {
            throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
        }

        // check testfile
        this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}"`);
        if (!fs.existsSync(this.testfile)) {
            throw `ERROR: missing testfile="${this.testfile}", do init task`;
        }
        if (fs.existsSync(this.tmptestinfile)) {
            fs.unlinkSync(this.tmptestinfile);
        }
        if (fs.existsSync(this.tmptestoutfile)) {
            fs.unlinkSync(this.tmptestoutfile);
        }

        // check node
        const nodemsg = ``
        if (!fs.existsSync(this.packagejsonfile) || !fs.existsSync(this.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init && npm install --save-dev typescript ts-node @types/node"`;
        }

        // make dir
        if (!fs.existsSync(this.tmptestpath)) fs.mkdirSync(this.tmptestpath);

        // read testfile
        const txt = fs.readFileSync(this.testfile).toString();
        const wrk = txt.split(this.separator.trim()).map(x => x.trim());
        if (wrk[wrk.length - 1] == "")
            wrk.pop();
        const ios: any[] = [];
        while (0 < wrk.length) {
            ios.push({
                in: wrk.shift(),
                out: wrk.shift()
            });
        }
        // run test set
        let ok = 0;
        let ng = 0;
        const that = this;
        let iosx = 0;
        return new Promise((resolve, reject) => {
            // run test
            (function runtest() {
                that.channel.show(true);
                // create test input file
                const io = ios[iosx];
                that.channel.appendLine(`[${that.timestamp()}] test-${iosx}:`);
                that.channel.appendLine(`[${that.timestamp()}] - input ="${io.in}"`);
                that.channel.appendLine(`[${that.timestamp()}] - output="${io.out}"`);
                fs.writeFileSync(that.tmptestinfile, io.in);
                // exec command
                let child;
                let timecount = 0;
                let istimeout = false;
                if (debug) {
                    const launchconfig = {
                        name: that.appid,
                        type: "pwa-node",
                        request: "launch",
                        runtimeArgs: ["--require", "ts-node/register"],
                        program: that.taskfile,
                        args: ["<", that.tmptestinfile, ">", that.tmptestoutfile, "2>", that.tmptesterrfile],
                        console: "integratedTerminal",
                        skipFiles: ["node_modules/**"],
                        env: { TS_NODE_TRANSPILE_ONLY: "1" }
                    };
                    vscode.debug.startDebugging(that.projectfolder, launchconfig);
                } else {
                    const command = `node --require ts-node/register ${that.taskfile} < ${that.tmptestinfile} > ${that.tmptestoutfile} 2> ${that.tmptesterrfile}`;
                    const options = {
                        cwd: that.projectpath,
                        env: { TS_NODE_TRANSPILE_ONLY: "1" }
                    };
                    child = child_process.exec(command, options);
                }
                // wait child process
                (function waitchild() {
                    if (child?.exitCode === null) {
                        timecount += 500;
                        if (timecount < that.timeout) {
                            setTimeout(waitchild, 500);
                            return;
                        }
                        child_process.execSync(`taskkill /pid ${child.pid} /t /f`);
                        istimeout = true;
                    }
                    // wait output
                    (function waitoutput() {
                        if (!fs.existsSync(that.tmptestoutfile)) {
                            setTimeout(waitoutput, 500);
                            return;
                        }
                        // wait command complete
                        (function waitunlock() {
                            try { fs.unlinkSync(that.tmptestinfile); }
                            catch (ex) {
                                if (!ex.message.match(/EBUSY/)) {
                                    reject(ex);
                                    return;
                                }
                                setTimeout(waitunlock, 500);
                                return;
                            }
                            // test done
                            (function commanddone() {
                                that.channel.show(true);
                                // read output
                                const out = fs.readFileSync(that.tmptestoutfile).toString().trim().replace(/\n/g, "\r\n");
                                fs.unlinkSync(that.tmptestoutfile);
                                // read error
                                const err = fs.readFileSync(that.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
                                fs.unlinkSync(that.tmptesterrfile);
                                // check error
                                if (err) {
                                    that.channel.appendLine(err);
                                    reject(`ERROR: error occurred`);
                                    return;
                                }
                                // check timeout
                                if (istimeout) {
                                    reject(`ERROR: timeout over ${that.timeout} ms`);
                                    return;
                                }
                                // chceck canceled
                                if (out == "") {
                                    that.channel.appendLine(`---- CANCELED OR NO OUTPUT ----`);
                                    resolve();
                                    return;
                                }
                                // check output
                                that.channel.appendLine(`[${that.timestamp()}] - answer="${out}"`);
                                if (out == io.out) {
                                    that.channel.appendLine(`[${that.timestamp()}] -> OK`);
                                    ok++;
                                } else {
                                    that.channel.appendLine(`[${that.timestamp()}] -> NG`);
                                    ng++;
                                }
                                // next test
                                iosx++;
                                if (iosx < ios.length) {
                                    setTimeout(runtest, 500);
                                    return;
                                }
                                // test set done
                                let msg = `${that.task} OK=${ok}, NG=${ng}`;
                                if (ng == 0) {
                                    that.channel.appendLine(`---- SUCCESS: ${msg} ----`);
                                    resolve();
                                    return;
                                } else {
                                    reject("ERROR: " + msg);
                                    return;
                                }
                            })();
                        })();
                    })();
                })();
            })();
        });
    }
    public async submitTask(task: string) {

        this._initParam(["submit", task]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.taskurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);
        this.channel.appendLine(`[${this.timestamp()}] submiturl: ${this.submiturl}`);

        // check taskfile
        this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}"`);
        if (!fs.existsSync(this.taskfile)) {
            throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
        }

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.loinurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.loinurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="${this.password}", csrf_token="${csrf_token}"`;
        }

        // submit task
        this.channel.appendLine(`[${this.timestamp()}] submit_task:`);
        const code = fs.readFileSync(this.taskfile).toString();
        const res3 = await agent.post(this.submiturl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                "data.TaskScreenName": this.task,
                "data.LanguageId": 4057,
                csrf_token: csrf_token,
                sourceCode: code
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res3.status}`);
        this.channel.appendLine(`[${this.timestamp()}] submissionsurl: ${this.submissionsurl}`);
        this.channel.appendLine(`---- SUCCESS: ${this.task} submitted ----`);
    }
    public async removeTask(task: string) {

        this._initParam(["remove", task]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.taskurl}`);

        // Remove Taskfile
        if (!fs.existsSync(this.taskfile)) {
            this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}" missing`);
        } else {
            fs.unlinkSync(this.taskfile);
            this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}" removed`);
        }

        // remove testfile
        if (!fs.existsSync(this.testfile)) {
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" missing`);
        } else {
            fs.unlinkSync(this.testfile);
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" removed`);
        }

        this.channel.appendLine(`---- SUCCESS: ${this.task} removed ----`);
    }

    public async browseTask(task: string) {

        this._initParam(["browse", task]);

        this.channel.appendLine(`[${this.timestamp()}] command: ${this.cmd}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.taskurl}`);

        // open browser
        vscode.env.openExternal(vscode.Uri.parse(this.taskurl));

        this.channel.appendLine(`---- SUCCESS: browse ${this.task} ----`);
    }

    // config
    protected loadConfig() {
        if (fs.existsSync(this.configfile)) {
            const app = JSON.parse(fs.readFileSync(this.configfile).toString());
            this.username = app.atcoder.username;
            this.password = Buffer.from(app.atcoder.encpassword, "base64").toString();
            this.task = app.atcoder.task;
        } else {
            this.username = "";
            this.password = "";
            this.task = "";
        }
    }
    protected saveConfig() {
        const app = {
            atcoder: {
                username: this.username,
                encpassword: Buffer.from(this.password).toString("base64"),
                task: this.task
            }
        };
        fs.writeFileSync(this.configfile, JSON.stringify(app));
    }

    // utility
    protected timestamp(): string {
        return new Date().toLocaleString("ja-JP").split(" ")[1];
    }
};
export const actsextension = new AcTsExtension();

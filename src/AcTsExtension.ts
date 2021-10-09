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
    public configfile: string;
    public sites: string[];
    public extensions: string[];

    // context
    public vscodeextensionpath: string;
    public projectfolder: vscode.WorkspaceFolder;
    public projectpath: string;
    public channel: vscode.OutputChannel;

    // param
    public site: string;
    public contest: string;
    public cmd: string;
    public task: string;
    public extension: string;

    // atcoder
    public atcoder: {

        // param
        username?: string;
        password?: string;

        // prop
        contestregexp?: RegExp;
        contestmessage?: string;
        taskregexp?: RegExp;
        taskmessage?: string;

        loginurl?: string;
        taskurl?: string;
        submiturl?: string;
        submissionsurl?: string;
    };

    // atcoder
    public yukicoder: {

        // prop
        contestregexp?: RegExp;
        contestmessage?: string;
        taskregexp?: RegExp;
        taskmessage?: string;
    };

    // prop
    public tasktmplfile: string;
    public usertasktmplfile: string;
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
        this.appname = "AtCoder Extension";
        this.appid = "ac-ts-extension";
        this.configfile = `${process.env.USERPROFILE}\\.${this.appid}.json`;
        this.sites = ["atcoder", "yukicoder"];
        this.extensions = [".ts", ".py"];

        // init context
        this.channel = vscode.window.createOutputChannel(this.appname);
        this.channel.show(true);
        this.channel.appendLine(`[${this.timestamp()}] ${this.appname}`);

        // init atcoder
        this.atcoder = {};
        this.atcoder.contestregexp = /^(.+)$/;
        this.atcoder.contestmessage = "input contest [e.g.: abc190, abc191]";
        this.atcoder.taskregexp = /^(.+)_(.+)$/;
        this.atcoder.taskmessage = "input task [e.g.: abc190_a, abc190_b]";
        this.atcoder.loginurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";

        // init yukicoder
        this.yukicoder = {};
        this.yukicoder.contestregexp = /^[0-9]+$/;
        this.yukicoder.contestmessage = "input contest [e.g.: 314, 315]";
        this.yukicoder.taskregexp = /^[0-9]+$/;
        this.yukicoder.taskmessage = "input task [e.g.: 1680, 1681]";

        // load config
        this.loadConfig();
    }

    // inner function
    protected checkLogin() {
        if (this.site == "atcoder") {
            if (!this.atcoder.username || !this.atcoder.password) {
                throw "ERROR: do login command";
            }
        }
    }
    protected initProp() {

        // init prop
        this.tasktmplfile = `${this.vscodeextensionpath}\\template\\default${this.extension}`;
        this.usertasktmplfile = `${this.projectpath}\\template\\default${this.extension}`;
        this.taskpath = `${this.projectpath}\\src\\${this.site}\\${this.contest}`;
        this.taskfile = `${this.projectpath}\\src\\${this.site}\\${this.contest}\\${this.task}${this.extension}`;
        this.taskbuildpath = `${process.env.TEMP}\\${this.appid}\\build\\${this.site}`;
        this.taskbuildfile = `${this.taskbuildpath}\\${this.task}.js`;
        this.testpath = `${this.projectpath}\\src\\${this.site}\\${this.contest}`;
        this.testfile = `${this.projectpath}\\src\\${this.site}\\${this.contest}\\${this.task}.txt`;
        this.tmptestpath = `${process.env.TEMP}\\${this.appid}`;
        this.tmptestinfile = `${process.env.TEMP}\\${this.appid}\\test_in.txt`;
        this.tmptestoutfile = `${process.env.TEMP}\\${this.appid}\\test_out.txt`;
        this.tmptesterrfile = `${process.env.TEMP}\\${this.appid}\\test_err.txt`;
        this.packagejsonfile = `${this.projectpath}\\package.json`;
        this.packagelockjsonfile = `${this.projectpath}\\package-lock.json`;
        this.separator = "\r\n--------\r\n";
        this.proxy = "";
        this.timeout = 5000;

        // init atcoder
        this.atcoder.taskurl = `https://atcoder.jp/contests/${this.contest}/tasks/${this.task}`;
        this.atcoder.submiturl = `https://atcoder.jp/contests/${this.contest}/submit`;
        this.atcoder.submissionsurl = `https://atcoder.jp/contests/${this.contest}/submissions/me`;
    }

    // public interface
    public async loginAtCoder() {

        // init command
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] loginurl: ${this.atcoder.loginurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.atcoder.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.atcoder.loginurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.atcoder.loginurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.atcoder.username,
                password: this.atcoder.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.atcoder.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.atcoder.username}", password="********"`;
        }

        this.channel.appendLine(`---- SUCCESS: ${this.atcoder.username} logged in ----`);
    }

    public async initTask() {

        // init command
        this.checkLogin();
        this.initProp();
        this.saveConfig();

        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.atcoder.taskurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.atcoder.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);

        // make dir
        if (!fs.existsSync(this.taskpath)) fs.mkdirSync(this.taskpath, { recursive: true });
        if (!fs.existsSync(this.testpath)) fs.mkdirSync(this.testpath, { recursive: true });

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.atcoder.loginurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.atcoder.loginurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.atcoder.username,
                password: this.atcoder.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.atcoder.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.atcoder.username}", password="********", csrf_token="${csrf_token}"`;
        }

        // get task
        this.channel.appendLine(`[${this.timestamp()}] get_task:`);
        const response = await agent.get(this.atcoder.taskurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${response.status}`);

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
            txt = txt.replace("&lt;", "<");
            txt = txt.replace("&gt;", ">");
            fs.writeFileSync(this.testfile, txt);
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" created`);
            if (txt == "") {
                this.channel.appendLine(`[${this.timestamp()}] WARN: there is no test set`);
            }
        }

        // open file
        vscode.workspace.openTextDocument(actsextension.taskfile)
            .then((a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false);
            }, (err: any) => {
                throw err;
            });
        this.channel.appendLine(`---- SUCCESS: ${this.task} initialized ----`);
    }

    public async testTask(debug: boolean): Promise<void> {

        // init command
        this.checkLogin();
        this.initProp();
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);
        this.channel.appendLine(`[${this.timestamp()}] debug: ${debug}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.atcoder.taskurl}`);

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

        // check node if typescripts
        if (this.extension == ".ts") {
            const nodemsg = ``
            if (!fs.existsSync(this.packagejsonfile) || !fs.existsSync(this.packagelockjsonfile)) {
                throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init && npm install --save-dev typescript ts-node @types/node"`;
            }
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

        // check test set
        if (ios.length == 0) {
            throw `WARN: there is no test set`;
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
                switch (that.extension) {
                    case ".ts":
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
                        break;
                    case ".py":
                        if (debug) {
                            const launchconfig = {
                                name: that.appid,
                                type: "python",
                                request: "launch",
                                program: that.taskfile,
                                args: ["<", that.tmptestinfile, ">", that.tmptestoutfile, "2>", that.tmptesterrfile],
                                console: "integratedTerminal"
                            };
                            vscode.debug.startDebugging(that.projectfolder, launchconfig);
                        } else {
                            const command = `python -u ${that.taskfile} < ${that.tmptestinfile} > ${that.tmptestoutfile} 2> ${that.tmptesterrfile}`;
                            const options = {
                                cwd: that.projectpath
                            };
                            child = child_process.exec(command, options);
                        }
                        break;
                    default:
                        reject(`ERROR: invalid extension, extension="${that.extension}"`);
                        return;
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
                                if (ex instanceof Error) {
                                    if (!ex.message.match(/EBUSY/)) {
                                        reject(ex);
                                        return;
                                    }
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
                                // check error
                                const err = fs.readFileSync(that.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
                                fs.unlinkSync(that.tmptesterrfile);
                                if (err) {
                                    that.channel.appendLine(out);
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

    public async submitTask() {

        // init command
        this.checkLogin();
        this.initProp();
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.atcoder.taskurl}`);
        this.channel.appendLine(`[${this.timestamp()}] username: ${this.atcoder.username}`);
        this.channel.appendLine(`[${this.timestamp()}] password: ********`);
        this.channel.appendLine(`[${this.timestamp()}] submiturl: ${this.atcoder.submiturl}`);

        // check taskfile
        this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}"`);
        if (!fs.existsSync(this.taskfile)) {
            throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
        }

        // get agent
        const agent = superagent.agent();

        // login get
        this.channel.appendLine(`[${this.timestamp()}] login_get:`);
        const res1 = await agent.get(this.atcoder.loginurl).proxy(this.proxy).catch(res => {
            throw `ERROR: ${res.status} ${res.message}`;
        });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res1.status}`);

        // login post
        this.channel.appendLine(`[${this.timestamp()}] login_post:`);
        const jsdom = new JSDOM(res1.text);
        const csrf_token = jsdom.window.document.querySelectorAll("input")[0].value;
        const res2 = await agent.post(this.atcoder.loginurl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.atcoder.username,
                password: this.atcoder.password,
                csrf_token: csrf_token
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.atcoder.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.atcoder.username}", password="${this.atcoder.password}", csrf_token="${csrf_token}"`;
        }

        // submit task
        this.channel.appendLine(`[${this.timestamp()}] submit_task:`);
        const code = fs.readFileSync(this.taskfile).toString();
        const res3 = await agent.post(this.atcoder.submiturl)
            .proxy(this.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                "data.TaskScreenName": this.task,
                "data.LanguageId": this.extension == ".ts" ? 4057 : this.extension == ".py" ? 4006 : 0,
                csrf_token: csrf_token,
                sourceCode: code
            }).catch(res => {
                throw `ERROR: ${res.status} ${res.message}`;
            });
        this.channel.appendLine(`[${this.timestamp()}] -> ${res3.status}`);
        this.channel.appendLine(`[${this.timestamp()}] submissionsurl: ${this.atcoder.submissionsurl}`);
        this.channel.appendLine(`---- SUCCESS: ${this.task} submitted ----`);
    }

    public async removeTask() {

        // init command
        this.checkLogin();
        this.initProp();
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.atcoder.taskurl}`);

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

    public async browseTask() {

        // init command
        this.checkLogin();
        this.initProp();
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] taskurl: ${this.atcoder.taskurl}`);

        // open browser
        vscode.env.openExternal(vscode.Uri.parse(this.atcoder.taskurl));

        this.channel.appendLine(`---- SUCCESS: browse ${this.task} ----`);
    }

    // config
    protected loadConfig() {
        if (fs.existsSync(this.configfile)) {
            const app = JSON.parse(fs.readFileSync(this.configfile).toString());
            this.site = app.site;
            this.atcoder.username = app.atcoder.username;
            this.atcoder.password = Buffer.from(app.atcoder.encpassword, "base64").toString();
            this.contest = app.contest;
            this.task = app.task;
            this.extension = app.extension;
        } else {
            this.atcoder.username = "";
            this.atcoder.password = "";
            this.task = "";
            this.extension = "";
        }
    }
    protected saveConfig() {
        const app = {
            site: this.site,
            atcoder: {
                username: this.atcoder.username,
                encpassword: Buffer.from(this.atcoder.password).toString("base64"),
            },
            contest: this.contest,
            task: this.task,
            extension: this.extension
        };
        fs.writeFileSync(this.configfile, JSON.stringify(app));
    }

    // utility
    protected timestamp(): string {
        return new Date().toLocaleString("ja-JP").split(" ")[1];
    }
};
export const actsextension = new AcTsExtension();

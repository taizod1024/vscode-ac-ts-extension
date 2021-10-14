import * as vscode from 'vscode';
import * as fs from "fs";
import superagent from "superagent";
import child_process, { ExecFileSyncOptions } from "child_process";
import { Buffer } from 'buffer';
import { atcoder } from './AtCoder';
import { yukicoder } from './Yukicoder';
import { typescript } from './TypeScript';
import { python } from './Python';

// atcoder / yukicoder 
export interface Coder {

    // prop
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage?: string;

    // method
    checkLogin(): void;
    initProp(): void;
    loginSite(): void;
    getTest(): any;
    submitTask(): void;
    browseTask(): void;
};

// python / typescript
export interface Lang {

    // method
    checkLang(): void;
    testLang(debug: boolean): any;
};

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
    public task: string;
    public extension: string;

    // prop
    public coder: Coder;
    public lang: Lang;
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

        // site specific
        this.sites = ["atcoder", "yukicoder"];

        // lang specific
        this.extensions = [".ts", ".py"];

        // init context
        this.channel = vscode.window.createOutputChannel(this.appname);
        this.channel.show(true);
        this.channel.appendLine(`[${this.timestamp()}] ${this.appname}`);

        // load config
        this.loadConfig();
    }

    public async initProp() {

        // TODO settings

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

        // site specific
        if (this.isAtcoder()) { this.coder = atcoder; }
        if (this.isYukicoder()) { this.coder = yukicoder; }

        // lang specific
        if (this.isTypeScript()) { this.lang = typescript; }
        if (this.isPython()) { this.lang = python; }

        // check and init coder
        this.coder.checkLogin();
        await this.coder.initProp();

        // check lang
        this.lang.checkLang();

        // save config
        this.saveConfig();
    }

    public async loginSite() {

        // init command
        await this.initProp();
        this.saveConfig();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);

        // login site
        this.coder.loginSite();
    }

    public async initTask() {

        // init command
        await this.initProp();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);

        // check testfile not exits
        let text;
        if (!fs.existsSync(this.testfile)) {

            // get testtext
            text = await this.coder.getTest();
        }

        // create taskfile
        if (!fs.existsSync(this.taskpath)) { fs.mkdirSync(this.taskpath, { recursive: true }); }
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
        if (!fs.existsSync(this.testpath)) { fs.mkdirSync(this.testpath, { recursive: true }); }
        if (fs.existsSync(this.testfile)) {
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" exist`);
        } else {
            fs.writeFileSync(this.testfile, text);
            this.channel.appendLine(`[${this.timestamp()}] testfile: "${this.testfile}" created`);
            if (text === "") {
                this.channel.appendLine(`[${this.timestamp()}] WARN: there is no test set`);
            }
        }

        // open file
        vscode.workspace.openTextDocument(this.taskfile)
            .then((a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false);
            }, (err: any) => {
                throw err;
            });
        this.channel.appendLine(`---- SUCCESS: ${this.task} initialized ----`);
    }

    public async testTask(debug: boolean): Promise<void> {

        // init command
        await this.initProp();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);
        this.channel.appendLine(`[${this.timestamp()}] debug: ${debug}`);

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

        // make dir
        if (!fs.existsSync(this.tmptestpath)) { fs.mkdirSync(this.tmptestpath); }

        // read testfile
        const txt = fs.readFileSync(this.testfile).toString();
        const wrk = txt.split(this.separator.trim()).map(x => x.trim());
        if (wrk[wrk.length - 1] == "") { wrk.pop(); }
        const ios: any[] = [];
        while (0 < wrk.length) {
            ios.push({
                in: wrk.shift(),
                out: wrk.shift()
            });
        }

        // check test set
        if (ios.length === 0) {
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

                // exec command if typescript
                child = that.lang.testLang(debug);

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
                                if (out === "") {
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
                                if (ng === 0) {
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

        //  init command
        await this.initProp();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);

        // check taskfile
        this.channel.appendLine(`[${this.timestamp()}] taskfile: "${this.taskfile}"`);
        if (!fs.existsSync(this.taskfile)) {
            throw `ERROR: missing taskfile="${this.taskfile}", do init task`;
        }

        // submit task
        await this.coder.submitTask();
    }

    public async removeTask() {

        // init command
        await this.initProp();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);

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
        await this.initProp();

        // show channel
        this.channel.appendLine(`[${this.timestamp()}] site: ${this.site}`);
        this.channel.appendLine(`[${this.timestamp()}] contest: ${this.contest}`);
        this.channel.appendLine(`[${this.timestamp()}] task: ${this.task}`);
        this.channel.appendLine(`[${this.timestamp()}] extension: ${this.extension}`);

        // open task
        this.coder.browseTask();

        this.channel.appendLine(`---- SUCCESS: browse ${this.task} ----`);
    }

    // config
    public loadConfig() {
        if (fs.existsSync(this.configfile)) {
            const json = JSON.parse(fs.readFileSync(this.configfile).toString());
            this.site = json.site || "";
            this.contest = json.contest || "";
            this.task = json.task || "";
            this.extension = json.extension;
            atcoder.username = json.atcoder?.username || "";
            atcoder.password = json.atcoder?.encpassword ? Buffer.from(json.atcoder?.encpassword, "base64").toString() : "";
            yukicoder.apikey = json.yukicoder?.encapikey ? Buffer.from(json.yukicoder?.encapikey, "base64").toString() : "";
        } else {
            this.site = "";
            this.contest = "";
            this.task = "";
            this.extension = "";
            atcoder.username = "";
            atcoder.password = "";
            yukicoder.apikey = "";
        }
    }
    public saveConfig() {
        const app = {
            site: this.site,
            contest: this.contest,
            task: this.task,
            extension: this.extension,
            atcoder: {
                username: atcoder.username,
                encpassword: Buffer.from(atcoder.password).toString("base64"),
            },
            yukicoder: {
                encapikey: Buffer.from(yukicoder.apikey).toString("base64"),
            }
        };
        fs.writeFileSync(this.configfile, JSON.stringify(app));
    }

    // site specific
    public isAtcoder(): boolean {
        return this.site === "atcoder";
    }
    public isYukicoder(): boolean {
        return this.site === "yukicoder";
    }

    // lang specific
    public isTypeScript(): boolean {
        return this.extension === ".ts";
    }
    public isPython(): boolean {
        return this.extension === ".py";
    }

    // message
    public responseToMessage(ex: any): string {
        let texts = [];
        if (ex.status) { texts.push(ex.status); }
        if (ex.message) { texts.push(ex.message); }
        if (ex.response?.text) { texts.push(ex.response.text); }
        let message = texts.join(" ");
        return message;
    }
    public timestamp(): string {
        return new Date().toLocaleString("ja-JP").split(" ")[1];
    }
};
export const actsextension = new AcTsExtension();

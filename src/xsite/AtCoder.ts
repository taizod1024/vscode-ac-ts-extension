import * as vscode from "vscode";
import * as fs from "fs";
import superagent from "superagent";
import * as cheerio from "cheerio";
import { acts } from "../AcTsExtension";
import { XSite } from "../XSite";
import { XLanguage } from "../XLanguage";
import { cc } from "../XExtension/Cc";
import { cpp } from "../XExtension/Cpp";
import { java } from "../XExtension/Java";
import { javascript } from "../XExtension/JavaScript";
import { python } from "../XExtension/Python";
import { typescript } from "../XExtension/TypeScript";

class AtCoder implements XSite {
    // param
    username: string;
    password: string;

    // prop
    loginurl: string;
    taskurl: string;
    submiturl: string;
    submissionsurl: string;

    // implements

    // prop
    site = "atcoder";
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage: string;
    contest: string;
    task: string;
    extension: string;
    language: string;
    xlanguages: XLanguage[];

    // method
    constructor() {
        this.contestregexp = /^(.+)$/;
        this.contestmessage = "input contest [e.g.: abc190, abc191]";
        this.taskregexp = /^(.+)_(.+)$/;
        this.taskmessage = "input task [e.g.: abc190_a, abc190_b]";
        this.loginurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";
        this.contest = "";
        this.task = "";
        this.extension = "";
        this.language = "";
        this.xlanguages = [
            {
                language: "C (GCC x.x.x)",
                xextension: cc,
                id: 4001,
            },
            {
                language: "C (Clang x.x.x)",
                xextension: cc,
                id: 4002,
            },
            {
                language: "C++ (GCC x.x.x)",
                xextension: cpp,
                id: 4003,
            },
            {
                language: "C++ (Clang x.x.x)",
                xextension: cpp,
                id: 4004,
            },
            {
                language: "Java (OpenJDK x.x.x)",
                xextension: java,
                id: 4005,
            },
            {
                language: "JavaScript (Node.js x.x.x)",
                xextension: javascript,
                id: 4030,
            },
            {
                language: "Python (x.x.x)",
                xextension: python,
                id: 4006,
            },
            {
                language: "TypeScript (x.x)",
                xextension: typescript,
                id: 4057,
            },
        ];
    }

    initPropAsync(withtask: boolean) {
        if (withtask) {
            this.taskurl = `https://atcoder.jp/contests/${this.contest}/tasks/${this.task}`;
            this.submiturl = `https://atcoder.jp/contests/${this.contest}/submit`;
            this.submissionsurl = `https://atcoder.jp/contests/${this.contest}/submissions/me`;
        }
    }

    checkLogin() {
        if (!this.username || !this.password) {
            throw "ERROR: do login site";
        }
    }

    async loginSiteAsync() {
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

    async getTestAsync() {
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

    async submitTaskAsync() {
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

    browseTask() {
        acts.channel.appendLine(`[${acts.timestamp()}] taskurl: ${this.taskurl}`);
        vscode.env.openExternal(vscode.Uri.parse(this.taskurl));
    }

    getLanguageId(): number {
        const xlanguage = this.xlanguages.find(val => val.language === this.language);
        if (!xlanguage) {
            throw `ERROR: unsupported language, language=${this.language}`;
        }
        return Number(xlanguage.id);
    }

    loadConfig(json: any) {
        atcoder.username = json.atcoder?.username || "";
        atcoder.password = json.atcoder?.encpassword ? Buffer.from(json.atcoder?.encpassword, "base64").toString() : "";
        atcoder.contest = json.atcoder?.contest;
        atcoder.task = json.atcoder?.task;
        atcoder.extension = json.atcoder?.extension;
        atcoder.language = json.atcoder?.language;
    }

    saveConfig(json: any) {
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

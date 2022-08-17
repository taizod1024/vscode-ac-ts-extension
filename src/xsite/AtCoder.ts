import * as vscode from "vscode";
import * as fs from "fs";
import superagent from "superagent";
import * as cheerio from "cheerio";
import { acts } from "../AcTsExtension";
import { XSite } from "../XSite";
import { typescript } from "../xextension/TypeScript";
import { javascript } from "../xextension/JavaScript";
import { python } from "../xextension/Python";
import { XExtension } from "../XExtension";

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
    name = "atcoder";
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage: string;
    contest: string;
    task: string;
    extension: string;

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
    }

    initPropAsync(withtask: boolean) {
        if (withtask) {
            this.taskurl = `https://atcoder.jp/contests/${acts.contest}/tasks/${acts.task}`;
            this.submiturl = `https://atcoder.jp/contests/${acts.contest}/submit`;
            this.submissionsurl = `https://atcoder.jp/contests/${acts.contest}/submissions/me`;
        }
    }

    isSelected(): boolean {
        return acts.site === "atcoder";
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
            let m1 = response.text.match(new RegExp(`<h3>入力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
            if (m1 === null) {
                break;
            }
            let m2 = response.text.match(new RegExp(`<h3>出力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
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
                "data.TaskScreenName": acts.task,
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
        if (typescript.isSelected()) {
            return 4057;
        }
        if (javascript.isSelected()) {
            return 4030;
        }
        if (python.isSelected()) {
            return 4006;
        }
        throw "ERROR: unsupported language";
    }

    loadConfig(json: any) {
        atcoder.username = json.atcoder?.username || "";
        atcoder.password = json.atcoder?.encpassword ? Buffer.from(json.atcoder?.encpassword, "base64").toString() : "";
        atcoder.contest = json.atcoder?.contest;
        atcoder.task = json.atcoder?.task;
        atcoder.extension = json.atcoder?.extension;
    }

    saveConfig(json: any) {
        json.atcoder = {};
        json.atcoder.username = atcoder.username;
        json.atcoder.encpassword = Buffer.from(atcoder.password).toString("base64");
        json.atcoder.contest = atcoder.contest;
        json.atcoder.task = atcoder.task;
        json.atcoder.extension = atcoder.extension;
    }
}
export const atcoder = new AtCoder();

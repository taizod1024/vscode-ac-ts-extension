import * as vscode from 'vscode';
import * as fs from "fs";
import superagent from "superagent";
import * as cheerio from "cheerio";
import { actsextension, Coder } from './AcTsExtension';
import { typescript } from './TypeScript';
import { python } from './Python';

class AtCoder implements Coder {

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
    taskmessage?: string;

    // method
    constructor() {

        this.contestregexp = /^(.+)$/;
        this.contestmessage = "input contest [e.g.: abc190, abc191]";
        this.taskregexp = /^(.+)_(.+)$/;
        this.taskmessage = "input task [e.g.: abc190_a, abc190_b]";
        this.loginurl = "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F&lang=ja";

    }

    initPropAsync(withtask: boolean) {

        if (withtask) {
            this.taskurl = `https://atcoder.jp/contests/${actsextension.contest}/tasks/${actsextension.task}`;
            this.submiturl = `https://atcoder.jp/contests/${actsextension.contest}/submit`;
            this.submissionsurl = `https://atcoder.jp/contests/${actsextension.contest}/submissions/me`;
        }

    }

    isSelected():boolean {
        return actsextension.site === "atcoder";
    }

    checkLogin() {

        if (!this.username || !this.password) {
            throw "ERROR: do login site";
        }

    }

    async loginSiteAsync() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.loginurl: ${this.loginurl}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.username: ${this.username}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.password: ********`);

        // get agent
        const agent = superagent.agent();

        // login get
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] login_get:`);
        const res1 = await agent.get(this.loginurl)
            .proxy(actsextension.proxy)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res1.status}`);

        // login post
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] login_post:`);
        const $ = cheerio.load(res1.text);
        const csrf_token = $("input").val();
        const res2 = await agent.post(this.loginurl)
            .proxy(actsextension.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            })
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="********"`;
        }
    }

    async getTestAsync() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.taskurl: ${this.taskurl}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.username: ${this.username}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.password: ********`);

        // get agent
        const agent = superagent.agent();

        // login get
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.login_get:`);
        const res1 = await agent.get(this.loginurl)
            .proxy(actsextension.proxy)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res1.status}`);

        // login post
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.login_post:`);
        const $ = cheerio.load(res1.text);
        const csrf_token = $("input").val();
        const res2 = await agent.post(this.loginurl)
            .proxy(actsextension.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            })
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="********", csrf_token="${csrf_token}"`;
        }

        // get task
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.get_task:`);
        const response = await agent.get(this.taskurl)
            .proxy(actsextension.proxy)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${response.status}`);

        // response to test text
        let text = "";
        let idx = 1;
        while (true) {
            let m1 = response.text.match(new RegExp(`<h3>入力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
            if (m1 === null) { break; }
            let m2 = response.text.match(new RegExp(`<h3>出力例 ${idx}<\/h3><pre>([^<]*)<\/pre>`));
            if (m2 === null) { break; }
            text += m1[1].trim() + actsextension.separator + m2[1].trim() + actsextension.separator;
            idx++;
        }
        idx--;
        text = text.replace("&lt;", "<");
        text = text.replace("&gt;", ">");

        return text;
    }

    async submitTaskAsync() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.taskurl: ${this.taskurl}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.username: ${this.username}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.password: ********`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] atcoder.submiturl: ${this.submiturl}`);

        // get agent
        const agent = superagent.agent();

        // login get
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] login_get:`);
        const res1 = await agent.get(this.loginurl)
            .proxy(actsextension.proxy)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res1.status}`);

        // login post
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] login_post:`);
        const $ = cheerio.load(res1.text);
        const csrf_token = $("input").val();
        const res2 = await agent.post(this.loginurl)
            .proxy(actsextension.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                username: this.username,
                password: this.password,
                csrf_token: csrf_token
            })
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res2.status}`);

        // check login
        if (res2.text.indexOf(`ようこそ、${this.username} さん。`) < 0) {
            throw `ERROR: atcoder login failed, userame="${this.username}", password="${this.password}", csrf_token="${csrf_token}"`;
        }

        // submit task
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] submit_task:`);
        const code = fs.readFileSync(actsextension.taskfile).toString();
        const res3 = await agent.post(this.submiturl)
            .proxy(actsextension.proxy)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({
                "data.TaskScreenName": actsextension.task,
                "data.LanguageId": this.getLanguageId(),
                csrf_token: csrf_token,
                sourceCode: code
            })
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res3.status}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] submissionsurl: ${this.submissionsurl}`);
    }

    browseTask() {
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] taskurl: ${this.taskurl}`);
        vscode.env.openExternal(vscode.Uri.parse(this.taskurl));
    }

    getLanguageId(): number {
        if (typescript.isSelected()) { return 4057; }
        if (python.isSelected()) { return 4006; }
        return 0;
    }

    loadConfig(json: any) {
        atcoder.username = json.atcoder?.username || "";
        atcoder.password = json.atcoder?.encpassword ? Buffer.from(json.atcoder?.encpassword, "base64").toString() : "";
    }

    saveConfig(json: any) {
        json.atcoder = {};
        json.atcoder.username = atcoder.username;
        json.atcoder.encpassword = Buffer.from(atcoder.password).toString("base64");
    }
};
export const atcoder = new AtCoder();

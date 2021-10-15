import * as vscode from 'vscode';
import * as fs from "fs";
import superagent from "superagent";
import { actsextension, Coder } from './AcTsExtension';

class Yukicoder implements Coder {

    // param
    apikey: string;
    problemid: string;

    // prop
    problemnourl: string;
    api_problemnourl: string;
    api_problemidurl: string;
    api_submiturl: string;
    submissionsurl: string;

    // implements
    contestregexp: RegExp;
    contestmessage: string;
    taskregexp: RegExp;
    taskmessage?: string;

    constructor() {

        this.contestregexp = /^[0-9]+$/;
        this.contestmessage = "input contestid from url [e.g.: 314, 315]";
        this.taskregexp = /^[0-9]+$/;
        this.taskmessage = "input problemno from url [e.g.: 1680, 1681]";
    }

    async initProp(withtask: boolean) {

        if (withtask) {

            this.problemnourl = `https://yukicoder.me/problems/no/${actsextension.task}`;
            this.api_problemnourl = `https://yukicoder.me/api/v1/problems/no/${actsextension.task}`;

            // problemno to problemid
            this.problemid = await (async () => {
                const agent = superagent.agent()
                    .set("accept", "application/json")
                    .set("Authorization", `Bearer ${this.apikey}`);
                const res = await agent.get(this.api_problemnourl)
                    .proxy(actsextension.proxy)
                    .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
                return JSON.parse(res.text).ProblemId;
            })();
            this.api_problemidurl = `https://yukicoder.me/api/v1/problems/${this.problemid}`;
            this.api_submiturl = `https://yukicoder.me/api/v1/problems/${this.problemid}/submit`;
            this.submissionsurl = `https://yukicoder.me/problems/no/${actsextension.task}/submissions?status=&lang_id=&my_submission=enabled`;
        }
    }

    checkLogin() {
        if (!this.apikey) {
            throw "ERROR: do login site";
        }
    }

    async loginSite() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.apikey: ********`);
    }

    async getTest() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.problemnourll: ${this.problemnourl}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.apikey: ********`);

        // get agent
        const agent = superagent.agent()
            .set("accept", "application/json")
            .set("Authorization", `Bearer ${this.apikey}`);

        // get file list
        let fileiurl = `${this.api_problemidurl}/file/in`;
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.fileinurl: ${fileiurl}`);
        const resfilei = await agent.get(fileiurl)
            .proxy(actsextension.proxy)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${resfilei.status}`);

        // get file
        let text = "";
        let filei = JSON.parse(resfilei.text);
        for (let nx = 0; nx < filei.length; nx++) {

            // filename
            let fileix = filei[nx];

            // get response
            let fileixurl = `${this.api_problemidurl}/file/in/${fileix}`;
            actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.fileiurl-${nx}: ${fileixurl}`);
            const resfileix = await agent.get(fileixurl)
                .proxy(actsextension.proxy)
                .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });

            let fileoxurl = `${this.api_problemidurl}/file/out/${fileix}`;
            actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.fileourl-${nx}: ${fileoxurl}`);
            const resfileox = await agent.get(fileoxurl)
                .proxy(actsextension.proxy)
                .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });

            // response to test text
            text += resfileix.text.trim() + actsextension.separator;
            text += resfileox.text.trim() + actsextension.separator;
        }

        return text;
    }

    async submitTask() {

        // show channel
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.problemnourll: ${this.problemnourl}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.apikey: ********`);

        // get agent
        const agent = superagent.agent()
            .set("accept", "application/json")
            .set("Authorization", `Bearer ${this.apikey}`);

        // submit task
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] yukicoder.api_submiturl: ${this.api_submiturl}`);
        const code = fs.readFileSync(actsextension.taskfile).toString();
        const res3 = await agent.post(this.api_submiturl)
            .proxy(actsextension.proxy)
            .set("Content-Type", "multipart/form-data")
            .field('lang', this.getLanguage())
            .field("source", code)
            .catch(res => { throw `ERROR: ${actsextension.responseToMessage(res)}`; });
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] -> ${res3.status}`);
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] submissionsurl: ${this.submissionsurl}`);
    }

    browseTask() {
        actsextension.channel.appendLine(`[${actsextension.timestamp()}] taskurl: ${this.api_problemidurl}`);
        vscode.env.openExternal(vscode.Uri.parse(this.problemnourl));
    }

    getLanguage(): string {
        if (actsextension.isTypeScript()) { return "typescript"; }
        if (actsextension.isPython()) { return "python3"; }
        return "";
    }
};
export const yukicoder = new Yukicoder();

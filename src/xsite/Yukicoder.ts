import * as vscode from "vscode";
import * as fs from "fs";
import superagent from "superagent";
import { acts } from "../AcTsExtension";
import { XSite } from "../XSite";
import { XLanguage } from "../XLanguage";
import { cc } from "../xextension/Cc";
import { cpp } from "../xextension/Cpp";
import { java } from "../xextension/Java";
import { javascript } from "../xextension/JavaScript";
import { python } from "../xextension/Python";
import { typescript } from "../xextension/TypeScript";

class Yukicoder implements XSite {
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

    // prop
    site: string;
    siteurl: string;
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
        this.site = "yukicoder";
        this.siteurl = "https://yukicoder.me/";
        this.contestregexp = /^[0-9]+$/;
        this.contestmessage = "input contestid from url [e.g.: 314, 315]";
        this.taskregexp = /^[0-9]+$/;
        this.taskmessage = "input problemno from url [e.g.: 1680, 1681]";
        this.contest = "";
        this.task = "";
        this.extension = "";
        this.language = "";
        this.xlanguages = [
            {
                language: "C++14 (gcc 11.2.0 + boost 1.78.0)",
                xextension: cpp,
                id: "cpp14",
            },
            {
                language: "C++17 (gcc 11.2.0 + boost 1.78.0",
                xextension: cpp,
                id: "cpp17",
            },
            {
                language: "C++17(clang  Beta) (gcc 10.0.0 + boost 1.78.0)",
                xextension: cpp,
                id: "cpp-clang",
            },
            {
                language: "C++23(draft) (gcc 11.2.0 + boost 1.78.0)",
                xextension: cpp,
                id: "cpp23",
            },
            {
                language: "C++11 (gcc 8.5.0)",
                xextension: cpp,
                id: "cpp",
            },
            {
                language: "C (gcc 11.2.0)",
                xextension: cc,
                id: "c11",
            },
            {
                language: "C90 (gcc 8.5.0)",
                xextension: cc,
                id: "c",
            },
            {
                language: "Java17 (openjdk 17.0.1)",
                xextension: java,
                id: "java8",
            },
            {
                language: "Python3 (3.10.1 + numpy 1.22.3 + scipy 1.8.0)",
                xextension: python,
                id: "python3",
            },
            {
                language: "JavaScript (node v17.7.1)",
                xextension: javascript,
                id: "node",
            },
            {
                language: "TypeScript (4.6.2)",
                xextension: typescript,
                id: "typescript",
            },
        ];
    }

    async initPropAsync(withtask: boolean) {
        if (withtask) {
            this.problemnourl = `https://yukicoder.me/problems/no/${this.task}`;
            this.api_problemnourl = `https://yukicoder.me/api/v1/problems/no/${this.task}`;

            // problemno to problemid
            this.problemid = await (async () => {
                const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);
                const res = await agent
                    .get(this.api_problemnourl)
                    .proxy(acts.proxy)
                    .catch(res => {
                        throw `ERROR: ${acts.responseToMessage(res)}`;
                    });
                return JSON.parse(res.text).ProblemId;
            })();
            this.api_problemidurl = `https://yukicoder.me/api/v1/problems/${this.problemid}`;
            this.api_submiturl = `https://yukicoder.me/api/v1/problems/${this.problemid}/submit`;
            this.submissionsurl = `https://yukicoder.me/problems/no/${this.task}/submissions?status=&lang_id=&my_submission=enabled`;
        }
    }

    checkLogin() {
        if (!this.apikey) {
            throw "ERROR: do login site";
        }
    }

    async loginSiteAsync() {
        // show channel
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.apikey: ********`);
    }

    async getTestAsync() {
        // show channel
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.problemnourl: ${this.problemnourl}`);
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.apikey: ********`);

        // get agent
        const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);

        // get file list
        let fileiurl = `${this.api_problemidurl}/file/in`;
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.fileinurl: ${fileiurl}`);
        const resfilei = await agent
            .get(fileiurl)
            .proxy(acts.proxy)
            .catch(res => {
                throw `ERROR: ${acts.responseToMessage(res)}`;
            });
        acts.channel.appendLine(`[${acts.timestamp()}] -> ${resfilei.status}`);

        // get file
        let text = "";
        let filei = JSON.parse(resfilei.text);
        for (let nx = 0; nx < filei.length; nx++) {
            // filename
            let fileix = filei[nx];

            // get response
            let fileixurl = `${this.api_problemidurl}/file/in/${fileix}`;
            acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.fileiurl-${nx}: ${fileixurl}`);
            const resfileix = await agent
                .get(fileixurl)
                .proxy(acts.proxy)
                .catch(res => {
                    throw `ERROR: ${acts.responseToMessage(res)}`;
                });

            let fileoxurl = `${this.api_problemidurl}/file/out/${fileix}`;
            acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.fileourl-${nx}: ${fileoxurl}`);
            const resfileox = await agent
                .get(fileoxurl)
                .proxy(acts.proxy)
                .catch(res => {
                    throw `ERROR: ${acts.responseToMessage(res)}`;
                });

            // response to test text
            text += resfileix.text.trim() + acts.separator;
            text += resfileox.text.trim() + acts.separator;
        }

        return text;
    }

    async submitTaskAsync() {
        // show channel
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.problemnourl: ${this.problemnourl}`);
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.apikey: ********`);

        // get agent
        const agent = superagent.agent().set("accept", "application/json").set("Authorization", `Bearer ${this.apikey}`);

        // submit task
        acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.api_submiturl: ${this.api_submiturl}`);
        const code = fs.readFileSync(acts.taskfile).toString();
        const res3 = await agent
            .post(this.api_submiturl)
            .proxy(acts.proxy)
            .set("Content-Type", "multipart/form-data")
            .field("lang", this.getLanguageId())
            .field("source", code)
            .catch(res => {
                throw `ERROR: ${acts.responseToMessage(res)}`;
            });
        acts.channel.appendLine(`[${acts.timestamp()}] -> ${res3.status}`);
        acts.channel.appendLine(`[${acts.timestamp()}] submissionsurl: ${this.submissionsurl}`);
    }

    browseTask() {
        acts.channel.appendLine(`[${acts.timestamp()}] taskurl: ${this.api_problemidurl}`);
        vscode.env.openExternal(vscode.Uri.parse(this.problemnourl));
    }

    getLanguageId(): string {
        const xlanguage = this.xlanguages.find(val => val.language === this.language);
        if (!xlanguage) {
            throw `ERROR: unsupported language, language=${this.language}`;
        }
        return String(xlanguage.id);
    }

    loadState(json: any) {
        yukicoder.apikey = json.yukicoder?.encapikey ? Buffer.from(json.yukicoder?.encapikey, "base64").toString() : "";
        yukicoder.contest = json.yukicoder?.contest;
        yukicoder.task = json.yukicoder?.task;
        yukicoder.extension = json.yukicoder?.extension;
        yukicoder.language = json.yukicoder?.language;
    }

    saveState(json: any) {
        json.yukicoder = {};
        json.yukicoder.encapikey = Buffer.from(yukicoder.apikey).toString("base64");
        json.yukicoder.contest = yukicoder.contest;
        json.yukicoder.task = yukicoder.task;
        json.yukicoder.extension = yukicoder.extension;
        json.yukicoder.language = yukicoder.language;
    }
}
export const yukicoder = new Yukicoder();

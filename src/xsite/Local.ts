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
import { user1 } from "../xextension/User1";

class Local implements XSite {
    // implements

    // prop
    site: string;
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
        this.site = "local";
        this.contestregexp = /^(.+)$/;
        this.contestmessage = "input contest [e.g.: local01, local02]";
        this.taskregexp = /^(.+)_(.+)$/;
        this.taskmessage = "input task [e.g.: local01_a, local01_b]";
        this.contest = "";
        this.task = "";
        this.extension = "";
        this.language = "";
        this.xlanguages = [
            { id: 1, language: "C", xextension: cc },
            { id: 2, language: "C++", xextension: cpp },
            { id: 3, language: "Java", xextension: java },
            { id: 4, language: "Python", xextension: python },
            { id: 5, language: "JavaScript", xextension: javascript },
            { id: 6, language: "TypeScript", xextension: typescript },
            { id: 7, language: "User1", xextension: user1 },
        ];
    }

    async initPropAsync(_withtask: boolean) {}

    checkLogin() {}

    async loginSiteAsync() {
        throw "ERROR: unable to login at local";
    }

    async getTestAsync() {
        let text = "stdin" + acts.separator + "stdout" + acts.separator;
        return text;
    }

    async submitTaskAsync() {
        throw "ERROR: unable to submit at local";
    }

    browseTask() {
        throw "ERROR: unable to browse at local";
    }

    getLanguageId(): string {
        return "";
    }

    loadState(json: any) {
        local.contest = json.local?.contest;
        local.task = json.local?.task;
        local.extension = json.local?.extension;
        local.language = json.local?.language;
    }

    saveState(json: any) {
        json.local = {};
        json.local.contest = local.contest;
        json.local.task = local.task;
        json.local.extension = local.extension;
        json.local.language = local.language;
    }
}
export const local = new Local();

import * as vscode from "vscode";
import superagent from "superagent";
require("superagent-proxy")(superagent);
import { actshelper } from "./AcTsHelper";
import { acts } from "./AcTsExtension";
import { atcoder } from "./XSite/AtCoder";
import { yukicoder } from "./XSite/Yukicoder";

// extension entrypoint
export function activate(context: vscode.ExtensionContext) {
    (function () {
        const cmdid = "loginSite";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                // select site
                let idx = acts.sites.indexOf(acts.site);
                if (1 <= idx) {
                    acts.sites.splice(idx, 1);
                    acts.sites.unshift(acts.site);
                }
                vscode.window
                    .showQuickPick(acts.sites, {
                        placeHolder: "SELECT SITE",
                    })
                    .then(site => {
                        if (site === undefined) {
                            return;
                        }
                        if (site === "atcoder") {
                            // input username
                            vscode.window
                                .showInputBox({
                                    prompt: "input username",
                                    value: atcoder.username,
                                    ignoreFocusOut: true,
                                    placeHolder: "ATCODER USERNAME",
                                })
                                .then(username => {
                                    if (!username) {
                                        return;
                                    }
                                    // input password
                                    vscode.window
                                        .showInputBox({
                                            prompt: "input password",
                                            value: atcoder.password,
                                            ignoreFocusOut: true,
                                            placeHolder: "ATCODER PASSWORD",
                                            password: true,
                                        })
                                        .then(password => {
                                            if (!password) {
                                                return;
                                            }
                                            // exec command
                                            acts.site = site;
                                            atcoder.username = username;
                                            atcoder.password = password;
                                            acts.loginSiteAsync().catch(ex => {
                                                acts.channel.appendLine("**** " + ex + " ****");
                                            });
                                        });
                                });
                        }
                        if (site === "yukicoder") {
                            // input apikey
                            vscode.window
                                .showInputBox({
                                    prompt: "input apikey",
                                    value: yukicoder.apikey,
                                    ignoreFocusOut: true,
                                    placeHolder: "YUKICODER APIKEY",
                                    password: true,
                                })
                                .then(apikey => {
                                    if (!apikey) {
                                        return;
                                    }
                                    // exec command
                                    acts.site = site;
                                    yukicoder.apikey = apikey;
                                    acts.loginSiteAsync().catch(ex => {
                                        acts.channel.appendLine("**** " + ex + " ****");
                                    });
                                });
                        }
                    });
            })
        );
    })();

    (function () {
        const cmdid = "initTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                // select site
                let idx = acts.sites.indexOf(acts.site);
                if (1 <= idx) {
                    acts.sites.splice(idx, 1);
                    acts.sites.unshift(acts.site);
                }
                vscode.window
                    .showQuickPick(acts.sites, {
                        placeHolder: "SELECT SITE",
                    })
                    .then(site => {
                        if (site === undefined) {
                            return;
                        }
                        // 本来はsiteをインデックスでアクセスしたいが"string cannot be used to index"のエラーあり
                        let contestregexp: RegExp;
                        let contestmessage: string;
                        let taskregexp: RegExp;
                        let taskmessage: string;
                        let contest: string;
                        let task: string;
                        let extension: string;
                        let language: string;
                        // TODO site依存データの読込・保存タイミングが整理できていない
                        // load site depending data
                        try {
                            if (site === "atcoder") {
                                atcoder.checkLogin();
                                contestregexp = atcoder.contestregexp;
                                contestmessage = atcoder.contestmessage;
                                taskregexp = atcoder.taskregexp;
                                taskmessage = atcoder.taskmessage;
                                contest = atcoder.contest;
                                task = atcoder.task;
                                extension = atcoder.extension;
                                language = atcoder.language;
                            }
                            if (site === "yukicoder") {
                                yukicoder.checkLogin();
                                contestregexp = yukicoder.contestregexp;
                                contestmessage = yukicoder.contestmessage;
                                taskregexp = yukicoder.taskregexp;
                                taskmessage = yukicoder.taskmessage;
                                contest = yukicoder.contest;
                                task = yukicoder.task;
                                extension = yukicoder.extension;
                                language = yukicoder.language;
                            }
                        } catch (ex) {
                            acts.channel.appendLine("**** " + ex + " ****");
                            return;
                        }
                        // input contest
                        vscode.window
                            .showInputBox({
                                prompt: contestmessage,
                                ignoreFocusOut: true,
                                value: contest,
                                validateInput: param => {
                                    return contestregexp.test(param) ? "" : contestmessage;
                                },
                            })
                            .then(contest => {
                                if (contest === undefined) {
                                    return;
                                }
                                // input task
                                vscode.window
                                    .showInputBox({
                                        prompt: taskmessage,
                                        ignoreFocusOut: true,
                                        value: task,
                                        validateInput: param => {
                                            return taskregexp.test(param) ? "" : taskmessage;
                                        },
                                    })
                                    .then(task => {
                                        if (task === undefined) {
                                            return;
                                        }
                                        // select extension
                                        let idx = acts.extensions.indexOf(extension);
                                        if (1 <= idx) {
                                            acts.extensions.splice(idx, 1);
                                            acts.extensions.unshift(extension);
                                        }
                                        vscode.window
                                            .showQuickPick(acts.extensions, {
                                                placeHolder: "SELECT EXTENSION",
                                            })
                                            .then(extension => {
                                                if (extension === undefined) {
                                                    return;
                                                }
                                                // save site depending data
                                                if (site === "atcoder") {
                                                    atcoder.contest = contest;
                                                    atcoder.task = task;
                                                    atcoder.extension = extension;
                                                    atcoder.language = language;
                                                }
                                                if (site === "yukicoder") {
                                                    yukicoder.contest = contest;
                                                    yukicoder.task = task;
                                                    yukicoder.extension = extension;
                                                    yukicoder.language = language;
                                                }
                                                // exec command
                                                acts.site = site;
                                                acts.contest = contest;
                                                acts.task = task;
                                                acts.extension = extension;
                                                acts.initTaskAsync().catch(ex => {
                                                    acts.channel.appendLine("**** " + ex + " ****");
                                                });
                                            });
                                    });
                            });
                    });
            })
        );
    })();

    (function () {
        const cmdid = "reinitTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // input select extension
                let idx = acts.extensions.indexOf(acts.extension);
                if (1 <= idx) {
                    acts.extensions.splice(idx, 1);
                    acts.extensions.unshift(acts.extension);
                }
                vscode.window
                    .showQuickPick(acts.extensions, {
                        placeHolder: "SELECT EXTENSION",
                    })
                    .then(extension => {
                        if (extension === undefined) {
                            return;
                        }
                        // exec command
                        acts.extension = extension;
                        acts.initTaskAsync().catch(ex => {
                            acts.channel.appendLine("**** " + ex + " ****");
                        });
                    });
            })
        );
    })();

    (function () {
        const cmdid = "testTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.testTaskAsync(false).catch(ex => {
                    acts.channel.appendLine("**** " + ex + " ****");
                });
            })
        );
    })();

    (function () {
        const cmdid = "debugTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.testTaskAsync(true).catch(ex => {
                    acts.channel.appendLine("**** " + ex + " ****");
                });
            })
        );
    })();

    (function () {
        const cmdid = "submitTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // select language
                let languages: string[];
                if (acts.site === "atcoder") {
                    languages = atcoder.xlanguages.filter(val => val.xextension.extension === acts.extension).map(val => val.language);
                }
                if (acts.site === "yukicoder") {
                    languages = yukicoder.xlanguages.filter(val => val.xextension.extension === acts.extension).map(val => val.language);
                }
                let idx = acts.extensions.indexOf(acts.language);
                if (1 <= idx) {
                    languages.splice(idx, 1);
                    languages.unshift(acts.language);
                }
                vscode.window
                    .showQuickPick(languages, {
                        placeHolder: "SELECT LANGUAGE",
                    })
                    .then(language => {
                        if (language === undefined) {
                            return;
                        }
                        // save site depending data
                        if (acts.site === "atcoder") {
                            atcoder.contest = acts.contest;
                            atcoder.task = acts.task;
                            atcoder.extension = acts.extension;
                            atcoder.language = language;
                        }
                        if (acts.site === "yukicoder") {
                            yukicoder.contest = acts.contest;
                            yukicoder.task = acts.task;
                            yukicoder.extension = acts.extension;
                            yukicoder.language = language;
                        }
                        // exec command
                        acts.language = language;
                        acts.submitTaskAsync().catch(ex => {
                            acts.channel.appendLine("**** " + ex + " ****");
                        });
                    });
            })
        );
    })();

    (function () {
        const cmdid = "removeTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // input confirm
                vscode.window
                    .showQuickPick(["REMOVE"], {
                        placeHolder: "PRESS ESC TO EXIT",
                    })
                    .then(confirm => {
                        if (confirm !== "REMOVE") {
                            return;
                        }
                        // exec command
                        acts.removeTaskAsync().catch(ex => {
                            acts.channel.appendLine("**** " + ex + " ****");
                        });
                    });
            })
        );
    })();

    (function () {
        const cmdid = "browseTask";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // check condition
                if (!actshelper.checkProjectPath()) {
                    return;
                }
                if (!actshelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.browseTaskAsync().catch(ex => {
                    acts.channel.appendLine("**** " + ex + " ****");
                });
            })
        );
    })();
}
export function deactivate() {}

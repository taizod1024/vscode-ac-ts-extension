import * as vscode from "vscode";
import superagent from "superagent";
require("superagent-proxy")(superagent);
import { extensionhelper } from "./extensionHelper";
import { acts } from "./AcTsExtension";
import { atcoder } from "./xsite/AtCoder";
import { yukicoder } from "./xsite/Yukicoder";
import { local } from "./xsite/Local";

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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                // select site
                vscode.window
                    .showQuickPick(extensionhelper.moveToHead(acts.sites, acts.site), {
                        placeHolder: "SELECT SITE",
                    })
                    .then(site => {
                        if (site === undefined) {
                            return;
                        }
                        if (site === atcoder.site) {
                            acts.channel.appendLine(`[${acts.timestamp()}] atcoder.siteurl: ${atcoder.siteurl}`);
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
                                                acts.channel.appendLine(`**** ${ex} ****`);
                                            });
                                        });
                                });
                        }
                        if (site === "yukicoder") {
                            acts.channel.appendLine(`[${acts.timestamp()}] yukicoder.siteurl: ${yukicoder.siteurl}`);
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
                                        acts.channel.appendLine(`**** ${ex} ****`);
                                    });
                                });
                        }
                        if (site === "local") {
                            // exec command
                            acts.site = site;
                            acts.loginSiteAsync().catch(ex => {
                                acts.channel.appendLine(`**** ${ex} ****`);
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                // select site
                vscode.window
                    .showQuickPick(extensionhelper.moveToHead(acts.sites, acts.site), {
                        placeHolder: "SELECT SITE",
                    })
                    .then(site => {
                        if (site === undefined) {
                            return;
                        }
                        acts.site = site;
                        let contest: string;
                        let task: string;
                        let extension: string;
                        let language: string;
                        // TODO site依存データの読込・保存タイミングが整理できていない
                        // load site depending data
                        try {
                            acts.xsite.checkLogin();
                            contest = acts.xsite.contest;
                            task = acts.xsite.task;
                            extension = acts.xsite.extension;
                            language = acts.xsite.language;
                        } catch (ex) {
                            acts.channel.appendLine(`**** ${ex} ****`);
                            return;
                        }
                        // input contest
                        vscode.window
                            .showInputBox({
                                prompt: acts.xsite.contestmessage,
                                ignoreFocusOut: true,
                                value: contest,
                                validateInput: param => {
                                    return acts.xsite.contestregexp.test(param) ? "" : acts.xsite.contestmessage;
                                },
                            })
                            .then(contest => {
                                if (contest === undefined) {
                                    return;
                                }
                                // input task
                                vscode.window
                                    .showInputBox({
                                        prompt: acts.xsite.taskmessage,
                                        ignoreFocusOut: true,
                                        value: task,
                                        validateInput: param => {
                                            return acts.xsite.taskregexp.test(param) ? "" : acts.xsite.taskmessage;
                                        },
                                    })
                                    .then(task => {
                                        if (task === undefined) {
                                            return;
                                        }
                                        // select extension
                                        vscode.window
                                            .showQuickPick(extensionhelper.moveToHead(acts.extensions, extension), {
                                                placeHolder: "SELECT EXTENSION",
                                            })
                                            .then(extension => {
                                                if (extension === undefined) {
                                                    return;
                                                }
                                                // save site depending data
                                                acts.xsite.contest = contest;
                                                acts.xsite.task = task;
                                                acts.xsite.extension = extension;
                                                // exec command
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // select extension
                vscode.window
                    .showQuickPick(extensionhelper.moveToHead(acts.extensions, acts.xsite.extension), {
                        placeHolder: "SELECT EXTENSION",
                    })
                    .then(extension => {
                        if (extension === undefined) {
                            return;
                        }
                        // save site depending data
                        acts.xsite.extension = extension;
                        // exec command
                        acts.initTaskAsync().catch(ex => {
                            acts.channel.appendLine(`**** ${ex} ****`);
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.testTaskAsync(false).catch(ex => {
                    acts.channel.appendLine(`**** ${ex} ****`);
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.testTaskAsync(true).catch(ex => {
                    acts.channel.appendLine(`**** ${ex} ****`);
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // select language
                let languages: string[];
                if (acts.site === "atcoder") {
                    languages = atcoder.xlanguages.filter(val => val.xextension.extension === acts.xsite.extension).map(val => val.language);
                }
                if (acts.site === "yukicoder") {
                    languages = yukicoder.xlanguages.filter(val => val.xextension.extension === acts.xsite.extension).map(val => val.language);
                }
                if (acts.site === "local") {
                    languages = local.xlanguages.filter(val => val.xextension.extension === acts.xsite.extension).map(val => val.language);
                }
                vscode.window
                    .showQuickPick(extensionhelper.moveToHead(languages, acts.xsite.language), {
                        placeHolder: "SELECT LANGUAGE",
                    })
                    .then(language => {
                        if (language === undefined) {
                            return;
                        }
                        // save site depending data
                        acts.xsite.language = language;
                        // exec command
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // input confirm
                vscode.window
                    .showQuickPick(["REMOVE TASK"], {
                        placeHolder: "PRESS ESC TO EXIT",
                    })
                    .then(confirm => {
                        if (confirm !== "REMOVE TASK") {
                            return;
                        }
                        // exec command
                        acts.removeTaskAsync().catch(ex => {
                            acts.channel.appendLine(`**** ${ex} ****`);
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
                if (!extensionhelper.checkProjectPath()) {
                    return;
                }
                if (!extensionhelper.checkActiveFile()) {
                    return;
                }
                // exec command
                acts.browseTaskAsync().catch(ex => {
                    acts.channel.appendLine(`**** ${ex} ****`);
                });
            })
        );
    })();

    (function () {
        const cmdid = "clearState";
        context.subscriptions.push(
            vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, () => {
                acts.channel.show(true);
                acts.channel.clear();
                acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
                acts.vscodeextensionpath = context.extensionPath;
                // input confirm
                vscode.window
                    .showQuickPick(["CLEAR STATE"], {
                        placeHolder: "PRESS ESC TO EXIT",
                    })
                    .then(confirm => {
                        if (confirm !== "CLEAR STATE") {
                            return;
                        }
                        // exec command
                        acts.clearStateAsync().catch(ex => {
                            acts.channel.appendLine(`**** ${ex} ****`);
                        });
                    });
            })
        );
    })();
}
export function deactivate() {}

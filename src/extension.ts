import * as vscode from 'vscode';
import superagent from "superagent";
require('superagent-proxy')(superagent);
import { actshelper } from './AcTsHelper';
import { actsextension } from './AcTsExtension';
import { atcoder } from './AtCoder';
import { yukicoder } from './Yukicoder';

// extension entrypoint
export function activate(context: vscode.ExtensionContext) {

    (function () {
        const cmdid = "loginSite";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // select site
            let idx = actsextension.sites.indexOf(actsextension.site);
            if (1 <= idx) {
                actsextension.sites.splice(idx, 1);
                actsextension.sites.unshift(actsextension.site);
            }
            vscode.window.showQuickPick(actsextension.sites, {
                placeHolder: "SELECT SITE",
            }).then((site) => {
                if (site === undefined) { return; }
                if (site === "atcoder") {
                    // input username
                    vscode.window.showInputBox({
                        prompt: 'input username',
                        value: atcoder.username,
                        ignoreFocusOut: true,
                        placeHolder: "ATCODER USERNAME"
                    }).then((username) => {
                        if (!username) { return; }
                        // input password
                        vscode.window.showInputBox({
                            prompt: 'input password',
                            value: atcoder.password,
                            ignoreFocusOut: true,
                            placeHolder: "ATCODER PASSWORD",
                            password: true
                        }).then((password) => {
                            if (!password) { return; }
                            // exec command
                            actsextension.site = site;
                            atcoder.username = username;
                            atcoder.password = password;
                            actsextension.loginSite()
                                .catch((ex) => {
                                    actsextension.channel.appendLine("**** " + ex + " ****");
                                });
                        });
                    });
                }
                if (site === "yukicoder") {
                    // input apikey
                    vscode.window.showInputBox({
                        prompt: 'input apikey',
                        value: yukicoder.apikey,
                        ignoreFocusOut: true,
                        placeHolder: "YUKICODER APIKEY",
                        password: true
                    }).then((apikey) => {
                        if (!apikey) { return; }
                        // exec command
                        actsextension.site = site;
                        yukicoder.apikey = apikey;
                        actsextension.loginSite()
                            .catch((ex) => {
                                actsextension.channel.appendLine("**** " + ex + " ****");
                            });
                    });
                }
            });
        }));
    })();

    (function () {
        const cmdid = "initTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            // select site
            let idx = actsextension.sites.indexOf(actsextension.site);
            if (1 <= idx) {
                actsextension.sites.splice(idx, 1);
                actsextension.sites.unshift(actsextension.site);
            }
            vscode.window.showQuickPick(actsextension.sites, {
                placeHolder: "SELECT SITE",
            }).then((site) => {
                if (site === undefined) { return; }
                // 本来はsiteをインデックスでアクセスしたいが"string cannot be used to index"のエラーあり
                let contestregexp: RegExp;
                let contestmessage: string;
                let taskregexp: RegExp;
                let taskmessage: string;
                if (site === "atcoder") {
                    contestregexp = atcoder.contestregexp;
                    contestmessage = atcoder.contestmessage;
                    taskregexp = atcoder.taskregexp;
                    taskmessage = atcoder.taskmessage;
                }
                if (site === "yukicoder") {
                    contestregexp = yukicoder.contestregexp;
                    contestmessage = yukicoder.contestmessage;
                    taskregexp = yukicoder.taskregexp;
                    taskmessage = yukicoder.taskmessage;
                }
                // input contest
                vscode.window.showInputBox({
                    prompt: contestmessage,
                    ignoreFocusOut: true,
                    value: actsextension.contest,
                    validateInput: param => { return contestregexp.test(param) ? '' : contestmessage; }
                }).then((contest) => {
                    if (contest === undefined) { return; }
                    // input task
                    vscode.window.showInputBox({
                        prompt: taskmessage,
                        ignoreFocusOut: true,
                        value: actsextension.task,
                        validateInput: param => { return taskregexp.test(param) ? '' : taskmessage; }
                    }).then((task) => {
                        if (task === undefined) { return; }
                        // select extension
                        let idx = actsextension.extensions.indexOf(actsextension.extension);
                        if (1 <= idx) {
                            actsextension.extensions.splice(idx, 1);
                            actsextension.extensions.unshift(actsextension.extension);
                        }
                        vscode.window.showQuickPick(actsextension.extensions, {
                            placeHolder: "SELECT EXTENSION",
                        }).then(extension => {
                            if (extension === null) { return; }
                            // exec command
                            actsextension.site = site;
                            actsextension.contest = contest;
                            actsextension.task = task;
                            actsextension.extension = extension;
                            actsextension.initTask()
                                .catch((ex) => {
                                    actsextension.channel.appendLine("**** " + ex + " ****");
                                });
                        });
                    });
                });
            });
        }));
    })();

    (function () {
        const cmdid = "reinitTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // input select extension
            let idx = actsextension.extensions.indexOf(actsextension.extension);
            if (1 <= idx) {
                actsextension.extensions.splice(idx, 1);
                actsextension.extensions.unshift(actsextension.extension);
            }
            vscode.window.showQuickPick(actsextension.extensions, {
                placeHolder: "SELECT EXTENSION",
            }).then(extension => {
                if (extension === null) { return; }
                // exec command
                actsextension.extension = extension;
                actsextension.initTask()
                    .catch((ex) => {
                        actsextension.channel.appendLine("**** " + ex + " ****");
                    });
            });
        }));
    })();

    (function () {
        const cmdid = "testTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // exec command
            actsextension.testTask(false)
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();

    (function () {
        const cmdid = "debugTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // exec command
            actsextension.testTask(true)
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();

    (function () {
        const cmdid = "submitTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // exec command
            actsextension.submitTask()
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();

    (function () {
        const cmdid = "removeTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // input confirm
            vscode.window.showQuickPick(["REMOVE"], {
                placeHolder: "PRESS ESC TO EXIT"
            }).then(confirm => {
                if (confirm !== "REMOVE") { return; }
                // exec command
                actsextension.removeTask()
                    .catch((ex) => {
                        actsextension.channel.appendLine("**** " + ex + " ****");
                    });
            });
        }));
    })();

    (function () {
        const cmdid = "browseTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // check condition
            if (!actshelper.checkProjectPath()) { return; }
            if (!actshelper.checkActiveFile()) { return; }
            // exec command
            actsextension.browseTask()
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();
}
export function deactivate() { }

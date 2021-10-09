import * as vscode from 'vscode';
import superagent from "superagent";
require('superagent-proxy')(superagent);
import { actshelper } from './AcTsHelper';
import { actsextension } from './AcTsExtension';

// extension entrypoint
export function activate(context: vscode.ExtensionContext) {
    (function () {
        const cmdid = "loginAtCoder";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            actsextension.vscodeextensionpath = context.extensionPath;
            // input username
            vscode.window.showInputBox({
                prompt: 'input username',
                value: actsextension.atcoder.username,
                ignoreFocusOut: true,
                placeHolder: "ATCODER USERNAME"
            }).then((username) => {
                if (!username) return;
                // input password
                vscode.window.showInputBox({
                    prompt: 'input password',
                    value: actsextension.atcoder.password,
                    ignoreFocusOut: true,
                    placeHolder: "ATCODER PASSWORD",
                    password: true
                }).then((password) => {
                    if (!password) return;
                    // exec command
                    actsextension.loginAtCoder(username, password)
                        .catch((ex) => {
                            actsextension.channel.appendLine("**** " + ex + " ****");
                        });
                });
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
            if (!actshelper.checkProjectPath()) return;
            // select site
            let idx = actsextension.sites.indexOf(actsextension.site);
            if (1 <= idx) {
                actsextension.sites.splice(idx, 1);
                actsextension.sites.unshift(actsextension.site);
            }
            vscode.window.showQuickPick(actsextension.sites, {
                placeHolder: "SELECT SITE",
            }).then((site) => {
                if (site === undefined) return;
                // input contest
                vscode.window.showInputBox({
                    prompt: 'input contest [e.g.: abc190]',
                    ignoreFocusOut: true,
                    value: actsextension.contest,
                    validateInput: param => { return actsextension.contestregexp.test(param) ? '' : 'input contest [e.g.: abc190]'; }
                }).then((contest) => {
                    if (contest === undefined) return;
                    // input task
                    vscode.window.showInputBox({
                        prompt: 'input task [e.g.: abc190_a]',
                        ignoreFocusOut: true,
                        value: actsextension.task,
                        validateInput: param => { return actsextension.taskregexp.test(param) ? '' : 'input task [e.g.: abc190_a]'; }
                    }).then((task) => {
                        if (task === undefined) return;
                        // select extension
                        let idx = actsextension.extensions.indexOf(actsextension.extension);
                        if (1 <= idx) {
                            actsextension.extensions.splice(idx, 1);
                            actsextension.extensions.unshift(actsextension.extension);
                        }
                        vscode.window.showQuickPick(actsextension.extensions, {
                            placeHolder: "SELECT EXTENSION",
                        }).then(extension => {
                            if (extension == null) return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
            // input select extension
            let idx = actsextension.extensions.indexOf(actsextension.extension);
            if (1 <= idx) {
                actsextension.extensions.splice(idx, 1);
                actsextension.extensions.unshift(actsextension.extension);
            }
            vscode.window.showQuickPick(actsextension.extensions, {
                placeHolder: "SELECT EXTENSION",
            }).then(extension => {
                if (extension == null) return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
            // input confirm
            vscode.window.showQuickPick(["REMOVE"], {
                placeHolder: "PRESS ESC TO EXIT"
            }).then(confirm => {
                if (confirm != "REMOVE") return;
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
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkActiveFile()) return;
            // exec command
            actsextension.browseTask()
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();
}
export function deactivate() { }

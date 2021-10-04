import * as vscode from 'vscode';
import superagent from "superagent";
require('superagent-proxy')(superagent);
import { actshelper } from './AcTsHelper';
import { actsextension } from './AcTsExtension';

// extension entrypoint
export function activate(context: vscode.ExtensionContext) {
    (function () {
        const cmdid = "loginSite";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.clear();
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            // input param
            vscode.window.showInputBox({
                prompt: 'input username',
                value: actsextension.username,
                ignoreFocusOut: true,
                placeHolder: "USERNAME"
            }).then((username) => {
                if (!username) return;
                vscode.window.showInputBox({
                    prompt: 'input password',
                    value: actsextension.password,
                    ignoreFocusOut: true,
                    placeHolder: "PASSWORD",
                    password: true
                }).then((password) => {
                    if (!password) return;
                    // exec command
                    actsextension.vscodeextensionpath = context.extensionPath;
                    actsextension.loginSite(username, password)
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
            // check folder
            if (!actshelper.checkProjectPath()) return;
            // input param
            vscode.window.showInputBox({
                prompt: 'input task [e.g.: abc190_a]',
                ignoreFocusOut: true,
                value: actsextension.task,
                validateInput: param => { return actsextension.taskregexp.test(param) ? '' : 'input task [e.g.: abc190_a]'; }
            }).then((task) => {
                if (task === undefined) return;
                let idx = actsextension.extensions.indexOf(actsextension.extension);
                if (1 <= idx) {
                    actsextension.extensions.splice(idx, 1);
                    actsextension.extensions.unshift(actsextension.extension);
                }
                vscode.window.showQuickPick(actsextension.extensions, {
                    placeHolder: "select extension",
                }).then(extension => {
                    if (extension == null) return;
                    // exec command
                    actsextension.vscodeextensionpath = context.extensionPath;
                    actsextension.projectpath = actshelper.projectpath;
                    actsextension.extension = extension;
                    actsextension.initTask(task)
                        .catch((ex) => {
                            actsextension.channel.appendLine("**** " + ex + " ****");
                        });
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
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.vscodeextensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
            actsextension.extension = actshelper.extension;
            actsextension.testTask(actshelper.task, false)
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
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.vscodeextensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
            actsextension.extension = actshelper.extension;
            actsextension.testTask(actshelper.task, true)
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
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.vscodeextensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
            actsextension.extension = actshelper.extension;
            actsextension.submitTask(actshelper.task)
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
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // input param
            vscode.window.showQuickPick(["REMOVE"], {
                placeHolder: "press ESC to exit"
            }).then(confirm => {
                if (confirm != "REMOVE") return;
                // exec command
                actsextension.vscodeextensionpath = context.extensionPath;
                actsextension.projectpath = actshelper.projectpath;
                actsextension.extension = actshelper.extension;
                actsextension.removeTask(actshelper.task)
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
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.vscodeextensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
            actsextension.extension = actshelper.extension;
            actsextension.browseTask(actshelper.task)
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();
}
export function deactivate() { }

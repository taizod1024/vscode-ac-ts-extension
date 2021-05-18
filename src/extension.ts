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
            actsextension.channel.appendLine("");
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
                    actsextension.extensionpath = context.extensionPath;
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
            actsextension.channel.appendLine("");
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
                // exec command
                actsextension.extensionpath = context.extensionPath;
                actsextension.projectpath = actshelper.projectpath;
                actsextension.initTask(task)
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
            actsextension.channel.appendLine("");
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.extensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
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
            actsextension.channel.appendLine("");
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.extensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
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
            actsextension.channel.appendLine("");
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // exec command
            actsextension.extensionpath = context.extensionPath;
            actsextension.projectpath = actshelper.projectpath;
            actsextension.submitTask(actshelper.task)
                .catch((ex) => {
                    actsextension.channel.appendLine("**** " + ex + " ****");
                });
        }));
    })();
    (function () {
        const cmdid = "deleteTask";
        context.subscriptions.push(vscode.commands.registerCommand(`${actsextension.appid}.${cmdid}`, () => {
            actsextension.channel.show(true);
            actsextension.channel.appendLine("");
            actsextension.channel.appendLine(`${actsextension.appid}.${cmdid}:`);
            // check param
            if (!actshelper.checkProjectPath()) return;
            if (!actshelper.checkTask()) return;
            // input param
            vscode.window.showQuickPick(["DELETE"], {
                placeHolder: "press ESC to exit"
            }).then(confirm => {
                if (confirm != "DELETE") return;
                // exec command
                actsextension.extensionpath = context.extensionPath;
                actsextension.projectpath = actshelper.projectpath;
                actsextension.deleteTask(actshelper.task)
                    .catch((ex) => {
                        actsextension.channel.appendLine("**** " + ex + " ****");
                    });
            });
        }));
    })();
}
export function deactivate() { }

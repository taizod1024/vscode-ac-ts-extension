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
  acts.context = context;
  (function () {
    const cmdid = "loginSite";
    context.subscriptions.push(
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
        // check condition
        if (!extensionhelper.checkProjectPath()) {
          return;
        }
        // select site
        const sites = extensionhelper.moveToHead(acts.sites, acts.site);
        vscode.window
          .showQuickPick(sites, {
            placeHolder: "SELECT SITE",
          })
          .then(site => {
            if (site === undefined) {
              return;
            }
            if (site === atcoder.site) {
              acts.channel.appendLine(`atcoder.siteurl: ${atcoder.siteurl}`);
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
            if (site === yukicoder.site) {
              acts.channel.appendLine(`yukicoder.siteurl: ${yukicoder.siteurl}`);
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
            if (site === local.site) {
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
        // check condition
        if (!extensionhelper.checkProjectPath()) {
          return;
        }
        // select site
        const sites = extensionhelper.moveToHead(acts.sites, acts.site);
        vscode.window
          .showQuickPick(sites, {
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
            // TODO site依存データの読込・保存タイミングが整理できていない
            // load site depending data
            try {
              acts.xsite.checkLogin();
              contest = acts.xsite.contest;
              task = acts.xsite.task;
              extension = acts.xsite.extension;
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
                    let extensions = Array.from(new Set(acts.xsite.xlanguages.map(val => val.xextension.extension))).sort();
                    extensions = extensionhelper.moveToHead(extensions, extension);
                    vscode.window
                      .showQuickPick(extensions, {
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
        // check condition
        if (!extensionhelper.checkProjectPath()) {
          return;
        }
        if (!extensionhelper.checkActiveFile()) {
          return;
        }
        // select extension
        let extensions = Array.from(new Set(acts.xsite.xlanguages.map(val => val.xextension.extension))).sort();
        extensions = extensionhelper.moveToHead(extensions, acts.xsite.extension);
        vscode.window
          .showQuickPick(extensions, {
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
        // check condition
        if (!extensionhelper.checkProjectPath()) {
          return;
        }
        if (!extensionhelper.checkActiveFile()) {
          return;
        }
        // select language
        let xlanguages = acts.xsite.xlanguages.filter(val => val.xextension.extension === acts.xsite.extension);
        if (acts.site === atcoder.site) {
          try {
            // check valid language ids
            xlanguages = await atcoder.filterXLanguagesAsync(xlanguages);
          } catch (ex) {
            acts.channel.appendLine("**** " + ex + " ****");
            return;
          }
        }
        let languages = xlanguages.map(val => val.language);
        languages = extensionhelper.moveToHead(languages, acts.xsite.language);
        vscode.window
          .showQuickPick(languages, {
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
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
      vscode.commands.registerCommand(`${acts.appid}.${cmdid}`, async () => {
        acts.channel.show(true);
        acts.channel.clear();
        acts.channel.appendLine(`${acts.appid}.${cmdid}:`);
        await acts.updateStateAsync();
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

import { fstat } from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { acts } from "./AcTsExtension";

// extension helper
class ExtensionHelper {
    public checkProjectPath(): boolean {
        if (vscode.workspace.workspaceFolders?.length === 1) {
            acts.projectpath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            return true;
        }
        const msg = `*** WARN: no root or multi root is not supported ***`;
        acts.channel.appendLine(msg);
        return false;
    }

    public checkActiveFile(): boolean {
        if (acts.projectpath) {
            const filenames = vscode.window.activeTextEditor?.document?.fileName?.split(path.sep);
            if (filenames) {
                // disassemble
                // 複数階層の解析を自前でやるほうが効率的なのでpathは使用しない
                let filename = filenames.pop();
                let basename = filenames.join(path.sep);
                let basenames = filename.split(".");
                let filenamewithoutextension = basenames[0];
                let task = filenamewithoutextension;
                let extension = 2 <= basenames.length ? "." + basenames.slice(-1)[0] : "";
                let contest = filenames.pop();
                let site = filenames.pop();
                // check path
                if (path.normalize(`${acts.projectpath}/src/${site}/${contest}`) === basename) {
                    // check valid extension
                    const extensions = Array.from(new Set(acts.xsite.xlanguages.map(val => val.xextension.extension))).sort();
                    if (extensions.includes(extension)) {
                        vscode.window.activeTextEditor.document.save();
                        acts.site = site;
                        acts.xsite.contest = contest;
                        acts.xsite.task = task;
                        acts.xsite.extension = extension;
                        return true;
                    }
                    // check test file and extension already selected
                    if (extension === ".txt" && acts.xsite.extension) {
                        vscode.window.activeTextEditor.document.save();
                        acts.site = site;
                        acts.xsite.contest = contest;
                        acts.xsite.task = task;
                        return true;
                    }
                }
            }
        }
        const msg = `*** WARN: missing task, select task file ***`;
        acts.channel.appendLine(msg);
        return false;
    }

    public moveToHead(srcarr: string[], val: string) {
        const dstarr = Array.from(srcarr);
        const idx = dstarr.indexOf(val);
        if (1 <= idx) {
            dstarr.splice(idx, 1);
            dstarr.unshift(val);
        }
        return dstarr;
    }
}
export const extensionhelper = new ExtensionHelper();

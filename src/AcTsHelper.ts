import * as vscode from "vscode";
import { acts } from "./AcTsExtension";

// extension helper
class AcTsHelper {
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
            const filenames = vscode.window.activeTextEditor?.document?.fileName?.split("\\");
            if (filenames) {
                // disassemble
                let filename = filenames.pop();
                let basename = filenames.join("\\");
                let basenames = filename.split(".");
                let filenamewithoutextension = basenames[0];
                let task = filenamewithoutextension;
                let extension = 2 <= basenames.length ? "." + basenames.slice(-1)[0] : "";
                let contest = filenames.pop();
                let site = filenames.pop();
                // check path
                if (`${acts.projectpath}\\src\\${site}\\${contest}` === basename) {
                    // check valid extension
                    if (acts.extensions.includes(extension)) {
                        vscode.window.activeTextEditor.document.save();
                        acts.site = site;
                        acts.contest = contest;
                        acts.task = task;
                        acts.extension = extension;
                        return true;
                    }
                    // check test file and extension already selected
                    if (extension === ".txt" && acts.extension) {
                        vscode.window.activeTextEditor.document.save();
                        acts.site = site;
                        acts.contest = contest;
                        acts.task = task;
                        return true;
                    }
                }
            }
        }
        const msg = `*** WARN: missing task, select task file ***`;
        acts.channel.appendLine(msg);
        return false;
    }
}
export const actshelper = new AcTsHelper();

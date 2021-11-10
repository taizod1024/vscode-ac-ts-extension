import * as vscode from 'vscode';
import { actsextension } from './AcTsExtension';

// extension helper
class AcTsHelper {

    public checkProjectPath(): boolean {
        if (vscode.workspace.workspaceFolders?.length === 1) {
            actsextension.projectpath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            return true;
        }
        const msg = `*** WARN: no root or multi root is not supported ***`;
        actsextension.channel.appendLine(msg);
        return false;
    }

    public checkActiveFile(): boolean {
        if (actsextension.projectpath) {
            const filenames = vscode.window.activeTextEditor?.document?.fileName?.split("\\");
            if (filenames) {
                // disassemble
                let filename = filenames.pop();
                let basename = filenames.join("\\");
                let basenames = filename.split(".");
                let filenamewithoutextension = basenames[0];
                let task = filenamewithoutextension;
                let extension = (2 <= basenames.length) ? ("." + basenames.slice(-1)[0]) : "";
                let contest = filenames.pop();
                let site = filenames.pop();
                // check path
                if (`${actsextension.projectpath}\\src\\${site}\\${contest}` === basename) {
                    // check valid extension
                    if (actsextension.extensions.includes(extension)) {
                        vscode.window.activeTextEditor.document.save();
                        actsextension.site = site;
                        actsextension.contest = contest;
                        actsextension.task = task;
                        actsextension.extension = extension;
                        return true;
                    }
                    // check test file and extension already selected
                    if (extension === ".txt" && actsextension.extension) {
                        vscode.window.activeTextEditor.document.save();
                        actsextension.site = site;
                        actsextension.contest = contest;
                        actsextension.task = task;
                        return true;
                    }
                }
            }
        }
        const msg = `*** WARN: missing task, select task file ***`;
        actsextension.channel.appendLine(msg);
        return false;
    }
};
export const actshelper = new AcTsHelper();

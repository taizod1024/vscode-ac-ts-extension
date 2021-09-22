import * as vscode from 'vscode';
import { actsextension } from './AcTsExtension';

// extension helper
class AcTsHelper {

    public projectpath: string;
    public filename: string;
    public filenamewithoutextension: string;
    public extension: string;
    public contest: string;
    public task: string;

    constructor() {
        this.projectpath = null;
        this.filename = null;
        this.filenamewithoutextension = null;
        this.extension = null;
        this.task = null;
    }

    public checkProjectPath(): boolean {
        if (vscode.workspace.workspaceFolders?.length == 1) {
            this.projectpath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            return true;
        } else {
            const msg = `WARN: no root or multi root is not supported`;
            actsextension.channel.appendLine(msg);
            vscode.window.showWarningMessage(msg);
            return false;
        }
    }

    public checkTask(): boolean {
        if (this.projectpath) {
            const filenames = vscode.window.activeTextEditor?.document?.fileName?.split("\\");
            if (filenames) {
                // disassemble
                this.filename = filenames.pop();
                const basename = filenames.join("\\");
                const basenames = this.filename.split(".");
                this.filenamewithoutextension = basenames[0];
                this.extension = (2 <= basenames.length) ? basenames.slice(-1)[0] : "";
                // check 
                const match = this.filenamewithoutextension.match(actsextension.taskregexp);
                if (match) {
                    this.contest = match[1];
                    if (`${this.projectpath}\\src\\atcoder\\${this.contest}` == basename) {
                        vscode.window.activeTextEditor.document.save();
                        this.task = this.filenamewithoutextension;
                        return true;
                    }
                }
            }
        }
        const msg = `WARN: missing task, select task file`;
        actsextension.channel.appendLine(msg);
        vscode.window.showWarningMessage(msg);
        return false;
    }
};
export const actshelper = new AcTsHelper();

import * as vscode from 'vscode';
import { actsextension } from './AcTsExtension';

// extension helper
class AcTsHelper {
    public projectpath: string;
    public filename: string;
    public filenamewithoutextension: string;
    public extension: string;
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
            const tmp1 = vscode.window.activeTextEditor?.document?.fileName?.split("\\");
            if (tmp1) {
                this.filename = tmp1.pop();
                const basename = tmp1.join("\\");
                const tmp2 = this.filename.split(".");
                this.filenamewithoutextension = tmp2[0];
                this.extension = (2 <= tmp2.length) ? tmp2.slice(-1)[0] : "";
                if (`${this.projectpath}\\src\\atcoder\\task` == basename) {
                    vscode.window.activeTextEditor.document.save();
                    this.task = this.filenamewithoutextension;
                    return true;
                }
            }
        }
        const msg = `WARN: missing task`;
        actsextension.channel.appendLine(msg);
        vscode.window.showWarningMessage(msg);
        return false;
    }
};
export const actshelper = new AcTsHelper();

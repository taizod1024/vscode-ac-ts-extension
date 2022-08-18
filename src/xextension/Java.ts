import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../IExtension";

class Java implements IExtension {
    // implements

    // prop
    extension = ".java";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    // TODO ロジックの共通化
    // TODO implementsからextendsに変更
    checkLang(): void {
        // check
        const cfgkey = "javaChecker";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdchk = String(config.get(cfgkey));
        acts.channel.appendLine(`[${acts.timestamp()}] checker: ${cmdchk}`);
        const cmdexp = acts.expandString(cmdchk);
        const command = `(${cmdexp}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            throw `ERROR: check failed\r\n${err}\r\n`;
        }
    }

    compileTask(): void {
        // modify taskfile and execfile
        let taskfile = acts.taskfile;
        let tmptaskfile = `${process.env.TEMP}\\${acts.appid}\\Main.java`;
        fs.copyFileSync(taskfile, tmptaskfile);
        acts.taskfile = tmptaskfile;
        acts.tmpexecfile = `${process.env.TEMP}\\${acts.appid}\\Main.class`;

        // compile
        const cfgkey = "javaCompiler";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdcmp = String(config.get(cfgkey));
        acts.channel.appendLine(`[${acts.timestamp()}] compiler: ${cmdcmp}`);
        const cmdexp = acts.expandString(cmdcmp);
        const command = `(${cmdexp}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            let err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            err = err.split(tmptaskfile).join(taskfile); // rewrite taskfile
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }

        // show executor
        const cmdexe = String(config.get("javaExecutor"));
        acts.channel.appendLine(`[${acts.timestamp()}] executor: ${cmdexe}`);
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        // test
        const cfgkey = "javaExecutor";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdexe = String(config.get(cfgkey));
        const cmdexp = acts.expandString(cmdexe);
        const command = `(${cmdexp}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const java = new Java();

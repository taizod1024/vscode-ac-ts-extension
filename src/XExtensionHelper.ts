import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "./AcTsExtension";

class XExtensionHelper {
    checkLang(chkkey: string): void {
        // check
        const config = vscode.workspace.getConfiguration(acts.appcfgkey);
        const cmdchk = String(config.get(chkkey));
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
        const out = fs.readFileSync(acts.tmptestoutfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stdout: "${out}"`);
        const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stderr: "${err}"`);
    }

    compileTask(cmpkey: string, exeky: string): void {
        // compile
        const config = vscode.workspace.getConfiguration(acts.appcfgkey);
        const cmdcmp = String(config.get(cmpkey));
        acts.channel.appendLine(`[${acts.timestamp()}] compiler: ${cmdcmp}`);
        acts.channel.appendLine(`[${acts.timestamp()}] - execfile ${acts.tmpexecfile}`);
        const cmdexp = acts.expandString(cmdcmp);
        const command = `(${cmdexp}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }
        const out = fs.readFileSync(acts.tmptestoutfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stdout: "${out}"`);
        const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stderr: "${err}"`);

        // show executor
        const cmdexe = String(config.get(exeky));
        acts.channel.appendLine(`[${acts.timestamp()}] executor: ${cmdexe}`);
    }

    testTask(exekey: string): any {
        // test
        const config = vscode.workspace.getConfiguration(acts.appcfgkey);
        const cmdexe = String(config.get(exekey));
        const cmdexp = acts.expandString(cmdexe);
        const command = `(${cmdexp}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const xexthelper = new XExtensionHelper();

import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "./AcTsExtension";

class XExtensionHelper {
    checkLang(lang: string, chkkey: string): void {
        // check
        const config = vscode.workspace.getConfiguration(acts.appcfgkey + "." + lang);
        const cmdchk = String(config.get(chkkey));
        acts.channel.appendLine(`[${acts.timestamp()}] checker: ${cmdchk}`);
        const cmdexp = acts.expandString(cmdchk);
        const command = `(${cmdexp}) 1> ${acts.tmpstdoutfile} 2> ${acts.tmpstderrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmpstderrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            throw `ERROR: check failed\r\n${err}\r\n`;
        }
        const out = fs.readFileSync(acts.tmpstdoutfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stdout: ${out}`);
        const err = fs.readFileSync(acts.tmpstderrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stderr: ${err}`);
    }

    compileTask(lang: string, cmpkey: string, exeky: string): void {
        // compile
        const config = vscode.workspace.getConfiguration(acts.appcfgkey + "." + lang);
        const cmdcmp = String(config.get(cmpkey));
        acts.channel.appendLine(`[${acts.timestamp()}] compiler: ${cmdcmp}`);
        acts.channel.appendLine(`[${acts.timestamp()}] - execfile: ${acts.execfile}`);
        const cmdexp = acts.expandString(cmdcmp);
        const command = `(${cmdexp}) 1> ${acts.tmpstdoutfile} 2> ${acts.tmpstderrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmpstderrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }
        const out = fs.readFileSync(acts.tmpstdoutfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stdout: ${out}`);
        const err = fs.readFileSync(acts.tmpstderrfile).toString().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
        acts.channel.appendLine(`[${acts.timestamp()}] - stderr: ${err}`);

        // show executor
        const cmdexe = String(config.get(exeky));
        acts.channel.appendLine(`[${acts.timestamp()}] executor: ${cmdexe}`);
    }

    testTask(lang: string, exekey: string): any {
        // test
        const config = vscode.workspace.getConfiguration(acts.appcfgkey + "." + lang);
        const cmdexe = String(config.get(exekey));
        const cmdexp = acts.expandString(cmdexe);
        const command = `(${cmdexp}) < ${acts.tmpstdinfile} 1> ${acts.tmpstdoutfile} 2> ${acts.tmpstderrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const xexthelper = new XExtensionHelper();

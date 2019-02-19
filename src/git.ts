import * as cp from "child_process";
import * as vscode from "vscode";

export class Git {
  constructor(private cwd: string) {}

  getChanges(): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      cp.exec(
        vscode.workspace.getConfiguration("gitFileExplorer").gitCommand,
        { cwd: this.cwd },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
            console.error("Could not execute git diff. stderr:", stderr);
            return;
          }

          resolve(stdout.split("\0").filter(s => s.length > 0));
        }
      );
    });
  }
}

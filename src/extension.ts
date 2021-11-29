// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { GitNodeProvider } from "./git-node-provider";

export function activate(context: vscode.ExtensionContext) {
  const gitNodeProvider = new GitNodeProvider(vscode.workspace.rootPath!);
  vscode.window.registerTreeDataProvider("git-file-explorer", gitNodeProvider);
  vscode.commands.executeCommand("setContext", "gitFileExplorer.view", "flat");
  vscode.commands.registerCommand("gitFileExplorer.setTreeView", () => {
    vscode.commands.executeCommand(
      "setContext",
      "gitFileExplorer.view",
      "tree"
    );
    gitNodeProvider.setViewMode("tree");
  });
  vscode.commands.registerCommand("gitFileExplorer.setFlatView", () => {
    vscode.commands.executeCommand(
      "setContext",
      "gitFileExplorer.view",
      "flat"
    );
    gitNodeProvider.setViewMode("flat");
  });

  vscode.commands.executeCommand("gitFileExplorer.setFlatView");
}

export function deactivate() {}

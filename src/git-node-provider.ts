import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Git } from "./git";

export class GitNodeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined
  > = new vscode.EventEmitter<Dependency | undefined>();

  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this
    ._onDidChangeTreeData.event;

  private fileSystemWatcher: vscode.FileSystemWatcher;
  private git: Git;

  constructor(private rootPath: string) {
    this.git = new Git(rootPath);
    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");

    this.fileSystemWatcher.onDidChange(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    return this.git.getChanges().then(files => {
      return files.map(
        file =>
          new Dependency(file, vscode.TreeItemCollapsibleState.None, {
            title: "Open file",
            command: "vscode.open",
            arguments: [vscode.Uri.file(path.join(this.rootPath, file))]
          })
      );
    });
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    private readonly filePath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(path.basename(filePath), collapsibleState);
  }

  get tooltip(): string {
    return this.filePath;
  }

  get description(): string {
    return this.filePath;
  }

  iconPath = vscode.ThemeIcon.File;
  resourceUri = vscode.Uri.file(this.filePath);
}

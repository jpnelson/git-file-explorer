import * as vscode from "vscode";
import * as path from "path";
import { Git } from "./git";
import { FileTree } from "./file-tree";

export class GitNodeProvider
  implements vscode.TreeDataProvider<GitFileTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    GitFileTreeItem | undefined
  > = new vscode.EventEmitter<GitFileTreeItem | undefined>();

  private _viewMode?: "tree" | "flat";

  readonly onDidChangeTreeData: vscode.Event<GitFileTreeItem | undefined> =
    this._onDidChangeTreeData.event;

  private fileSystemWatcher: vscode.FileSystemWatcher;
  private git: Git;

  constructor(private rootPath: string) {
    this.git = new Git(rootPath);
    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");

    this.fileSystemWatcher.onDidChange(() => {
      this._onDidChangeTreeData.fire(undefined);
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  setViewMode(mode: "tree" | "flat") {
    this._viewMode = mode;
    this.refresh();
  }

  getTreeItem(element: GitFileTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GitFileTreeItem): Thenable<GitFileTreeItem[]> {
    return this.git.getChanges().then(async (files) => {
      if (this._viewMode === "flat") {
        return files.map(
          (file) =>
            new GitFileTreeItem(
              "file",
              file,
              vscode.TreeItemCollapsibleState.None,
              {
                title: "Open file",
                command: "vscode.open",
                arguments: [vscode.Uri.file(path.join(this.rootPath, file))],
              }
            )
        );
      }
      const fileTree = new FileTree(files);

      if (element && element.type === "file") {
        return [];
      }

      const node = element ? fileTree.findNode(element.filePath) : fileTree;

      const fileTreeFiles = node.getFiles().map(
        (file) =>
          new GitFileTreeItem(
            "file",
            file,
            vscode.TreeItemCollapsibleState.None,
            {
              title: "Open file",
              command: "vscode.open",
              arguments: [vscode.Uri.file(path.join(this.rootPath, file))],
            }
          )
      );

      const fileTreeFolders = node
        .getFolders()
        .map(
          (folder) =>
            new GitFileTreeItem(
              "folder",
              path.join(node.basePath, folder),
              vscode.TreeItemCollapsibleState.Expanded
            )
        );

      // Collapse instances where one item has only one child. Do this recursively too.
      // folderPrefix is made for this use case
      // (a bit hacky, could be improved if GitFileTreeItem had separate folder / files)
      if (
        fileTreeFiles.length === 0 &&
        fileTreeFolders.length === 1 &&
        node.basePath !== "" // we always want at least one root node, so don't collapse the very first item
      ) {
        const children = await this.getChildren(fileTreeFolders[0]);
        return children.map((child) => {
          return new GitFileTreeItem(
            child.type,
            child.filePath,
            child.collapsibleState,
            child.command,
            path.join(node.getFolders()[0], child.folderPrefix || "")
          );
        });
      }

      return [...fileTreeFiles, ...fileTreeFolders];
    });
  }
}

export class GitFileTreeItem extends vscode.TreeItem {
  constructor(
    public readonly type: "folder" | "file",
    public readonly filePath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly folderPrefix?: string
  ) {
    super(
      type === "folder"
        ? path.join(folderPrefix || "", path.basename(filePath))
        : path.basename(filePath),
      collapsibleState
    );
    this.tooltip = this.filePath;
    if (type === "file") {
      this.description = this.filePath;
    }
  }

  iconPath =
    this.type === "file" ? vscode.ThemeIcon.File : vscode.ThemeIcon.Folder;
  resourceUri = vscode.Uri.file(this.filePath);
}

import * as path from "path";

type TreeNodes = {
  folders: {
    [dir: string]: FileTree;
  };
  files: Set<string>;
};

export class FileTree {
  public tree: TreeNodes;
  public basePath: string;

  constructor(files?: string[], basePath?: string) {
    this.tree = {
      folders: {},
      files: new Set(),
    };

    this.basePath = basePath || "";

    files?.forEach((file) => {
      this.addToTree(file);
    });
  }

  private addToTree(file: string) {
    const fileParts = file.split(path.sep);
    if (fileParts.length === 0) {
      return;
    }
    const dirs = fileParts.slice(0, -1);

    let currentNode: FileTree = this;
    dirs.forEach((dir) => {
      currentNode.tree.folders[dir] =
        currentNode.tree.folders[dir] ||
        new FileTree([], path.join(currentNode.basePath, dir));
      currentNode = currentNode.tree.folders[dir];
    });
    currentNode.tree.files.add(file);
  }

  public getFiles() {
    return [...this.tree.files.values()];
  }

  public getFolders() {
    return Object.keys(this.tree.folders);
  }

  public findNode(file: string) {
    const pathParts = file.split(path.sep);
    let node: FileTree = this;
    for (let i = 0; i < pathParts.length; i++) {
      node = node.tree.folders[pathParts[i]];
    }

    return node;
  }
}

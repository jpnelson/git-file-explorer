# git-file-explorer README

Git file explorer lets you create a file explorer of your own choosing, based on a git command.

For example, by default, you can browse changes that are not yet present on a master branch:

```
git --no-pager diff `git merge-base HEAD origin/master` --name-only -z
```

\!\[Browsing with the file explorer\]\(images/git-file-explorer-screenshot.png\)

## Features

\!\[File explorer screenshot\]\(images/git-file-explorer-animation.gif\)

## Extension Settings

This extension contributes the following settings:

- `gitFileExplorer.gitCommand`: the command to run when populating the file explorer

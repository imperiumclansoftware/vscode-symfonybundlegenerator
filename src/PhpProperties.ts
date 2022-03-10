import * as vscode from 'vscode';

export class PhpProperties extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label,collapsibleState);
        this.tooltip = `${this.label}`;
    }

}
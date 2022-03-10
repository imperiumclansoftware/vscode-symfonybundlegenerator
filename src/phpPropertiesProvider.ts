import path = require('path');
import * as vscode from 'vscode';
import { PhpProperties } from './PhpProperties';


export class PhpPropertiesProvider implements vscode.TreeDataProvider<PhpProperties> {
	constructor(private textEditor : vscode.TextEditor|undefined) {}

    onDidChangeTreeData?: vscode.Event<any> | undefined;

    getTreeItem(element: PhpProperties): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: PhpProperties): vscode.ProviderResult<PhpProperties[]> {

        if(this.textEditor)
        {
            return Promise.resolve(this.getProperties(this.textEditor.document.getText()));
        }
    }

    private getProperties(text: string): PhpProperties[]
    {
        const regex = /(?:(?:private)|(?:protected))(?:(?: \S+ )|(?:\s+))(?:\$)(\w*)/gm;
        var found=null;
        var result=[];

        while ((found = regex.exec(text)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (found.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            found.forEach((match, groupIndex) => {
                if(groupIndex === 1)
                {
                    result.push(new PhpProperties(match,vscode.TreeItemCollapsibleState.None));
                }
            });
        }

        if(result.length === 0)
        {
            result.push(new PhpProperties('- No properties -',vscode.TreeItemCollapsibleState.None));
        }
        
        return result;
    }
}
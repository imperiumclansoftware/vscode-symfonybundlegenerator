import path = require('path');
import * as vscode from 'vscode';
import { PhpProperties } from './PhpProperties';


export class PhpPropertiesProvider implements vscode.TreeDataProvider<PhpProperties> {
	constructor(private textEditor : vscode.TextEditor|vscode.TextDocument|undefined) {}

    onDidChangeTreeData?: vscode.Event<any> | undefined;

    getTreeItem(element: PhpProperties): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: PhpProperties): vscode.ProviderResult<PhpProperties[]> {

        if(this.textEditor && (this.textEditor as vscode.TextEditor).document)
        {
            if(this.textEditor)
            {
                return Promise.resolve(this.getProperties(getTextFromEditor(this.textEditor as vscode.TextEditor)));
            }
        }
        else if(this.textEditor && (this.textEditor as vscode.TextDocument).getText)
        {
            if(this.textEditor as vscode.TextDocument)
            {
                return Promise.resolve(this.getProperties(getTextFromDocument(this.textEditor as vscode.TextDocument)));
            }
        }
        else
        {
            return null;
        }
        
    }

    private getProperties(text: string): PhpProperties[]
    {
        var properties: string[]=PhpProperties.getProperties(text);
        var result: PhpProperties[]=[];
       
        properties.forEach((property: string) => {
            result.push(new PhpProperties(property,vscode.TreeItemCollapsibleState.None,text));                  
        });
    
        if(result.length === 0)
        {
            result.push(new PhpProperties('- No properties -',vscode.TreeItemCollapsibleState.None,text));
        }
        
        return result;
    }
}

function getTextFromEditor(editor: vscode.TextEditor): string
{
    if(editor && editor.document)
    {
        return editor.document.getText();
    }
    return '';
}

function getTextFromDocument(editor: vscode.TextDocument): string
{
    if(editor)
    {
        return editor.getText();
    }
    return '';
}
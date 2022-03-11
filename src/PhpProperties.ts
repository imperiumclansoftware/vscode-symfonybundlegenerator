import * as vscode from 'vscode';
import { ucFirst } from './bundle';

export class PhpProperties extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly text: string
    ) {
        super(label,collapsibleState);
        
        const labelReg = ucFirst(label);
        
        var getter=PhpProperties.hasGetter(labelReg,text);
        var setter=PhpProperties.hasSetter(labelReg,text);

        if(getter && setter)
        {
            this.iconPath = new vscode.ThemeIcon('arrow-both');
            this.tooltip = `Getter and setter present`;
        }
        else if(getter)
        {
            this.iconPath = new vscode.ThemeIcon('arrow-small-right');
            this.tooltip = `Only getter present`;
        }
        else if(setter)
        {
            this.iconPath = new vscode.ThemeIcon('arrow-small-left');
            this.tooltip = `Only setter present`;
        }
        else
        {
            this.iconPath = new vscode.ThemeIcon('circle-slash');
            this.tooltip = `No getter, no setter`;
        }
        
    }

    static hasGetter(property: string, text: string): boolean
    {
        const regexGet = new RegExp(`(?:function)\\s+get(${ucFirst(property)})`);
        var found = null;

        while ((found = regexGet.exec(text)) !== null) {
            if (found.index === regexGet.lastIndex) {
                regexGet.lastIndex++;
            }

            return true;
        }

        return false;
    }

    static hasSetter(property: string, text: string): boolean
    {
        const regexGet = new RegExp(`(?:function)\\s+set(${ucFirst(property)})`);
        var found = null;

        while ((found = regexGet.exec(text)) !== null) {
            if (found.index === regexGet.lastIndex) {
                regexGet.lastIndex++;
            }

            return true;
        }

        return false;
    }

    static getProperties(text: string): string[]
    {
        var result: string[] = [];
        const regex = /(?:(?:private)|(?:protected))(?:(?: \S+ )|(?:\s+))(?:\$)(\w*)/gm;
        var found=null;

        while ((found = regex.exec(text)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (found.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            found.forEach((match, groupIndex) => {
                if(groupIndex === 1)
                {
                    result.push(match);
                }
            });
        }

        return result;
    }
}
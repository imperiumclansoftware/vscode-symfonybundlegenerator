// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getBundleConfiguration, getBundleContent, getBundleExtension, getComposerContent, getDevReadme, getDoctrineConfig, getGitIgnore, getReadme, getRoutesConfig, getSecurityConfig, getServicesConfig, ucFirst } from './bundle';
import { getControllerContent, getControllerTwigContent } from './controller';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let bundle = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfBundle', async () => {
		const bundleName = await vscode.window.showInputBox({
			placeHolder: "Bundle Name",
			prompt: "Name of the Symfony Bundle",
		});
		const creatorId = await vscode.window.showInputBox({
			placeHolder: "Creator Id",
			prompt: "Name of the bundle creator",
		});

		if (creatorId && bundleName) {

			// Generate files for bundle
			await generateBundleFiles(creatorId, bundleName.toLowerCase());
			// Install composer files
			executeSysCommand('composer install');
			const newLocal = 'intelephense.index.workspace';
			vscode.commands.executeCommand(newLocal);
			// Initialise git repository
			executeSysCommand('git init');
			executeSysCommand('git add -A');
			executeSysCommand('git commit -m "Bundle initialisation"');
		}

	});

	let controller = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfController', async () => {
        const controllerName = await vscode.window.showInputBox({
            placeHolder: "Controller Name",
            prompt: "Name of the Symfony Controller",
        });
        
        const baseNamespace = await getComposerNamespace();
        
    
        if (controllerName && baseNamespace) {
    
            // Generate files for bundle
            await generateFile(`src/Controller/${ucFirst(controllerName)}Controller.php`,getControllerContent(baseNamespace,controllerName));
            await generateFile(`templates/${controllerName.toLowerCase()}/${controllerName.toLowerCase()}.html.twig`,getControllerTwigContent(baseNamespace,controllerName));
        }
    
    });

	context.subscriptions.push(controller);
	

	context.subscriptions.push(bundle);
}

async function generateBundleFiles(creatorId: string, bundleName: string) {
	
	const flcBundleName = ucFirst(bundleName);

	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		
		// Generate root files
		await generateFile('.gitignore',getGitIgnore());
		await generateFile('composer.json', getComposerContent(creatorId,bundleName));
		await generateFile('README.md', getReadme(creatorId,bundleName));
		await generateFile('DEV_README.md', getDevReadme(creatorId,bundleName,wsPath));
		// Generate src files
		await generateFile(`src/${flcBundleName}Bundle.php`, getBundleContent(creatorId,bundleName));
		await generateFile('src/DependencyInjection/Configuration.php',getBundleConfiguration(creatorId,bundleName));
		await generateFile(`src/DependencyInjection/${flcBundleName}Extension.php`,getBundleExtension(creatorId,bundleName));
		// Generate config files
		await generateFile('config/security.yaml', getSecurityConfig(creatorId,bundleName));
		await generateFile('config/doctrine.yaml', getDoctrineConfig(creatorId,bundleName));
		await generateFile('config/routes.yaml', getRoutesConfig(creatorId,bundleName));
		await generateFile('config/services.yaml', getServicesConfig(creatorId,bundleName));
		// Generate public files
		await generateFile(`public/css/${bundleName.toLowerCase()}.css`, `/* ${flcBundleName} stylesheet file */`);
		await generateFile(`public/js/${bundleName.toLowerCase()}.js`, `/* ${flcBundleName} javascript file */`);
	}
}

export async function generateFile(filename: string, content: string): Promise<void> {
	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const wsedit = new vscode.WorkspaceEdit();
		const filePath = vscode.Uri.file(wsPath + '/' + filename);

		wsedit.createFile(filePath, { ignoreIfExists: true });
		wsedit.insert(filePath, new vscode.Position(0, 0), content);
		try {
			await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', { uri: filePath });
		}
		catch { }

		await vscode.workspace.applyEdit(wsedit);

		const doc = await vscode.workspace.openTextDocument(filePath);


		const fileSaved = await doc.save();
		if (fileSaved) {
			vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
		vscode.window.showInformationMessage('Created a new file: ' + filename);

	}
}

export function executeSysCommand(command: string) {

	var terminal;

	if (vscode.window.terminals) {
		for (const term in vscode.window.terminals) {
			if (vscode.window.terminals[term].name === 'Generator Terminal') {
				terminal = vscode.window.terminals[term];
			}
		}
	}

	if (!terminal) {
		terminal = vscode.window.createTerminal('Generator Terminal');
		terminal.show();
	}


	terminal.sendText(command + '\n');
}

export async function getComposerNamespace()
{
	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const wsedit = new vscode.WorkspaceEdit();
		const filePath = vscode.Uri.file(wsPath + '/composer.json');
		const doc = await vscode.workspace.openTextDocument(filePath);
		const composerConfig = doc.getText();
		const config = JSON.parse(composerConfig);

		for(const composerNamespace in config.autoload['psr-4'])
		{
			if(config.autoload['psr-4'][composerNamespace] === '/src')
			{
				return composerNamespace;
			}
		}
		
	}

	return null;
}

// this method is called when your extension is deactivated
export function deactivate() { }

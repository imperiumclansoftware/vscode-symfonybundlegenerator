// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Console } from 'console';
import * as vscode from 'vscode';
import { enabledServicePart, getBundleConfiguration, getBundleContent, getBundleExtension, getComposerContent, getDevReadme, getDoctrineConfig, getGitIgnore, getReadme, getRoutesConfig, getSecurityConfig, getServicesConfig, ServicePart, ucFirst } from './bundle';
import { getCommandContent } from './command';
import { getControllerContent, getControllerTwigContent } from './controller';
import { getEntityContent } from './entity';
import { PhpProperties } from './PhpProperties';
import { PhpPropertiesProvider } from './phpPropertiesProvider';
import { getRepositoryContent } from './repository';
import { getServiceContent } from './service';

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

			// Generate files for controller
			await generateFile(`src/Controller/${ucFirst(controllerName)}Controller.php`, getControllerContent(baseNamespace, controllerName));
			await generateFile(`templates/${controllerName.toLowerCase()}/${controllerName.toLowerCase()}.html.twig`, getControllerTwigContent(baseNamespace, controllerName));
			await enabledServicePart(ServicePart.controller);
		}

	});

	let service = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfService', async () => {
		const serviceName = await vscode.window.showInputBox({
			placeHolder: "Service Name",
			prompt: "Name of the Symfony Service",
		});

		const baseNamespace = await getComposerNamespace();


		if (serviceName && baseNamespace) {

			// Generate files for service
			await generateFile(`src/Service/${ucFirst(serviceName)}Service.php`, getServiceContent(baseNamespace, serviceName));
			await enabledServicePart(ServicePart.service);
		}

	});

	let entity = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfEntity', async () => {
		const entityName = await vscode.window.showInputBox({
			placeHolder: "Entity Name",
			prompt: "Name of the Symfony Doctrine Entity",
		});

		const baseNamespace = await getComposerNamespace();


		if (entityName && baseNamespace) {

			// Generate files for entity
			await generateFile(`src/Entity/${ucFirst(entityName)}.php`, getEntityContent(baseNamespace, entityName));
			await generateFile(`src/Repository/${ucFirst(entityName)}Repository.php`, getRepositoryContent(baseNamespace, entityName));
		}

	});

	let repository = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfRepository', async () => {
		const entityName = await vscode.window.showInputBox({
			placeHolder: "Entity Name",
			prompt: "Name of the Symfony Doctrine Entity for this repository",
		});

		const baseNamespace = await getComposerNamespace();


		if (entityName && baseNamespace) {

			// Generate files for repository
			await generateFile(`src/Repository/${ucFirst(entityName)}Repository.php`, getRepositoryContent(baseNamespace, entityName));
		}

	});

	let command = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfCommand', async () => {
		const commandName = await vscode.window.showInputBox({
			placeHolder: "Command Name",
			prompt: "Name of the Symfony Command",
		});

		const baseNamespace = await getComposerNamespace();


		if (commandName && baseNamespace) {

			// Generate files for repository
			await generateFile(`src/Command/${ucFirst(commandName)}Command.php`, getCommandContent(baseNamespace, commandName));
			await enabledServicePart(ServicePart.command);
		}

	});

	let phpGetterSetter = vscode.commands.registerCommand("symfonybundlegenerator.GeneratePhpGetterSetter", async () => {

		if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
			const editor: vscode.TextEditor = vscode.window.activeTextEditor;
			const doc: vscode.TextDocument = editor.document;
			const properties: string[] = PhpProperties.getProperties(doc.getText());

			var lastLine: vscode.TextLine;
			editor.edit(async (editBuilder) => {
				properties.forEach(async (property: string) => {

					lastLine = getLastLine(doc);
					const propertyFunc = ucFirst(property);


					if (!PhpProperties.hasGetter(property, doc.getText())) {

						editBuilder.insert(new vscode.Position(lastLine.lineNumber - 1, 0),
							`\n\tfunction get${propertyFunc}() \{
		return $this->${property};
	\}\n`);
					}

					lastLine = getLastLine(doc);

					if (!PhpProperties.hasSetter(property, doc.getText())) {

						editBuilder.insert(new vscode.Position(lastLine.lineNumber - 1, 0),
							`\n\tfunction set${propertyFunc}(\$${property}) \{
		$this->${property} = \$${property};
		return $this;
	\}\n`);
					}
					console.info(`Add getters and setters for ${property}`);

				});
			});

			doc.save();
		}



	});

	context.subscriptions.push(command);
	context.subscriptions.push(repository);
	context.subscriptions.push(entity);
	context.subscriptions.push(service);
	context.subscriptions.push(controller);
	context.subscriptions.push(bundle);
	context.subscriptions.push(phpGetterSetter);

	let phpController = new PhpPropertiesController();

	context.subscriptions.push(phpController);
}

function getLastLine(doc: vscode.TextDocument): vscode.TextLine {
	var lastLine: vscode.TextLine = doc.lineAt(doc.lineCount - 1);
	var remove = 1;

	while (lastLine.text[lastLine.text.length - 1] !== `\}`) {
		remove++;
		if ((doc.lineCount - remove) >= 1) {
			lastLine = doc.lineAt(doc.lineCount - remove);
		}
	}

	return lastLine;
}

class PhpPropertiesController {
	private _disposable: vscode.Disposable;
	constructor() {
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
		// vscode.window.onDidChangeTextEditorSelection(this._onEvent,this,subscriptions);
		vscode.workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);

		if (vscode.window.activeTextEditor !== undefined) {
			vscode.window.createTreeView('phpProperties', {
				treeDataProvider: new PhpPropertiesProvider(vscode.window.activeTextEditor)
			});
		}

		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	dispose() {
		this._disposable.dispose();
	}

	private _onEvent(editor: any) {
		console.info('Update php properties.');
		if (editor) {

			vscode.window.createTreeView('phpProperties', {
				treeDataProvider: new PhpPropertiesProvider(editor)
			});
		}
		else {
			vscode.window.createTreeView('phpProperties', {
				treeDataProvider: new PhpPropertiesProvider(vscode.window.activeTextEditor)
			});
		}


	}
}

async function generateBundleFiles(creatorId: string, bundleName: string) {

	const flcBundleName = ucFirst(bundleName);

	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

		// Generate root files
		await generateFile('.gitignore', getGitIgnore());
		await generateFile('composer.json', getComposerContent(creatorId, bundleName));
		await generateFile('README.md', getReadme(creatorId, bundleName));
		await generateFile('DEV_README.md', getDevReadme(creatorId, bundleName, wsPath));
		// Generate src files
		await generateFile(`src/${flcBundleName}Bundle.php`, getBundleContent(creatorId, bundleName));
		await generateFile('src/DependencyInjection/Configuration.php', getBundleConfiguration(creatorId, bundleName));
		await generateFile(`src/DependencyInjection/${flcBundleName}Extension.php`, getBundleExtension(creatorId, bundleName));
		await generateFile(`src/Entity/.gitkeep`, ``);
		await generateFile(`src/Controller/.gitkeep`, ``);
		// Generate config files
		await generateFile('config/security.yaml', getSecurityConfig(creatorId, bundleName));
		await generateFile('config/doctrine.yaml', getDoctrineConfig(creatorId, bundleName));
		await generateFile('config/routes.yaml', getRoutesConfig(creatorId, bundleName));
		await generateFile('config/services.yaml', getServicesConfig(creatorId, bundleName));
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


		await vscode.workspace.applyEdit(wsedit);

		try {
			await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', { uri: filePath });
		}
		catch { }

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

export async function getComposerNamespace() {
	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const wsedit = new vscode.WorkspaceEdit();
		const filePath = vscode.Uri.file(wsPath + '/composer.json');
		const doc = await vscode.workspace.openTextDocument(filePath);
		const composerConfig = doc.getText();
		const config = JSON.parse(composerConfig);

		for (const composerNamespace in config.autoload['psr-4']) {
			if (config.autoload['psr-4'][composerNamespace] === '/src') {
				return composerNamespace;
			}
		}

	}

	return null;
}




// this method is called when your extension is deactivated
export function deactivate() { }

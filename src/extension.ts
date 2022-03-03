// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('symfonybundlegenerator.GenerateSfBundle', async () => {
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
			await generateBundleFiles(creatorId, bundleName);
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

	context.subscriptions.push(disposable);
}

async function generateBundleFiles(creatorId: string, bundleName: string) {
	const flcCreatorId = ucFirst(creatorId);
	const flcBundleName = ucFirst(bundleName);
	const baseNamespace = `${flcCreatorId}\\${flcBundleName}Bundle`;
	if (vscode.workspace.workspaceFolders) {
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const composerContent = {
			"name": `${creatorId.toLowerCase()}/${bundleName.toLowerCase()}-bundle`,
			"description": "A new bundle",
			"type": "symfony-bundle",
			"version": "0.0.1",
			"license": "MIT",
			"autoload": {
				"psr-4": {
					[baseNamespace + "\\"]: "/src"
				}
			},
			"require": {
				"symfony/framework-bundle": "^5|^6",
				"symfony/config": "^5",
				"symfony/dependency-injection": "^5",
				"symfony/routing": "^5",
				"symfony/form": "^5",
				"doctrine/orm": "^2.8",
				"twig/twig": "^3.3",
				"symfony/doctrine-bridge": "^5",
				"symfony/http-client": "^5"
			}
		};
		const repoInfo = {
			"repositories":[
				{
					"type": "path",
					"url": `${ucFirst(wsPath.toString()) + '\\'}`
				}
			]
		};
		// Generate root files
		await generateFile('.gitignore', '/.vscode/\n/vendor/');
		await generateFile('composer.json', JSON.stringify(composerContent,null,4));
		await generateFile('README.md', `# ${baseNamespace} : new Bundle`);
		await generateFile('DEV_README.md', `# ${flcBundleName}Bundle developpement instructions\n## Install an host symfony framework\n### Use Symfony installer\n\`\`\`bash\nsymfony new --full <your directory>\n\`\`\`\n### Use Composer\n\`\`\`bash\ncomposer create-project symfony/website-skeleton <your directory>\n\`\`\`\n## Append this bundle repository\n\`\`\`json\n// host app composer.json\n${JSON.stringify(repoInfo,null,4)}\n\`\`\`\n## Install Bundle\n\`\`\`bash\ncomposer require ${creatorId.toLowerCase()}/${bundleName.toLowerCase()}-bundle\n\`\`\`\n`);
		// Generate src files
		await generateFile(`src/${flcBundleName}Bundle.php`, `<?php\n\nnamespace ${baseNamespace};\n\nuse Symfony\\Component\\DependencyInjection\\ContainerBuilder;\nuse Symfony\\Component\\HttpKernel\\Bundle\\Bundle;\n\nclass ${flcBundleName}Bundle extends Bundle\n{\npublic function build(ContainerBuilder $builder)\n{\n\n}\n\npublic function getPath(): string\n{\nreturn \\dirname(__DIR__);\n\n}\n}`);
		// Generate config files
		await generateFile('config/security.yaml', '');
		await generateFile('config/doctrine.yaml', `doctrine:\n\torm:\n\t\tmappings:\n\t\t\t${flcBundleName}Bundle:\n\t\t\t\tis_bundle: true\n\t\t\t\ttype: annotation\n\t\t\t\tdir: 'src/Entity'\n\t\t\t\tprefix: '${baseNamespace}\\Entity'\n\t\t\t\talias: ${flcBundleName}`);
		await generateFile('config/routes.yaml', 'controllers:\n\tresource: ../src/Controller/\n\ttype: annotation');
		await generateFile('config/services.yaml', '');
		// Generate public files
		await generateFile(`public/css/${bundleName.toLowerCase()}.css`, `/* ${flcBundleName} stylesheet file */`);
		await generateFile(`public/js/${bundleName.toLowerCase()}.js`, `/* ${flcBundleName} javascript file */`);
	}
}

async function generateFile(filename: string, content: string) {
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

function ucFirst(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function executeSysCommand(command: string) {

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


// this method is called when your extension is deactivated
export function deactivate() { }

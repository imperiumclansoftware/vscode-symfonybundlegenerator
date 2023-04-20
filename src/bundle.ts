import * as vscode from 'vscode';


export function getComposerContent(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);
    const composerContent = {
        "name": `${creatorId.toLowerCase()}/${bundleName.toLowerCase()}-bundle`,
        "description": "A new bundle generate by symfony-generator",
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
            "symfony/config": "^5|^6",
            "symfony/dependency-injection": "^5|^6",
            "symfony/routing": "^5|^6",
            "symfony/form": "^5|^6",
            "symfony/orm-pack": "^2",
            "twig/twig": "^2.12|^3",
        }
    };

    return JSON.stringify(composerContent,null,4);
}

export function getGitIgnore(): string
{
    return  `
/.vscode/
/vendor/
`;
}

export function getReadme(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);
    return `# ${baseNamespace} : new Bundle`;
}

export function getDevReadme(creatorId: string,bundleName: string, workspacePath: string): string
{
	const flcBundleName = ucFirst(bundleName);
    const repoInfo = {
        "repositories":[
            {
                "type": "path",
                "url": `${ucFirst(workspacePath.toString()) + '/'}`
            }
        ]
    };

    return `# ${flcBundleName}Bundle developpement instructions
    ## Install an host symfony framework
    ### Use Symfony installer
    \`\`\`bash
    symfony new --full <your directory>
    \`\`\`
    ### Use Composer
    \`\`\`bash
    composer create-project symfony/website-skeleton <your directory>
    \`\`\`
    ## Append this bundle repository
    \`\`\`json
    // host app composer.json
    ${JSON.stringify(repoInfo,null,4)}
    \`\`\`## Install Bundle
    \`\`\`bash
    composer require ${creatorId.toLowerCase()}/${bundleName.toLowerCase()}-bundle
    \`\`\`
    `;
}

export function getBundleContent(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);
    const flcBundleName = ucFirst(bundleName);

    return `<?php
    
    namespace ${baseNamespace};
    
    use Symfony\\Component\\DependencyInjection\\ContainerBuilder;
    use Symfony\\Component\\HttpKernel\\Bundle\\Bundle;
    
    class ${flcBundleName}Bundle extends Bundle
    {
        public function build(ContainerBuilder $builder)
        {
        }
        
        public function getPath(): string
        {
            return \\dirname(__DIR__);    
        }
    }`;
}

export function getBundleConfiguration(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);

    return `<?php

    namespace ${baseNamespace}\\DependencyInjection;

    use Symfony\\Component\\Config\\Definition\\ConfigurationInterface;
    use Symfony\\Component\\Config\\Definition\\Builder\\TreeBuilder;

    class Configuration implements ConfigurationInterface
    {

        public function getConfigTreeBuilder()
        {
            $treeBuilder = new TreeBuilder('${bundleName.toLowerCase()}');
            //$treeBuilder->getRootNode()->children()
            //    ->scalarNode('path')->defaultValue('medias')->end()
            //;
            return $treeBuilder;
        }
    }
    `;
}

export function getBundleExtension(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);

    return `<?php

    namespace ${baseNamespace}\\DependencyInjection;

    use Symfony\\Component\\Config\\FileLocator;
    use Symfony\\Component\\DependencyInjection\\ContainerBuilder;
    use Symfony\\Component\\DependencyInjection\\Extension\\Extension;
    use Symfony\\Component\\DependencyInjection\\Extension\\PrependExtensionInterface;
    use Symfony\\Component\\DependencyInjection\\Loader\\YamlFileLoader;

    class ${ucFirst(bundleName)}Extension extends Extension implements PrependExtensionInterface
    {
        public function load(array $configs, ContainerBuilder $container)
        {
            $loader = new YamlFileLoader($container, new FileLocator(__DIR__.'/../../config/'));
            $loader->load('services.yaml');
            $configuration = new Configuration();
            $configs = $this->processConfiguration($configuration,$configs);
            $container->setParameter('${bundleName.toLowerCase()}',$configs);
        }

        public function prepend(ContainerBuilder $container)
        {
            $loader = new YamlFileLoader($container, new FileLocator(__DIR__.'/../../config/'));
            // Loading security config
            $loader->load('security.yaml');
            // Loading doctrine config
            $loader->load('doctrine.yaml');
            // Loading specific bundle config
            //$bundles = $container->getParameter('kernel.bundles');
            // if(isset($bundles['LiipImagineBundle']))
            //{
            //    $loader->load('liip_imagine.yaml');
            //}
        }
    }
    `;
}

export function getSecurityConfig(creatorId: string,bundleName: string): string
{
    return '';
}

export function getDoctrineConfig(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);
    const flcBundleName = ucFirst(bundleName);
    return `doctrine:
    orm:
        mappings:
            ${flcBundleName}Bundle:
                is_bundle: true
                type: annotation
                dir: 'src/Entity'
                prefix: '${baseNamespace}\\Entity'
                alias: ${flcBundleName}
    `;
}

export function getRoutesConfig(creatorId: string,bundleName: string): string
{
    return `controllers:
    resource: ../src/Controller/
    type: annotation
    `;
}

export function getServicesConfig(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);

    return `services:
    _defaults:
        autowire: true
        autoconfigure: true
    ${baseNamespace}\\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'`;
}

export function generatebaseNamespace(creatorId: string,bundleName: string): string
{
    const flcCreatorId = ucFirst(creatorId);
	const flcBundleName = ucFirst(bundleName);
	const baseNamespace = `${flcCreatorId}\\${flcBundleName}Bundle`;
    return baseNamespace;
}

export function ucFirst(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export enum ServicePart {
    command,
    service,
    controller,
    twig,
    form
};

export async function enabledServicePart(servicePart: ServicePart)
{
    if(vscode.workspace.workspaceFolders)
    {
        const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const wsedit = new vscode.WorkspaceEdit();
        const filePath = vscode.Uri.file(`${wsPath}/config/services.yaml`);    
        vscode.window.showInformationMessage(filePath.toString());
        const doc =  await vscode.workspace.openTextDocument(filePath);
        
        var part: string|null = null;
        switch(servicePart)
        {
            case 0 :
                part = "../src/Command"; 
                break;
            case 1:
                part = "../src/Service";
                break;
            case 2:
                part = "../src/Controller";
                break;
            case 3:
                part = "../src/Twig";
                break;
            case 4:
                    part = "../src/Form";
                    break;
            default:
                part = null;
                break;
        }

        if(part !== null)
        {
            
            const lines =doc.getText().split("\n");

            for(const line in lines)
            {
                if(lines[line].includes(part))
                {
                    lines[Number.parseInt(line) -1] = lines[Number.parseInt(line) -1].replace('#','');
                    lines[Number.parseInt(line)] = lines[Number.parseInt(line)].replace('#','');
                    lines[Number.parseInt(line) + 1] = lines[Number.parseInt(line) +1].replace('#','');
                }
            }

            const finalContent = lines.join("\n");
            wsedit.delete(filePath,new vscode.Range(doc.lineAt(0).range.start,doc.lineAt(doc.lineCount - 1).range.end));
            wsedit.insert(filePath,new vscode.Position(0,0),finalContent);
            await vscode.workspace.applyEdit(wsedit);

            try {
                await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', { uri: filePath });
            }
            catch { }

            const fileSaved = await doc.save();
            if (fileSaved) {
                vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            }

            vscode.window.showInformationMessage('Enabled service part ' + servicePart.toString());
        }
        
    }
}
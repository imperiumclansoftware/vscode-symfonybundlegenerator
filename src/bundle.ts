
export function getComposerContent(creatorId: string,bundleName: string): string
{
    const baseNamespace = generatebaseNamespace(creatorId,bundleName);
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

    return JSON.stringify(composerContent,null,4);
}

export function getGitIgnore(): string
{
    return  '/.vscode//vendor/';
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
                "url": `${ucFirst(workspacePath.toString()) + '\\'}`
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
    #${baseNamespace}\\Controller\\:
        #resource: "../src/Controller"
        #tags: ['controller.services_arguments']
    #${baseNamespace}\\Service\\:
        #resource: "../src/Service"
        #tags: ['controller.services_arguments']
    #${baseNamespace}\\Command\\:
        #resource: "../src/Command"
        #tags: ['controller.services_arguments']
    #${baseNamespace}\\Twig\\:
        #resource: "../src/Twig"
        #tags: ['controller.services_arguments']
    #${baseNamespace}\\Form\\:
        #resource: "../src/Form"
        #tags: ['controller.services_arguments']`;
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
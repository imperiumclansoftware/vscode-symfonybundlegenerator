import { basename } from "path";

export function getCommandContent(baseNamespace: string,commandName: string): string
{

    const nsDetails = baseNamespace.split('\\');

    return `<?php

namespace ${baseNamespace}Command;

use Symfony\\Component\\Console\\Style\\SymfonyStyle;
use Symfony\\Component\\Console\\Output\\OutputInterface;
use Symfony\\Component\\Console\\Input\\InputInterface;
use Symfony\\Component\\Console\\Command\\Command;

class ${commandName}Command  extends Command
{
   protected static $defaultName = '${nsDetails[1].replace('Bundle','').toLowerCase()}:${commandName}';

   private $io;

    protected function configure()
    {
        // $this
        //    ->addArgument('argument1', InputArgument::REQUIRED, 'The Argument 1')
        //    ->setHelp('Help of the command ${nsDetails[1].replace('Bundle','').toLowerCase()}:${commandName}');
    }
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->io = new SymfonyStyle($input, $output);
    }
}
`;
}
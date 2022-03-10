import { ucFirst } from "./bundle";

export function getServiceContent(baseNamespace: string,serviceName: string): string
{
    return `<?php

namespace ${baseNamespace}Service;

use Doctrine\\ORM\\EntityManagerInterface;

class ${ucFirst(serviceName)}Service
{
    private $doctrine;

    public function __construct(EntityManagerInterface $doctrine)
    {
        $this->doctrine = $doctrine;
    }
}
`;
}
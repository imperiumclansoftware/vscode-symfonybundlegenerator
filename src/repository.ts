import { ucFirst } from "./bundle";

export function getRepositoryContent(baseNamespace: string,entityName: string)
{
    return `<?php

namespace ${baseNamespace}Repository;

use ${baseNamespace}Entity\\${ucFirst(entityName)};
use Doctrine\\Bundle\\DoctrineBundle\\Repository\\ServiceEntityRepository;
use Doctrine\\Persistence\\ManagerRegistry;

class ${ucFirst(entityName)}Repository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ${ucFirst(entityName)}::class);
    }

    public function getAll()
    {
        return $this->createQueryBuilder('e')
                    ->getQuery()
                    ->getResult();
    }
}
`;
}
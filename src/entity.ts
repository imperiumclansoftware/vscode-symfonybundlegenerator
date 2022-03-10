import { ucFirst } from "./bundle";

export function getEntityContent(baseNamespace: string,entityName: string): string
{
    return `<?php

namespace ${baseNamespace}Entity;

use Doctrine\\ORM\\Mapping as ORM;

/**
 * @ORM\\Entity(repositoryClass="${baseNamespace}Repository\\${ucFirst(entityName)}Repository")
 * @ORM\\Table(schema="public")
*/
class ${ucFirst(entityName)}
{
    /**
     * @ORM\\Id()
     * @ORM\\GeneratedValue()
     * @ORM\\Column(type="integer")
     */
    private $id;
}
`;

}
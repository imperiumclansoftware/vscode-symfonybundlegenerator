import { ucFirst } from "./bundle";

export function getControllerContent(baseNamespace: string, controllerName: string): string
{
    const nsDetails = baseNamespace.split('\\');
    return `<?php

    namespace ${baseNamespace}Controller;
    
    use Symfony\\Component\\Routing\\Annotation\\Route;
    use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
    
    
    class ${ucFirst(controllerName)}Controller extends AbstractController
    {
        /**
         * @Route("/${controllerName.toLowerCase()}", name="${nsDetails[0].toLowerCase()}-${controllerName.toLowerCase()}-homepage")
         */
        public function index()
        {
            return $this->render("@${nsDetails[1].replace('Bundle','')}\\${controllerName.toLowerCase()}\\${controllerName.toLowerCase()}.html.twig",[

            ]);
        }
    }`;

}

export function getControllerTwigContent(baseNamespace: string, controllerName: string): string
{
    return `{% extends "base.html.twig" %}

    {% block title %}${ucFirst(controllerName)} homepage{% endblock %}
    {% block body %}
        <h1>Welcome to ${ucFirst(controllerName)} homepage</h1>
    {% endblock %}

    {% block stylesheets %}
    
    {% endblock %}

    {% block javascripts %}
    
    {% endblock %}
    `;
}
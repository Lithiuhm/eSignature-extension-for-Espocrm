<?php
/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2020 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word
 * 
 * eSignature - Open source plug in module for EspoCRM
 * Copyright (C) 2020 Omar A Gonsenheim
 ************************************************************************/

namespace Espo\Modules\Esignature\Services;

use Espo\Core\Acl;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFound;
use Espo\Core\Htmlizer\Htmlizer;
use Espo\Core\Htmlizer\HtmlizerFactory;
use Espo\Core\Record\ServiceContainer;
use Espo\Entities\User;
use Espo\ORM\Entity;
use Espo\ORM\EntityManager;

/**
 * Renders a PDF template as a full page HTML document. Signature placeholders
 * (@@sig[fieldName]/sig@@) are replaced by the stored signature, or by an empty
 * container that the front-end turns into a signature canvas.
 */
class PrintForEsignature
{
    private const SIGNATURE_PLACEHOLDER_PATTERN = '/@@sig\[([^\]]+)\]\/sig@@/';

    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private ServiceContainer $recordServiceContainer,
        private HtmlizerFactory $htmlizerFactory,
        private User $user
    ) {}

    /**
     * @throws NotFound
     * @throws Forbidden
     */
    public function buildFromTemplate(
        string $entityType,
        string $entityId,
        string $templateId
    ): string {

        $entity = $this->entityManager->getEntityById($entityType, $entityId);
        $template = $this->entityManager->getEntityById('Template', $templateId);

        if (!$entity || !$template) {
            throw new NotFound();
        }

        if ($template->get('entityType') !== $entityType) {
            throw new Forbidden();
        }

        if (!$this->acl->checkEntityRead($entity) || !$this->acl->checkEntityRead($template)) {
            throw new Forbidden();
        }

        $this->recordServiceContainer->get($entityType)->loadAdditionalFields($entity);

        $htmlizer = $this->htmlizerFactory->createForUser($this->user);

        return
            $this->renderHeader($entity, $template, $htmlizer) .
            $this->renderBody($entity, $template, $htmlizer) .
            $this->renderFooter($entity, $template, $htmlizer);
    }

    private function renderHeader(Entity $entity, Entity $template, Htmlizer $htmlizer): string
    {
        // No inline event handlers (blocked by the Content Security Policy);
        // the front-end view binds the actions.
        $buttons =
            '<button title="Close" class="btn btn-default btn-icon-x-wide" id="documentBackButton" ' .
                'type="button" data-action="esignatureClose"><span class="fa fa-times"></span></button>' .
            '<button title="Print" class="btn btn-default btn-icon-x-wide" id="documentPrintButton" ' .
                'type="button" data-action="esignaturePrint"><span class="fa fa-print"></span></button>';

        $header = $htmlizer->render($entity, $template->get('header') ?? '');

        return '<p>' . $buttons . '</p>' . $header;
    }

    private function renderBody(Entity $entity, Entity $template, Htmlizer $htmlizer): string
    {
        $body = str_replace('@@imageEntryPoint@@', 'image', $template->get('body') ?? '');

        $html = $htmlizer->render($entity, $body);

        foreach ($this->findSignatureFieldNames($html) as $field) {
            $value = $entity->get($field) ?:
                '<div class="eSignature" data-field-name="' . htmlspecialchars($field) . '"></div>';

            $html = str_replace('@@sig[' . $field . ']/sig@@', $value, $html);
        }

        return $html;
    }

    private function renderFooter(Entity $entity, Entity $template, Htmlizer $htmlizer): string
    {
        if (!$template->get('printFooter')) {
            return '';
        }

        return $htmlizer->render($entity, $template->get('footer') ?? '');
    }

    /**
     * @return string[]
     */
    private function findSignatureFieldNames(string $html): array
    {
        preg_match_all(self::SIGNATURE_PLACEHOLDER_PATTERN, $html, $matches);

        return array_values(array_unique($matches[1]));
    }
}

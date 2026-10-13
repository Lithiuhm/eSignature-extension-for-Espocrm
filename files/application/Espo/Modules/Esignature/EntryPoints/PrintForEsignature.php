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

namespace Espo\Modules\Esignature\EntryPoints;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\Exceptions\BadRequest;
use Espo\Modules\Esignature\Services\PrintForEsignature as PrintForEsignatureService;

/**
 * Returns a PDF template rendered as a full page HTML document with eSignature placeholders.
 */
class PrintForEsignature implements EntryPoint
{
    public function __construct(
        private PrintForEsignatureService $service
    ) {}

    public function run(Request $request, Response $response): void
    {
        $entityType = $request->getQueryParam('entityType');
        $entityId = $request->getQueryParam('entityId');
        $templateId = $request->getQueryParam('templateId');

        if (!$entityType || !$entityId || !$templateId) {
            throw new BadRequest();
        }

        $html = $this->service->buildFromTemplate($entityType, $entityId, $templateId);

        $response
            ->setHeader('Content-Type', 'text/html; charset=utf-8')
            ->writeBody($html);
    }
}

<?php
namespace Espo\Custom\TemplateHelpers;

use Espo\Core\Htmlizer\Helper;
use Espo\Core\Htmlizer\Helper\Data;
use Espo\Core\Htmlizer\Helper\Result;

class sign_date implements Helper
{
    public function __construct(
        // Pass needed dependencies.
    ) {

    }

    public function render(Data $data): Result
    {
        $color = $data->getOption('color');        
        $text = $data->getArgumentList()[0] ?? '';        

        // Signature timestamp (YYYY-MM-DD HH:MM:SS). Matched without the label in front,
        // because the label is translated ("Firmado electrónicamente a", "Electronically signed on", ...).
        // Base64 image data contains no spaces or colons, so it cannot match.
        $regex = '/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/';

        // Variable para almacenar el resultado
        $result = '';

        if (preg_match($regex, $text, $matches)) {
            $fechaHora = $matches[1];
        }else{ $fechaHora = '';}
        return Result::createSafeString(
            $fechaHora
        );
    }
}
<?php
namespace Espo\Custom\TemplateHelpers;

use Espo\Core\Htmlizer\Helper;
use Espo\Core\Htmlizer\Helper\Data;
use Espo\Core\Htmlizer\Helper\Result;

class img_data implements Helper
{
    public function __construct(
        // Pass needed dependencies.
    ) {

    }

    public function render(Data $data): Result
    {
        $color = $data->getOption('color');        
        $text = $data->getArgumentList()[0] ?? '';        

        // Expresión regular para extraer la cadena base64
        $regex = '/data:image\/png;base64,[A-Za-z0-9+\/=]+/';

        // Variable para almacenar el resultado
        $result = '';

        if (preg_match($regex, $text, $matches)) {
            $firma = $matches[0];
        }else{ $firma = '';}
        return Result::createSafeString(
            $firma
        );
    }
}
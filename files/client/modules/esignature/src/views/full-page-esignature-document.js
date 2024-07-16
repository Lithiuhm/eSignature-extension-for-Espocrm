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

Espo.define('esignature:views/full-page-esignature-document', 'view', function (Dep) {

    return Dep.extend({

        el: '#main',

        setup: function () {
            // run default function
            this.renderDocument();
        },
        
        inlineEditClose: function () { 
            window.history.back();
        },
        
   
        inlineEditSave: function ($el, blankCanvassCode, fieldName) { // substitutes same function at base.js   
            // convert the canvas drawing to image code 
            var imageCode = $el.jSignature('getData','svg'); 
            // compare the contents of the current vs blank canvass to make sure there's a signature to be saved
            if(blankCanvassCode[1] === imageCode[1]) {
                alert("No signature was entered");
                //this.renderDocument();
                return;
            }  
            // register the signature time stamp
            var d = new Date();
            var timestamp = eSignatureISODateString(d);             
            // prepare the signature drawing to be stored in the database integrating the timestamp
            var imageSource = '<img src=data:'+$el.jSignature('getData', 'svg')+'<div style=margin-top:-0.5em;font-size:0.7em;font-style:italic;>Firmado electrónicamente a '+timestamp+'</div>';
            this.notify('Saving...');
            // get the model attributes and load them into a "data" array
            var data = this.model.attributes;
            // store the image code as the field value
            data[fieldName] = imageSource;
            // persist the model with the updated field value
            this.model.save(data,{});
            this.notify(false);
            alert("Signature recorded, to close the document press the 'X' button");                       
            // display (re-render) the signed document
            this.renderDocument();
        },
        
        renderDocument: function(){
            // determine if the user is a portal user
            var isPortal = false;
            if(this.getUser().attributes.isPortalUser) {
                isPortal = true;
            }
            this.options.isPortal = isPortal;
            var url = '?entryPoint=printForEsignature&entityType='+this.options.entityType+'&entityId='+this.options.entityId+'&templateId=' + this.options.templateId+'&isPortal='+this.options.isPortal;
            // use plain javascript ajax to invoke an entryPoint and store the response in the "main" div (full page)
            var xmlhttp = new XMLHttpRequest();
            var model = this.options.model;
            //console.log(model);
            var self = this;
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    // if the ajax call is successful render the content received in <div id="main">
                    if (xmlhttp.status == 200) {
                        document.getElementById("main").innerHTML = xmlhttp.responseText;
                        // use jquery to insert esignature fields
                        var $esignatureFields = $('.eSignature');
                        $esignatureFields.each(function(){
                            // get the field name
                            var fieldName = $(this).data('fieldName');
                            // continue only if the model field is empty
                            var fieldValue = model.get(fieldName);
                            if(!fieldValue) {
                                // initialize jSignature plug-in to display canvas input
                                var $sigDiv = $(this).jSignature({'UndoButton':true, 'color':'rgb(5, 1, 135)','SignHere':true});
                                // get the blank canvass code value to compare against a filled canvas
                                var blankCanvassCode = $sigDiv.jSignature('getData','svg');
                                // add the inline action links ("Update" and "Cancel")
                                var $saveLink = $('<a href="javascript:" class="pull-right inline-save-link">' + self.translate('Update') + '</a>');
                                var $cancelLink = $('<a href="javascript:" class="pull-right inline-cancel-link">' + self.translate('Cancel') + '</a>');
                                var $el = $(this);
                                $el.parent().prepend($saveLink);
                                $el.parent().prepend($cancelLink);
                                $saveLink.click(function () {
                                    self.inlineEditSave($el, blankCanvassCode, fieldName);
                                }.bind(this));
                                $cancelLink.click(function () {
                                    self.inlineEditClose();
                                }.bind(this));                                
                            }                            
                        });
                    }
                    else if (xmlhttp.status == 400) {
                        alert('There was an error 400');
                    }
                    else {
                        alert('something else other than 200 was returned');
                    }
                }
            };
            xmlhttp.open("POST",url , true);
            xmlhttp.send();   
        }    
       
    });
});

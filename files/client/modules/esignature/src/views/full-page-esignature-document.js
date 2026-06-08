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

define("esignature:views/full-page-esignature-document", ["view"], (View) => {
  return class FullPageEsignatureDocumentView extends View {
    el = "#main";

    setup() {
      this.renderDocument();
    }

    inlineEditClose() {
      window.history.back();
    }

    inlineEditSave($el, blankCanvasCode, fieldName) {
      // Convert the canvas drawing to image code
      const imageCode = $el.jSignature("getData", "svg");

      // Compare against blank canvas
      if (blankCanvasCode[1] === imageCode[1]) {
        alert("No signature was entered");
        return;
      }

      // Register the signature timestamp
      const d = new Date();
      const timestamp = eSignatureISODateString(d);

      // Prepare the signature drawing to be stored
      const translatedLabel = this.translate(
        "electronicallySignedOn",
        "messages",
        "Global",
      );
      const imageSource =
        '<img src="data:' +
        $el.jSignature("getData", "svg") +
        '"/>' +
        '<div style="margin-top:-0.5em;font-size:0.7em;font-style:italic;">' +
        translatedLabel +
        " " +
        timestamp +
        "</div>";

      this.notify("Saving...");

      const data = {};
      data[fieldName] = imageSource;

      this.model.save(data, {
        patch: true,
        success: () => {
          this.notify(false);
          alert(
            this.translate("signatureRecorded", "messages", "Global") ||
              "Signature recorded, to close the document press the X button",
          );
          this.renderDocument();
        },
        error: () => {
          this.notify("Error occurred", "error");
        },
      });
    }

    renderDocument() {
      // Determine if the user is a portal user
      const isPortal = !!this.getUser().get("isPortalUser");
      this.options.isPortal = isPortal;

      const url =
        "?entryPoint=printForEsignature" +
        "&entityType=" +
        encodeURIComponent(this.options.entityType) +
        "&entityId=" +
        encodeURIComponent(this.options.entityId) +
        "&templateId=" +
        encodeURIComponent(this.options.templateId) +
        "&isPortal=" +
        isPortal;

      const xmlhttp = new XMLHttpRequest();
      const model = this.options.model;

      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
          if (xmlhttp.status === 200) {
            const mainEl = document.getElementById("main");
            if (mainEl) {
              mainEl.innerHTML = xmlhttp.responseText;
            }

            // Use jQuery to insert esignature fields
            const $esignatureFields = $(".eSignature");

            $esignatureFields.each((index, element) => {
              const $field = $(element);
              const fieldName = $field.data("fieldName");

              // Continue only if the model field is empty
              const fieldValue = model.get(fieldName);

              if (!fieldValue) {
                // Initialize jSignature plugin
                const $sigDiv = $field.jSignature({
                  UndoButton: true,
                  color: "rgb(5, 1, 135)",
                  SignHere: true,
                });

                // Get blank canvas code
                const blankCanvasCode = $sigDiv.jSignature("getData", "svg");

                // Add inline action links
                const $saveLink = $(
                  '<a href="javascript:" class="pull-right inline-save-link">' +
                    this.translate("Update") +
                    "</a>",
                );
                const $cancelLink = $(
                  '<a href="javascript:" class="pull-right inline-cancel-link">' +
                    this.translate("Cancel") +
                    "</a>",
                );

                $field.parent().prepend($saveLink);
                $field.parent().prepend($cancelLink);

                $saveLink.on("click", () => {
                  this.inlineEditSave($field, blankCanvasCode, fieldName);
                });

                $cancelLink.on("click", () => {
                  this.inlineEditClose();
                });
              }
            });
          } else {
            alert("Error loading document (status: " + xmlhttp.status + ")");
          }
        }
      };

      xmlhttp.open("POST", url, true);
      xmlhttp.send();
    }
  };
});

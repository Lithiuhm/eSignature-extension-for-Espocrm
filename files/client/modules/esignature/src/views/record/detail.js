/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2019 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
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
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 *
 * eSignature - Open source plug in module for EspoCRM
 * Copyright (C) 2020 Omar A Gonsenheim
 ************************************************************************/

define("esignature:views/record/detail", ["views/record/detail"], (
  DetailRecordView,
) => {
  return class EsignatureDetailView extends DetailRecordView {
    setupActionItems() {
      super.setupActionItems();

      this.dropdownItemList.push({
        name: "displayEsignatureDocument",
        label: "Display eSignature Document",
      });
    }

    actionDisplayEsignatureDocument() {
      // Get the document's template id if saved as a model field
      if (this.model.attributes.templateId) {
        const templateId = this.model.attributes.templateId;
        const options = {
          entityType: this.model.name,
          entityId: this.model.id,
          templateId: templateId,
          model: this.model,
        };

        this.getRouter().navigate("#EsignatureDocument/showDocument/options");
        this.getRouter().dispatch(
          "EsignatureDocument",
          "showDocument",
          options,
        );
      } else {
        // If the template is not pre-determined, open modal to choose one
        this.createView(
          "pdfTemplate",
          "views/modals/select-template",
          {
            entityType: this.model.name,
          },
          (view) => {
            view.render();

            this.listenToOnce(view, "select", (model) => {
              this.clearView("pdfTemplate");

              const templateId = model.id;
              const options = {
                entityType: this.model.name,
                entityId: this.model.id,
                templateId: templateId,
                model: this.model,
              };

              this.getRouter().navigate(
                "#EsignatureDocument/showDocument/options",
              );
              this.getRouter().dispatch(
                "EsignatureDocument",
                "showDocument",
                options,
              );
            });
          },
        );
      }
    }
  };
});

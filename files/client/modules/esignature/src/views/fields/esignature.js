/************************************************************************
 * eSignature field for EspoCRM 8.x / 9.x
 * Uses jSignature for canvas-based signature capture.
 *
 * Pattern: standard EspoCRM field view with separate detail/edit/list templates.
 * - Detail mode: shows saved signature image or "None"
 * - Edit mode: shows jSignature canvas for signing
 * - Inline edit: disabled (signature is captured only in edit mode)
 ************************************************************************/

define("esignature:views/fields/esignature", ["views/fields/base"], (
  BaseFieldView,
) => {
  return class EsignatureFieldView extends BaseFieldView {
    type = "esignature";

    listTemplate = "esignature:fields/esignature/list";
    detailTemplate = "esignature:fields/esignature/detail";
    editTemplate = "esignature:fields/esignature/edit";

    // Disable standard inline edit — signature is a special interaction
    inlineEditDisabled = true;

    // Track jSignature state
    _jSignatureReady = false;

    setup() {
      super.setup();

      // Once signed, the field becomes read-only
      if (this.model.get(this.name)) {
        this.setReadOnly(true);
      }
    }

    data() {
      const value = this.model.get(this.name);

      return {
        value: value,
        imageSource: value || "",
      };
    }

    afterRenderEdit() {
      // Initialize jSignature canvas after the edit template is in the DOM
      if (!this.model.get(this.name)) {
        setTimeout(() => this._initCanvas(), 0);
      }
    }

    afterRenderDetail() {
      // Nothing special needed — template handles display
    }

    /**
     * Initialize the jSignature canvas on this.$el.
     */
    _initCanvas() {
      if (this._jSignatureReady) return;
      if (!this.$el || !this.$el.length) return;

      this.$el.addClass("eSignature");

      this.$el.jSignature({
        UndoButton: true,
        color: "rgb(5, 1, 135)",
        SignHere: {
          renderer: () => {
            const label = this.translate("signHere", "messages", "Global");
            return $("<div/>", {
              class: "jsign-signhere-badge",
              text: label,
            });
          },
        },
      });

      this._jSignatureReady = true;
    }

    /**
     * Called by the framework when the record form is saved.
     * Returns the field data to persist.
     */
    fetch() {
      const data = {};

      if (this._jSignatureReady) {
        try {
          const strokes = this.$el.jSignature("getData", "native");

          if (strokes && strokes.length) {
            const d = new Date();
            const timestamp = eSignatureISODateString(d);
            const label = this.translate(
              "electronicallySignedOn",
              "messages",
              "Global",
            );

            data[this.name] =
              '<img src="' +
              this.$el.jSignature("getData") +
              '"/>' +
              '<div style="margin-top:-0.5em;font-size:1em;font-style:italic;">' +
              label +
              " " +
              timestamp +
              "</div>";
          } else {
            data[this.name] = this.model.get(this.name) || null;
          }
        } catch (e) {
          data[this.name] = this.model.get(this.name) || null;
        }
      } else {
        data[this.name] = this.model.get(this.name) || null;
      }

      return data;
    }

    /**
     * Reset jSignature state on re-render.
     */
    onRemove() {
      this._jSignatureReady = false;
    }
  };
});

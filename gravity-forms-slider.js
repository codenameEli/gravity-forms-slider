// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

    "use strict";

        var pluginName = "gravityFormsSlider",
            defaults = {
                beforeChange: function(){},
                afterChange: function(){},
                beforeInit: function(){},
                afterInit: function(){},
            };

        function Plugin( element, options, id )
        {
            this.id = id;
            this.element = element;
            this.settings = $.extend( {}, defaults, options );
            this._defaults = defaults;
            this._name = pluginName;

            this.init();
        }

        $.extend( Plugin.prototype, {

            init: function()
            {   
                $(this.element).addClass('gform_slider_wrapper');
                
                // setup data
                this.$form = this.getForm();
                this.$steps = this.getSteps();
                this.totalSteps = this.getStepCount();
                this.currentStep = 1;

                // creation of elements
                this.createElements();

                // setup js based element data
                this.$stepCounterEl = this.getStepCounterEl();
                this.$prevButton = this.getPreviousButton();
                this.$nextButton = this.getNextButton();

                this.goToStep(1);

                this.attachListeners();
            },

            getForm: function()
            {
                return $(this.element).find('form');
            },

            goToStep: function(i)
            {      
                if ( i < this.currentStep && i !== 0 ) { // Going backwards
                    $(this.element).removeClass('last_step');
                    $(this.element).removeClass('current_step_' + this.currentStep);
                    $(this.element).addClass('current_step_' + i);
                }

                if ( i >= this.currentStep && i !== 0 && i !== this.totalSteps+1 ) { // Going forwards
                    $(this.element).removeClass('last_step');
                    $(this.element).removeClass('current_step_' + this.currentStep);
                    $(this.element).addClass('current_step_' + i);
                }

                if ( i === this.totalSteps ) { // On the last step
                    $(this.element).addClass('last_step');
                }

                if ( i <= this.totalSteps && i > 0 ) {
                    $(this.$steps).removeClass('current_step');
                    $(this.$steps[i-1]).addClass('current_step');
                    this.updateCounter(i);
                }
            },

            updateCounter: function(i)
            {
                this.currentStep = i;
                this.$stepCounterEl.find('.current_step_text').text(i);
            },

            getPreviousButton: function()
            {
                return $( $(this.element).find('.prev_button.gravity_forms_slider_control') );
            },

            getNextButton: function()
            {
                return $( $(this.element).find('.next_button.gravity_forms_slider_control') );
            },

            getStepCounterEl: function() 
            {
                return $( $(this.element).find('.gravity_forms_slider_counter') );
            },

            createElements: function()
            {   
                $(this.element).append(
                    '<div class="gravity_forms_slider_controls" id="gravity_forms_slider_controls_' + this.id + '">' + // Start Controls
                        '<button type="button" class="prev_button gravity_forms_slider_control"> << back</button>' +
                        '<div class="step_counter gravity_forms_slider_counter" id="gravity_forms_slider_step_counter_' + this.id + '"><span class="current_step_text">' + this.currentStep + '</span>/' + this.totalSteps + '</div>' +
                        '<button type="button" class="next_button gravity_forms_slider_control">next</button>' +
                    '</div>' // End Controls
                );
            },

            getSteps: function()
            {
                return $(this.element).find('.gfield');
            },

            getStepCount: function()
            {
                return $(this.element).find('.gfield').length;
            },

            reset: function()
            {
                this.currentStep = 0;
            },

            handleErrors: function()
            {   
                if ( $(this.element).hasClass('gform_validation_error') ) {
                    var self = this;
                    var firstError = $(this.element).find('.gfield.gfield_error').first();
                    
                    if ( firstError.length !== 0 ) { // There is a field w/ an invalid value

                        $.grep( this.$steps, function(el, i) { // Find the first error
                            if ( $(el).attr('id') === $(firstError).attr('id') ) {
                                self.goToStep(i+1);
                            }
                        })
                    }
                }
            },

            attachListeners: function()
            {
                var self = this;

                $(this.element).bind('beforeChange', function(e) {
                    if ( typeof self.settings.beforeChange === 'function' ) {
                        self.settings.beforeChange(this, e, self);
                    }
                });

                this.$nextButton.on('click', function(e) {
                    $(self.element).trigger('beforeChange');
                    self.goToStep(self.currentStep+1);
                });

                this.$prevButton.on('click', function(e) {
                    $(self.element).trigger('beforeChange');
                    self.goToStep(self.currentStep-1);
                });

                $(document).on('gform_post_render', function(e, formId) {
                    self.init();
                    self.handleErrors();
                });
            },
        } );

        // A really lightweight plugin wrapper around the constructor,
        // preventing against multiple instantiations
        $.fn[ pluginName ] = function( options ) {
            var id = 0;
            return this.each( function() {
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    $.data( this, "plugin_" +
                        pluginName, new Plugin( this, options, id ) );

                    id++;
                }
            } );
        };

} )( jQuery, window, document );

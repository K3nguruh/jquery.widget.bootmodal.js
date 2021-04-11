;(function($) {
    /************************************************************/
    /*                                                          */
    /* Widget: $.bootmodal()                                    */
    /* Datum:  2021-04-11, 15:30                                */
    /*                                                          */
    /************************************************************/
    $.widget('custom.bootmodal', {
        version: '0.x.x-beta',
        //
        //
        options: {
            /*
            buttons:    null,
            callback:   null,
            classes:    '',
            message:    '',
            modal:      '',
            replace:    null,
            size:       '',
            template:   '',
            title:      '',
            onShow:     null,
            onShown:    null,
            onHide:     null,
            onHidden:   null,
            */
            animated:   true,
            backdrop:   'static',
            centered:   true,
            closable:   true,
            container:  'body',
            delay:      false,
            focus:      true,
            keyboard:   false,
            locale:     'de',
            reverse:    false,
            scrollable: false,
            show:       true,
        },
        //
        //
        locales: {
            de: {
                ok: 'OK',
                cancel: 'Abbruch',
                confirm: 'OK',
            },
            en: {
                ok: 'OK',
                cancel: 'Cancel',
                confirm: 'Confirm',
            },
        },
        //
        //
        regexp: {
            func:   /^function.*\(.*\)\s*\{.*\};?$/,
            number: /^\d+$/,
            empty:  /[^\s]+/,
        },
        //
        //
        templates: {
            modal:
                '<div class="modal" tabindex="-1" role="dialog" aria-hidden="true">' +
                '   <div class="modal-dialog">' +
                '       <div class="modal-content">' +
                '           <div class="modal-body">' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
            header:
                '<div class="modal-header">' +
                '   <h5 class="modal-title"></h5>' +
                '</div>',
            footer:
                '<div class="modal-footer">' +
                '</div>',
            btnEscape:
                '<button type="button" class="btn-escape close" aria-hidden="true">&times;</button>',
            btnModal:
                '<button type="button" class="btn btn-action"></button>',
        },
        /******************************/
        /*                            */
        /* PRIVAT METHODS             */
        /*                            */
        /******************************/
        _create: function() {
            var that = this;
            //
            // ELEMENT
            // --------------------
            that.$this = that.element;
            that._this = that.element[0];
            //
            // BOOTSTRAP
            // --------------------
            if (typeof $.fn.modal === "undefined") {
                throw new Error(
                    '"$.fn.modal" is not defined; please double check you have included the Bootstrap JavaScript library. ' +
                    'See https://getbootstrap.com/docs/4.6/getting-started/introduction/#js for more details.'
                );
            }
            //
            //
            that.options.bsVersion = $.fn.modal.Constructor.VERSION;
            console.log('bsVersion', that.options.bsVersion);
            //
            // WIDGET
            // --------------------
            that.$modal = $(that.templates.modal);
            that.$header = $(that.templates.header);
            that.$footer = $(that.templates.footer);
            that.$btnEscape = $(that.templates.btnEscape);
            that.$dialog = that.$modal.find('.modal-dialog');
            that.$title = that.$header.find('.modal-title');
            that.$body = that.$modal.find('.modal-body');
            that.$container = $(that.options.container);
            //
            //
            if (/*that.$this.prop('nodeName')*/ that._this.nodeName !== "#document") {
                that.$this.hide();
                $.extend(true, that.options, {message: that.$this.html()}, that.$this.data());
            }
            //
            //
            switch (that.options.modal) {
                case "alert":
                    that._modalAlert();
                    break;
                case "confirm":
                    that._modalConfirm();
                    break;
                case "custom":
                    that._modalCustom();
                    break;
                default:
                    throw new Error('modal "' + that.options.modal + '" is not supported.');
            }
        },
        //
        //
        _destroy: function() {
            var that = this;
            //
            //
            that.$modal.off();
            that.$modal.remove();
        },
        //
        //
        _show: function() {
            var that = this;
            //
            //
            that.$modal.modal('show');
        },
        //
        //
        _hide: function() {
            var that = this;
            //
            //
            that.$modal.modal('hide');
        },
        //
        // BOOTMODAL: ALERT
        // --------------------
        _modalAlert: function() {
            var that = this;
            //
            //
            that._buildButtons(['ok']);
            //
            //
            that.options.buttons.ok.callback = that.options.onEscape = function() {
                if (typeof that.options.callback === "function") {
                    return that.options.callback.call(this);
                }
                return true;
            };
            //
            //
            that._modalCustom();
        },
        //
        // BOOTMODAL: CONFIRM
        // --------------------
        _modalConfirm: function() {
            var that = this;
            //
            //
            that._buildButtons(['cancel', 'confirm']);
            //
            //
            if (typeof that.options.callback !== "function") {
                throw new Error('confirm requires the "callback" property.');
            }
            //
            //
            that.options.buttons.cancel.callback = that.options.onEscape = function() {
                return that.options.callback.call(this, false);
            };
            //
            //
            that.options.buttons.confirm.callback = function() {
                return that.options.callback.call(this, true);
            };
            //
            //
            that._modalCustom();
        },
        //
        // BOOTMODAL: CUSTOM
        // --------------------
        _modalCustom: function() {
            var that = this;
            //
            //
            var buttons = {};
            if (that.options.buttons && typeof that.options.buttons !== "object") {
                that.options.buttons = buttons;
            }
            //
            //
            $.each(that.options.buttons, function(key, button) {
                //
                // LABEL
                if (!button.label) {
                    button.label = key;
                }
                //
                // CLASSES
                if (!button.classes) {
                    button.classes = key;
                }
                //
                // CALLBACK
                if (!button.callback) {
                    button.callback = undefined;
                }
                // If the callback is a string and it could be a function, the string is converted into a function.
                if (typeof button.callback === "string" && that.regexp.func.test(button.callback)) {
                    button.callback = new Function('return ' + button.callback)();
                }
                //
                if (typeof button.callback !== "function") {
                    button.callback = undefined;
                }
                //
                // BUTTONS
                buttons[key] = {
                    label: button.label,
                    classes: button.classes,
                    callback: button.callback
                };
            });
            //
            //
            that.options.buttons = buttons;
            //
            //



            //
            //
            that._buildModal();
        },
        //
        //
        _buildButtons: function(labels) {
            var that = this;
            //
            // @BOOLEAN|options.reverse
            if (that.options.reverse) {
                labels = labels.reverse();
            }
            //
            //
            var buttons = {};
            if (that._getKeyLength(that.options.buttons) < 1) {
                that.options.buttons = buttons;
            }
            //
            //
            var allowed = {};
            $.each(labels, function(key, value) {
                allowed[value] = true;
            });
            //
            //
            $.each(that.options.buttons, function(key) {
                if (!allowed[key]) {
                    throw new Error('button key "' + key + '" is not allowed (options are "' + labels.join('" , "') + '").');
                }
            });
            //
            //
            $.each(labels, function(key, value) {
                var key = value = value.toLowerCase();
                var button = that.options.buttons[key];
                //
                //
                if (that._getKeyLength(button) < 1) {
                    button = {};
                }
                //
                //
                if (!button.label) {
                    button.label = that._getLocales(that.options.locale, value);
                }
                //
                //
                if (!button.classes) {
                    switch (key) {
                        case "ok":
                            button.classes = "btn-danger";
                            break;
                        case "cancel":
                            button.classes = "btn-secondary";
                            break;
                        case "confirm":
                            button.classes = "btn-primary";
                            break;
                    }
                }
                //
                //
                buttons[key] = {
                    label: button.label,
                    classes: button.classes,
                    callback: undefined
                };
            });
            //
            //
            that.options.buttons = buttons;
            //
            // CALLBACK: If the callback is a string and it could be a function, the string is converted into a function.
            if (typeof that.options.callback === "string" && that.regexp.func.test(that.options.callback)) {
                that.options.callback = new Function('return ' + that.options.callback)();
            }
        },
        //
        //
        _buildModal: async function() {
            var that = this,
                callbacks = {
                    onEscape: that.options.onEscape
                };
            //
            // @WIDGET|classes
            that.$modal.addClass(that.widgetName);
            that.$modal.addClass(that.widgetName + '-' + that.options.modal);
            //
            // @STRING|options.classes
            if (that.options.classes) {
                that.$modal.addClass(that.options.classes);
            }
            //
            // @BOOLEAN|options.animated
            if (that.options.animated) {
                that.$modal.addClass('fade');
            }
            //
            // @BOOLEAN|options.centered
            if (that.options.centered) {
                that.$dialog.addClass('modal-dialog-centered');
            }
            //
            // @BOOLEAN|options.scrollable
            if (that.options.scrollable) {
                that.$dialog.addClass('modal-dialog-scrollable');
            }
            //
            // @STRING|options.size
            if (that.options.size) {
                switch (that.options.size) {
                    case "sm":
                    case "small":
                        that.$dialog.addClass('modal-sm');
                        break;
                    case "lg":
                    case "large":
                        that.$dialog.addClass('modal-lg');
                        break;
                    case "xl":
                    case "extra-large":
                        that.$dialog.addClass('modal-xl');
                    break;
                }
            }
            //
            // @STRING|options.title
            if (that.options.title) {
                that.$title.html(that.options.title);
                that.$header.insertBefore(that.$body);
            }
            //
            // @BOOLEAN|options.closable
            if (that.options.closable) {
                if (that.options.title) {
                    that.$header.append(that.$btnEscape);
                }
                else {
                    that.$body.append(that.$btnEscape);
                }
            }
            //
            // @STRING|options.template
            if (that.options.template) {
                await $.get(
                    that.options.template + (that.options.template.search(/\?/) !== -1 ? '&' : '?') + 't=' + Date.now()
                )
                .done(function(html) {
                    that.options.message = html;
                })
                .catch(function(err) {
                    throw new Error('File "' + that.options.template + '" not found.');
                });
            }
            //
            // @STRING|options.message
            // @OBJECT|options.replace
            if (that.options.message) {
                if (that.options.replace) {
                    if (that._getKeyLength(that.options.replace) >= 1) {
                        $.each(that.options.replace, function(key, value) {
                            that.options.message = that.options.message.replace(new RegExp('\\B' + key + '\\B', 'g'), value);
                        });
                    }
                    else {
                        throw new Error('"options.replace" must be a object when provided.');
                    }
                }
                //
                that.$body.append(that.options.message);
            }
            else {
                throw new Error('"options.message" must not be a empty string.');
            }
            //
            // @OBJECT|options.buttons
            if (that.options.buttons) {
                if (that._getKeyLength(that.options.buttons) >= 1) {
                    $.each(that.options.buttons, function(key, button) {
                        var $button = $(that.templates.btnModal);
                        //
                        callbacks[key] = button.callback;
                        //
                        $button.data('key', key);
                        $button.addClass(button.classes);
                        $button.html(button.label);
                        //
                        that.$footer.append($button);
                    });
                    //
                    that.$footer.insertAfter(that.$body);
                }
            }
            //
            // @BOOLEAN|options.backdrop
            // @STRING|options.backdrop = 'static'
            if (that.options.backdrop !== "static") {
                that.$modal.on('click.dismiss.bs.modal', function(event) {
                    if (event.target === event.currentTarget) {
                        if (that.options.backdrop === true) {
                            that._getCallback(event, callbacks.onEscape);
                        }
                        // simulates fade in / fade out
                        else {
                            that.$modal.addClass('modal-static');
                            setTimeout(function() {
                                that.$modal.removeClass('modal-static');
                            }, 200);
                        }
                    }
                });
            }
            //
            // @BOOLEAN|options.keyboard
            if (that.options.keyboard) {
                that.$modal.on('keyup', function(event) {
                    if (event.which === 27) {
                        that._getCallback(event, callbacks.onEscape);
                    }
                });
            }
            //
            // @FUNCTION|options.onShow
            if (that.options.onShow) {
                if (typeof that.options.onShow === "function") {
                    that.$modal.on('show.bs.modal', that.options.onShow);
                }
                else {
                    throw new Error('"options.onShow" must be a function when provided.');
                }
            }
            //
            // @FUNCTION|options.onShown
            if (that.options.onShown) {
                if (typeof that.options.onShown === "function") {
                    that.$modal.on('shown.bs.modal', that.options.onShown);
                }
                else {
                    throw new Error('"options.onShown" must be a function when provided.');
                }
            }
            //
            // @NUMBER|options.delay
            if (that.options.delay) {
                if (that.regexp.number.test(that.options.delay)) {
                    that.$modal.on('shown.bs.modal', function(event) {
                        setTimeout(function() {
                            that._getCallback(event, callbacks.onEscape);
                        }, that.options.delay);
                    });
                }
                else {
                    throw new Error('"options.delay" must be a positive number when provided.');
                }
            }
            //
            // @FUNCTION|options.onHide
            if (that.options.onHide) {
                if (typeof that.options.onHide === "function") {
                    that.$modal.on('hide.bs.modal', that.options.onHide);
                }
                else {
                    throw new Error('"options.onHide" must be a function when provided.');
                }
            }
            //
            // @FUNCTION|options.onHidden
            if (that.options.onHidden) {
                if (typeof that.options.onHidden === "function") {
                    that.$modal.on('hidden.bs.modal', that.options.onHidden);
                }
                else {
                    throw new Error('"options.onHidden" must be a function when provided.');
                }
            }
            //
            // #hidden.bs.modal => modal destroy
            that.$modal.one('hidden.bs.modal', function(event) {
                that.destroy();
            });
            //
            // #click.btn-escape => callback onEscape
            that.$modal.on('click', '.btn-escape', function(event) {
                that._getCallback(event, callbacks.onEscape);
            });
            //
            // #click.btn-action => callback buttons
            that.$modal.on('click', '.btn-action:not(.disabled)', function(event) {
                var key = $(event.target).data('key');
                if (key in callbacks) {
                    that._getCallback(event, callbacks[key]);
                }
            });
            //
            // modal show
            that.$modal.appendTo(that.$container);
            that.$modal.modal({
                show: that.options.show,
                backdrop: that.options.backdrop,
                focus: that.options.focus,
                keyboard: that.options.keyboard
            });
        },
        /******************************/
        /*                            */
        /* HELPER METHODS             */
        /*                            */
        /******************************/
        _getLocales: function(locale, button) {
            var that = this;
            //
            //
            if (locale in that.locales === false) {
                throw new Error('The language for "' + locale + '" is not yet supported.');
            }
            //
            //
            if (button in that.locales[locale] === false) {
                throw new Error('Please supply a translation for "' + button + '"');
            }
            //
            //
            return that.locales[locale][button];
        },
        //
        //
        _getCallback: function(event, callback) {
            var that = this;
            //
            //
            event.preventDefault();
            event.stopPropagation();
            //
            // Modal is not closed if the callback returns false
            if (!(typeof callback === "function" && callback.call(that.$modal, event) === false)) {
                that.hide();
            }
        },
        //
        //
        _getKeyLength: function(value) {
            var that = this;
            //
            // undefined, null, {}, [], '', ' ', false, true, [''] === 0
            return  value && that.regexp.empty.test(value) ? Object.keys(value).length : 0;
        },
        /******************************/
        /*                            */
        /* PUBLIC METHODS             */
        /*                            */
        /******************************/
        show: function() {
            this._show();
        },
        //
        //
        hide: function() {
            this._hide();
        },
    });
    /************************************************************/
    /*                                                          */
    /* Widget: XXX                                              */
    /*                                                          */
    /************************************************************/
})(jQuery);
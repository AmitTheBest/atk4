
$.each({
    dialogPrepare: function(options){
                       /*
                        * This function creates a new dialog and makes sure other dialog-related functions will
                        * work perfectly with it
                        */
        var dialog=$('<div class="dialog dialog_autosize" title="Untitled"><div style="min-height: 300px"></div>').appendTo('body');
        if(options.noAutoSizeHack)dialog.removeClass('dialog_autosize');
        dialog.dialog(options);
        if(options.customClass){
            dialog.parent().addClass(options.customClass);
        }
        $.data(dialog.get(0),'opener',this.jquery);
        $.data(dialog.get(0),'options',options);
        $(window).resize(function() {
            dialog.dialog("option", "position", {my: "center", at: "center", of: window});
        });

        return dialog;
    },
    getDialogData: function(key){
        var dlg=this.jquery.closest('.dialog').get(0);
        if(!dlg)return null;
        var r=$.data(dlg,key);
        if(!r){
            return null;
        }
        return r;
    },
    getFrameOpener: function(){
        var d=this.getDialogData('opener');
        if(!d)return null;
        return $(this.getDialogData('opener'));
    },
    dialogBox: function(options){

        if (!options.ok_label) options.ok_label = 'Ok';
        if (!options.ok_class) options.ok_class = 'atk-effect-primary';

        var buttons=[];

        buttons.push({
            text: options.ok_label,
            class: options.ok_class,
            click: function(){
                var f=$(this).find('form');
                if(f.length)f.eq(0).submit(); else $(this).dialog('close');
            }
        });
        buttons.push({
            text: 'Cancel',
            click: function(){
                $(this).dialog('close');
            }
        });

        return this.dialogPrepare($.extend({
            bgiframe: true,
            modal: true,
            width: 1000,
            position: { my:'top',at:'top+100','of':window },
            autoOpen:false,
            beforeClose: function(){
                if($(this).is('.atk4_loader')){
                    if(!$(this).atk4_loader('remove'))return false;
                }
            },
            buttons: buttons,
            open: function(x){
                $("body").css({ overflow: 'hidden' })
                .children('.atk-layout').addClass('visible-dialog');
                $(x.target).css({'max-height': $(window).height()-180});
            },
            close: function(){
                $("body").css({ overflow: 'auto' })
                .children('.atk-layout').removeClass('visible-dialog');
                $(this).dialog('destroy');
                $(this).remove();
            }
        },options));
    },
    dialogURL: function(title,url,options,callback){
        if(typeof url == 'undefined'){
            url=title;
            title='Untitled Dialog';
        }
        var dlg=this.dialogBox($.extend(options,{title: title,autoOpen: true}));
        dlg.closest('.ui-dialog').hide().fadeIn('slow');
        dlg.atk4_load(url,callback);
        return dlg.dialog('open');
    },
    frameURL: function(title,url,options,callback){
        options=$.extend({
            buttons:{}
        },options);
        return this.dialogURL(title,url,options,callback);
    },
    dateTimePickerFix: function(sh) {
        sh = $('#'+sh);
        this.jquery.change(function() {
            var p=$(this).val().split(" "); // new value
            if(p.length<2) {
                // time chopped off, get it back!
                $(this).val(p[0]+" "+sh.val().split(" ")[1]);
            }else{
                sh.val($(this).val());
            }
        });
    },
    dialogOK: function(title,text,fn,options){
        var dlg=this.dialogBox($.extend({
            title: title,
            width: 450,
            //height: 150,
            close: fn,
            open: function() {
                $(this).parents('.ui-dialog-buttonpane button:eq(0)').focus();
            },
            buttons: {
                'Ok': function(){
                    $(this).dialog('close');
                }
            }
        },options));
        dlg.html(text);
        dlg.dialog('open');

    },
    dialogConfirm: function(title,text,fn,options){
        /*
         * Displays confirmation dialogue.
         */
        var dlg=this.dialogBox($.extend({title: title, width: 450, height: 200},options));

        dlg.html("<form></form>"+text);
        dlg.find('form').submit(function(ev){ ev.preventDefault(); if(fn)fn(); dlg.dialog('close'); });
        dlg.dialog('open');
    },
    dialogError: function(text,options,fn){
        this.dialogConfirm('Error','<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>'+text,null,
                           $.extend({buttons:{'Ok':function(){ $(this).dialog('close');if(fn)fn()}}},options));
    },
    dialogAttention: function(text,options,fn){
        this.dialogConfirm('Attention!','<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>'+text,null,
                           $.extend({buttons:{'Ok':function(){ $(this).dialog('close');if(fn)fn()}}},options));
    },
    message: function(msg,html){
        html.find('span').text(msg);

        html.find('.do-close').click(function(e){e.preventDefault();html.remove();});

        var dest=$("body");
        if(dest.length){
            html.prependTo(dest);
            return html;
        }else{
            alert(msg);
            return false;
        }
    },
    successMessage: function(msg,time){
        var html=$('<div class="atk-layout-row" style="position: fixed; z-index: 1000">\
    <div class="atk-swatch-green atk-cells atk-padding-small">\
      <div class="atk-cell atk-jackscrew"><i class="icon-info"></i>&nbsp;<span>Agile Toolkit failed to automatically renew certificate.</span></div>\
      <div class="atk-cell"><a href="javascript: void()" class="do-close"><i class="icon-cancel"></i></a></div>\
    </div>\
  </div>');
        this.message(msg,html);
        setTimeout(function() { html.remove();},time?time:8000);
    },
    errorMessage: function(msg,time){
        var html=$('<div class="atk-layout-row" style="position: fixed; z-index: 1000">\
    <div class="atk-swatch-red atk-cells atk-padding-small">\
      <div class="atk-cell atk-jackscrew"><i class="icon-attention"></i>&nbsp;<span>Agile Toolkit failed to automatically renew certificate.</span></div>\
      <div class="atk-cell"><a href="javascript: void()" class="do-close"><i class="icon-cancel"></i></a></div>\
    </div>\
  </div>');
        this.message(msg,html);
        if(time)setTimeout(function() { html.remove();},time);
    },
    closeDialog: function(){
        var r=this.getFrameOpener();
        if(!r)return;
        this.jquery.closest('.dialog').dialog('close');
        this.jquery=r;
    },
    loadingInProgress: function(){
        this.successMessage('Loading is in progress. Please wait');
    }
},$.univ._import);

var oldcr = $.ui.dialog.prototype._create;
$.ui.dialog.prototype._create = function(){
    var self=this;
    $('<div/>').insertBefore(this.element).on('remove',function(){
        self.element.remove();
    });
    oldcr.apply(this,arguments);
};



/**
 * _allowInteraction fix to accommodate windowed editors
 *
 * This is blocker issue if you want to open CKEditor or TinyMCE editor dialog
 * from JUI dialog because JUI doesn't give focus outside of it's dialog window.

 * @url http://bugs.jqueryui.com/ticket/9087#comment:39
 * @url https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/#using-_super-and-_superapply-to-access-parents
 * @note Tested on jQuery UI v1.11.x
 */
$.widget( "ui.dialog", $.ui.dialog, {
    _allowInteraction: function( event ) {
        if ( this._super( event ) ) {
            return true;
        }

        // address interaction issues with general iframes with the dialog
        if ( event.target.ownerDocument != this.document[ 0 ] ) {
            return true;
        }

        // address interaction issues with dialog window
        if ( !!$( event.target ).closest( ".cke_dialog, .mce-window, .moxman-window" ).length ) {
            return true;
        }

        // address interaction issues with iframe based drop downs in IE
        if ( !!$( event.target ).closest( ".cke" ).length ) {
            return true;
        }
    }
});

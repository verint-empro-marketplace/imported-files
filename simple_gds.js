function defineDefaultStyle(){
    var recommended = [
        'file'
    ];

    defaultNewStyle(recommended);

	$(formName()).trigger('_style_defultsProvided',[recommended]);
}

function applyNewStyle(){
	var hasDefaultsInArguments = (typeof arguments[0] !== "undefined" && Array.isArray(arguments[0]));
    if (hasDefaultsInArguments){
        defaultNewStyle(arguments[0])
    }

    var elementsToUpdate = [
        ['.file-gov'], 
        ['.file-gov[class*="file-limit-"]','file-limit'],
        ['[data-type="text"] div:first-child .dform_hidden','txt-hidden'],
    ];
    
    elementsToUpdate.forEach(function(item){
        var elements = $(item[0]);
        if (elements.length > 0){
            if (item.length == 1){
                updateStyle(elements, item[0].replace('.', ''));
            }else{
                updateStyle(elements, item[1]);
            }
        }
    });
	
	$(formName()).trigger('_style_styleApplied',[elementsToUpdate, (hasDefaultsInArguments) ? arguments[0] : false]);
}


function applyNewerStyle(elements){
    updateStyle(elements);
}

function updateStyle(elements, optionalName){
    $.each(elements, function(){
        individualApplyStyle($(this), optionalName);
    });
	$(formName()).trigger('_style_updateStyleDone',[elements, optionalName]);
}

var updateStyleFunctions = {
	
	'file-gov': function(element){
		$("[type='file']").attr('title', 'File upload');
		element.find('> div > label').removeAttr("for");
        	var el = element.find('input').not(":has(.file-gov-icon-a)");
        	el.after('<span class="file-gov-icon"><span class="file-gov-icon-a"></span><span class="file-gov-icon-b"></span><label class="file-gov-text">Select Files...</label></span>');
        	el.parent().css('position', 'relative');
        	el.find("input").insertAfter(el.find(".file-gov-icon"));
        	element.find('.helptext').each(function(){
    
            		$(this).insertAfter($(this).parent().find(".file-gov-icon"));
        	});
	},
	'file-limit': function(element){
    		var classes = element.attr('class').split(/\s+/);
    		var hasClass = false;
    		for (var i = 0; i < classes.length; i++){
    			if (classes[i].startsWith('file-limit-')){
    				hasClass=classes[i];
    			}
    		}
    		if (hasClass){
    			var number = hasClass.substring(11, hasClass.length);
    			number = parseInt(number,10);
    			if (!(Number.isInteger(number) && number > 0 && number < 32)){
    				number = 3;
    			}
    			element.find('.file-gov-text').text('Select up to '+number+' files');
    			element.find('.dform_filenames').off('DOMNodeInserted DOMNodeRemoved').on('DOMNodeInserted DOMNodeRemoved', function(event) {
    				var current = $(this).children('span').length;
				if (event.type == 'DOMNodeInserted'){
    					if(current >= number){
    						$(this).parent().find('input').addClass('visibility-hidden');
    						$(this).parent().find('.file-gov-text').text('Storage Full');
						$(formName()).trigger('_style_fileUploaded',[number,number,0])
    					}else{
    						$(this).parent().find('.file-gov-text').text('Select up to '+(number-current)+' more');
						$(formName()).trigger('_style_fileUploaded',[current,number,number-current])
    					}
    				} else {
					$(this).parent().find('input').removeClass('visibility-hidden');
						if(current-1 == 0){
							$(this).parent().find('.file-gov-text').text('Select up to '+number+' files');
						} else {
							$(this).parent().find('.file-gov-text').text('Select up to '+(number-(current-1))+' more');
						}
					$(formName()).trigger('_style_fileUploaded',[0,number,(number-(current-1))]);
    				}
    			});
    		}
    	},
}

function individualApplyStyle(element, specificVal){
	if (specificVal !== null){
		if(updateStyleFunctions[specificVal] != undefined){
			updateStyleFunctions[specificVal](element);

			$(formName()).trigger('_style_elementUpdated',[element, specificVal, true]);
		}
	}
}

function formName(){
	if (KDF.kdf().name){
		return '#dform_'+KDF.kdf().name;
	}else{
		return '#dform_container';
	}
}

Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};
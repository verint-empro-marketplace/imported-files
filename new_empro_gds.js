/**
=====================================
        ACCORDION - START
=====================================
**/
function addAccordion(){
	var elements = $('.accordion');
	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];
	    var search_widget_name = $(element).find('fieldset[data-type="search"]').data('field');
	    var label;

	    if (search_widget_name.toLowerCase().indexOf("customer") >= 0) {
		label = "individual";
	    }
	    else if (search_widget_name.toLowerCase().indexOf("organization") >= 0) {
		label = "organization";
	    }
	    else if (search_widget_name.toLowerCase().indexOf("property") >= 0) {
		label = "property";
	    }
	    else {
		label = "street";
	    }

	    $(element).find('fieldset[data-type="search"]').wrap('<div class="accordion_container" data-for="' + search_widget_name + '"></div>');

	    $('.accordion_container[data-for="' + search_widget_name + '"]').prepend('<label class="accordion_label" data-for="' + search_widget_name + '">Search for ' + label + '</label>');

	    $(element).find('fieldset[data-type="search"]').wrap('<div class="accordion_content" data-for="' + search_widget_name + '" style></div>');

	    $('.accordion_label[data-for="' + search_widget_name + '"]').click(function () {
		$(this).toggleClass("closed");
		var data = $(this).data('for');
		var isClosed = $(this).hasClass('closed');
		if (isClosed) {
		    $('.accordion_content[data-for="' + data + '"]').hide();
		} else {
		    $('.accordion_content[data-for="' + data + '"]').show();
		}
	    });
	}
	if (KDF.getVal('txt_customer_id') !== '' && typeof KDF.getParams().customerid !== 'undefined') {
		$('.accordion_label[data-for="dform_widget_cs_customer_search_id"]').click();
	}
}//end addAccordion
/**
=====================================
        ACCORDION - END
=====================================
**/
/** 
=====================================
            STYLING - START
=====================================
**/

function toggleDebugStyle(){debugStyle = !debugStyle;} var debugStyle = false;

function commonRegex() {
    regexSearch('[0-9A-Za-z ]{2,}', '.dform_widget_searchfield.txt-gov [data-customalias="name"]');
    regexSearch('[0-9A-Za-z ]{1,}',
        '.dform_widget_searchfield.txt-gov [data-customalias="forename"]');	
}

function defineDefaultStyle() {
	replaceHeader('header1','h1');
	replaceHeader('header2','h2');
	replaceHeader('header3','h3');
	replaceHeader('header4','h4');
	replaceHeader('header5','h5');
	replaceHeader('header6','h6');
	
	updateCPETitle();
	addAutoComplete();
	toggleFormControlsButton();
	
    //define listeners here 
    var recommended = [
        'mchk', 'chk', 'rad', 'txt', 'dt', 'eml', 'num', 'pas', 'tel', 'time', 'txta', 'sel', 'file', 'btn', 'search', 'highlightRequired', 'search-no-results', 'field-label-right-align', 'txta-length', 'txta-length-listener', 'detailToggle', 'noResultsFound', 'selectResult', 'txt-enter-trigger-btn'
		, 'search-empty-search'
    ];
    if (debugStyle) console.debug('@defineDefaultStyle() the defined recommended styles that will be used [' + recommended.toString() + ']')
    defaultNewStyle(recommended);
    $(formName()).trigger('_style_defultsProvided', [recommended]);
}

function defaultNewStyle(elements) {
    //adds the classes that are used for styling as well as for indication where functionility should be added in applyNewStyle
    if (elements === null) {
        return "Not valid - valid elements are ['mchk', 'chk', 'rad', 'txt', 'dt', 'eml', 'num', 'pas', 'tel', 'time', 'txta', 'sel', 'file', 'btn', 'txta-length','search','highlightRequired', 'file-progress',  'txt-no-min-height',  'sel-fill']";
    }
    if (elements == "all" || elements == "recommended") {
        //adds the recommended default styling
        defineDefaultStyle();
        return;
    } else {  
        elements.forEach(function (element) {
            var validStyle = true;
            switch (element) {
                case "all":
                case "recommended":
                    validStyle = false;
                    defineDefaultStyle();
                    break;
                case "mchk": $("[data-type='multicheckbox']").addClass('mchk-gov'); break;
                case "chk": $("[data-type='checkbox']").addClass('chk-gov'); break;
                case "rad": $("[data-type='radio']").addClass('rad-gov'); break;
                case "txt": $("[data-type='text']").addClass('txt-gov'); break;
                case "dt": $("[data-type='date']").addClass('dt-gov'); break;
                case "eml": $("[data-type='email']").addClass('eml-gov'); break;
                case "num": $("[data-type='number']").addClass('num-gov'); break;
                case "pas": $("[data-type='password']").addClass('pas-gov'); break;
                case "tel": $("[data-type='tel']").addClass('tel-gov'); break;
                case "time": $("[data-type='time']").addClass('time-gov'); break;
                case "txta": $("[data-type='textarea']").addClass('txta-gov'); break;
                case "sel": 
			$("[data-type='select']").addClass('sel-gov');
			break;
                case "file": $("[data-type='file']").addClass('file-gov'); break;
                case "btn": $("[data-type='button']").addClass('btn-gov'); break;
                case "search": $(".dform_widget_type_search").addClass('search-gov'); break;

                case "txta-length":
                    $("[data-type='textarea'] > div:last-child").addClass('txta-length');
                    break;
                case "highlightRequired":
                    highlightRequired();
                    break;
                case "field-label-right-align": 
                    $(getFieldsLabels('left')).parent().parent().addClass('text-align-right');
                    break;

                //Non-recommended defaults below
                case "sel-fill"://example of how to add optional default styles
                    $("[data-type='select']").addClass('sel-fill');
                    break;
                case "file-progress":
                    $("[data-type='file']").addClass('file-progress');
                    break;
                case "txt-no-min-height":
                    $("[data-type='text']").addClass('txt-no-min-height');
                    break;
                case "field-mob": 
                    $("[type='text'], [type='date'], [type='email'], [type='number'], [type='password'], [type='tel'], [type='time'], [type='textarea']").addClass('field-mob');
                    break;
                case "search-no-results":
                    $('.dform_widget_type_search').addClass('search-no-results');
                    break;

                case "rad-margin-8": $("[data-type='radio']").addClass('rad-margin-8'); break;
                case "mchk-margin-8": $("[data-type='multicheckbox']").addClass('mchk-margin-8'); break;
                case "btn-margin-8": $(".dform_widget_type_button").addClass('btn-margin-8'); break;
                case "rad-margin-16": $("[data-type='radio']").addClass('rad-margin-16'); break;
                case "mchk-margin-16": $("[data-type='multicheckbox']").addClass('mchk-margin-16'); break;
                case "btn-margin-16": $(".dform_widget_type_button").addClass('btn-margin-16'); break;
                case "rad-margin-25": $("[data-type='radio']").addClass('rad-margin-25'); break;
                case "mchk-margin-25": $("[data-type='multicheckbox']").addClass('mchk-margin-25'); break;
                case "btn-margin-25": $(".dform_widget_type_button").addClass('btn-margin-25'); break;
                case "rad-margin-33": $("[data-type='radio']").addClass('rad-margin-33'); break;
                case "mchk-margin-33": $("[data-type='multicheckbox']").addClass('mchk-margin-33'); break;
                case "btn-margin-33": $(".dform_widget_type_button").addClass('btn-margin-33'); break;
                case "rad-margin-41": $("[data-type='radio']").addClass('rad-margin-41'); break;
                case "mchk-margin-41": $("[data-type='multicheckbox']").addClass('mchk-margin-41'); break;
                case "btn-margin-41": $(".dform_widget_type_button").addClass('btn-margin-41'); break;
                case "rad-margin-50": $("[data-type='radio']").addClass('rad-margin-50'); break;
                case "mchk-margin-50": $("[data-type='multicheckbox']").addClass('mchk-margin-50'); break;
                case "btn-margin-50": $(".dform_widget_type_button").addClass('btn-margin-50'); break;
                case "rad-margin-58": $("[data-type='radio']").addClass('rad-margin-58'); break;
                case "mchk-margin-58": $("[data-type='multicheckbox']").addClass('mchk-margin-58'); break;
                case "btn-margin-58": $(".dform_widget_type_button").addClass('btn-margin-58'); break;
                case "rad-margin-66": $("[data-type='radio']").addClass('rad-margin-66'); break;
                case "mchk-margin-66": $("[data-type='multicheckbox']").addClass('mchk-margin-66'); break;
                case "btn-margin-66": $(".dform_widget_type_button").addClass('btn-margin-66'); break;
                case "rad-margin-75": $("[data-type='radio']").addClass('rad-margin-75'); break;
                case "mchk-margin-75": $("[data-type='multicheckbox']").addClass('mchk-margin-75'); break;
                case "btn-margin-75": $(".dform_widget_type_button").addClass('btn-margin-75'); break;
                case "rad-margin-83": $("[data-type='radio']").addClass('rad-margin-83'); break;
                case "mchk-margin-83": $("[data-type='multicheckbox']").addClass('mchk-margin-83'); break;
                case "btn-margin-83": $(".dform_widget_type_button").addClass('btn-margin-83'); break;
                case "rad-margin-91": $("[data-type='radio']").addClass('rad-margin-91'); break;
                case "mchk-margin-91": $("[data-type='multicheckbox']").addClass('mchk-margin-91'); break;
                case "btn-margin-91": $(".dform_widget_type_button").addClass('btn-margin-91'); break;

                case "field-text-align-left":
                    $("[type='text'], [type='date'], [type='email'], [type='number'], [type='password'], [type='tel'], [type='time']").addClass('text-align-left');
                    break;
                case "rad-text-align-left":
                    $("[data-type='multicheckbox']").addClass('text-align-left');
                    break;
                case "mchk-text-align-left":
                    $("[data-type='radio']").addClass('text-align-left');
                    break;
                case "field-text-align-center":
                    $("[type='text'], [type='date'], [type='email'], [type='number'], [type='password'], [type='tel'], [type='time']").addClass('text-align-center');
                    break;
                case "rad-text-align-center":
                    $("[data-type='multicheckbox']").addClass('text-align-center');
                    break;
                case "mchk-text-align-center":
                    $("[data-type='radio']").addClass('text-align-center');
                    break;
                case "rad-text-align-right":
                    $("[data-type='multicheckbox']").addClass('text-align-right');
                    break;
                case "mchk-text-align-right":
                    $("[data-type='radio']").addClass('text-align-right');
                    break;
                case "field-text-align-right":
                    $("[data-type='text'], [data-type='date'], [data-type='email'], [data-type='number'], [data-type='password'], [data-type='tel'], [data-type='time']").addClass('text-align-right');
                    break;
                //LISTENERS - if after _KDF_ready, apply them with addStyleListeners(['a_listenerFunctions_property','it_supports_lists'])
                case 'txta-length-listener':
                    listenerFunctions['txta-length-listener']();
                    break;
                case 'detailToggle':
                    listenerFunctions['detailToggle']();
                    break;
                case 'noResultsFound':
                    listenerFunctions['noResultsFound']();
                    break;
                case 'selectResult':
                    listenerFunctions['selectResult']();
                    break;
                case 'txt-enter-trigger-btn':
                    listenerFunctions['txt-enter-trigger-btn']();
                    break;
                case'search-empty-search':
              			listenerFunctions['search-empty-search']()
              			break;
                default:
                    validStyle = false;
            }
            if (validStyle) {
                $(formName()).trigger('_style_classOfOptionAdded', [element]);
            }

        });
    }
}

function applyNewStyle() {
    var hasDefaultsInArguments = (typeof arguments[0] !== "undefined" && Array.isArray(arguments[0]));
    if (hasDefaultsInArguments) {
        if (debugStyle) console.debug('@applyNewStyle() since this was passed an array, will call defaultNewStyle() to add classes to relevent objects before continuing');
        defaultNewStyle(arguments[0])
    }
    //code for controlling what gets updated 
    //if there is no function name then it presumes the function name is the selector excluding the first (.)
    var elementsToUpdate = [
        //single class name
        ['.rad-gov'], ['.chk-gov'], ['.mchk-gov'], ['.warning-notice'], ['.info-notice'], ['.txta-gov'], ['.file-gov'], ['.search-gov'], ['.detail-gov'], ['.search-no-results'],
	['.required-notice'], ['.sel-gov'],
        //grouped class names
        ['.file-gov[class*="file-limit-"]','file-limit'],
        ['[data-type="text"] div:first-child .dform_hidden','txt-hidden'],
        ['.mchk-gov[class*="mchk-margin-"]','mchk-margin'],
        ['.rad-gov[class*="rad-margin-"]','rad-margin'],
    ];
    if (debugStyle) console.debug('@applyNewStyle() the list classes used as the selector and the name of the function are: '+JSON.stringify(elementsToUpdate))
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
	
	//needs to be applied after styles are added
	commonRegex();
	
	$(formName()).trigger('_style_styleApplied',[elementsToUpdate, (hasDefaultsInArguments) ? arguments[0] : false]);
}


function applyNewerStyle(elements) { updateStyle(elements); }
function updateStyle(elements, optionalName) {
    //used to apply the JS side of the new styles to elements
    //call directly after _KDF_ready if you need to add the style JS to a new/changed element (like after adding a check in a rad)
    $.each(elements, function() {
        individualApplyStyle($(this), optionalName);
    });
	$(formName()).trigger('_style_updateStyleDone',[elements, optionalName]);
}
//defined as functions within array to make it reusable and easy to expand
var updateStyleFunctions = {
	'mchk-gov': function(element){
		var el = element.find('> div > fieldset > span').not(":has(span)");
        el.append('<span class="mchk-check"></span>');
	},
	'rad-gov': function(element){
		var el = element.find('> div > fieldset > span').not(":has(span)");
        el.append('<span class="rad-check"></span>');
	},
	'warning-notice': function(element){
		var el = element.not(":has(.warning-notice-icon-a)");
        el.append('<span class="warning-notice-icon"><span class="warning-notice-icon-a"></span><span class="warning-notice-icon-b"></span><span class="warning-notice-icon-c"></span></span>');
	},
	'info-notice': function(element){
		var el = element.not(":has(.info-notice-icon-a)");
        el.append('<span class="info-notice-icon"><span class="info-notice-icon-a"></span><span class="info-notice-icon-b"></span><span class="info-notice-icon-c"></span></span>');
	},
	'txta-gov': function(element){
		var el = element.find('> div:last-child').not(":has(.txta-length-message)");
        el.append('<div class="txta-length-message"></div>');
	},
	'search-gov': function(element){
		element.find('.dform_widget_searchfield').addClass('txt-gov');
        element.find('button').addClass('btn-gov');
	},
	'chk-gov': function(element){
		var el = element.find('> div').not(":has(span.chk-check)")
		el.append('<span class="chk-check"></span>');
		el.find(".helptext").insertAfter(element.find("label"));
	},
	'file-gov': function(element){
		$("[type='file']").attr('title', 'File upload');
		element.find('> div > label').removeAttr("for");
        	var el = element.find('input').not(":has(.file-gov-icon-a)");
        	el.after('<span class="file-gov-icon"><span class="file-gov-icon-a"></span><span class="file-gov-icon-b"></span><label class="file-gov-text">Select Files...</label></span>');
        	el.parent().css('position', 'relative');
        	el.find("input").insertAfter(el.find(".file-gov-icon"));
		//if element selector is used, then it won't update elements that already have be updated
        	element.find('.helptext').each(function(){
            		//used to rearrange elements
            		$(this).insertAfter($(this).parent().find(".file-gov-icon"));
        	});
	},
	'detail-gov': function(element){
		element.find('> p:first-child').each(function(){
                $(this).text("►"+$(this).text());
                $(this).wrap('<button class="detail-title btn-link"></button>');
                $(this).contents().unwrap();
        });
        element.each(function(){
            $(this).children(':not(button)').wrapAll('<div class="detail-block"></div>');
        });
	},
	'required-notice': function(element){
		var requiredMessage = 'Required fields will be marked with an asterisk (*)';
		var classStyle = 'paragraph-normal';
		element.prepend("<p>"+requiredMessage+"</p>");
		updateStyle(element.addClass('info-notice width-fit-content'), 'info-notice');
		element.find('p, li').addClass(classStyle);
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
							//Removed all files - display total number that can be uploaded
							$(this).parent().find('.file-gov-text').text('Select up to '+number+' files');
						} else {
							//at least one file is uploaded - display number left
							$(this).parent().find('.file-gov-text').text('Select up to '+(number-(current-1))+' more');
						}
				
					$(formName()).trigger('_style_fileUploaded',[0,number,(number-(current-1))]);
    				}
    			});
    		}else{
    			if (debugStyle) console.debug("A file limit couldn't be applied to an element because it didn't have a file-limit-[number] style ")
    		}
    	},
	'search-no-results': function(element){
        element.find('select').css('margin-right','0.25rem')
		var el = element.find('.dform_widget_search_closeresults');
		el.addClass('btn-continue');
		el.text('Search again');
	},
	'txt-hidden': function(element){
	    element.parent().addClass('txt-hidden');
	},
	'rad-margin': function(element){
	   	
    		var classes = element.attr('class').split(/\s+/);
    		var hasClass = false;
    		var startString = 'rad-margin-';
    		for (var i = 0; i < classes.length; i++){
    			if (classes[i].startsWith(startString)){
    				hasClass=classes[i];
    			}
    		}
    		if (hasClass){
    			var number = hasClass.substring(startString.length, hasClass.length);
    			number = parseInt(number,10);
    			if (Number.isInteger(number) && number >= 0 && number <= 100){
				marginArrange(element.find('legend'), 'rad-margin-'+number+'-legend');
			}else{
    		    		if (debugStyle) console.debug(hasClass + 'is not a valid rad-margin, try rad-margin-50');
    			}
    		}else{
    	    		if (debugStyle) console.debug('Could not add rad-margin to element. Try adding the class rad-margin-# (e.g. rad-margin-50) first')
    		}
	},
	'mchk-margin': function(element){
	  
    	var classes = element.attr('class').split(/\s+/);
    	var hasClass = false;
    	var startString = 'mchk-margin-';
    	for (var i = 0; i < classes.length; i++){
    		if (classes[i].startsWith(startString)){
    			hasClass=classes[i];
    		}
    	}
    	if (hasClass){
    		var number = hasClass.substring(startString.length, hasClass.length);
    		number = parseInt(number,10);
    		if (Number.isInteger(number) && number >= 0 && number <= 100){
				marginArrange(element.find('legend'), 'mchk-margin-'+number+'-legend');
    		}else{
    		    if (debugStyle) console.debug(hasClass + 'is not a valid mchk-margin, try mchk-margin-50');
    		}
    	}else{
    	    if (debugStyle) console.debug('Could not add mchk-margin to element. Try adding the class mchk-margin-# (e.g. mchk-margin-50) first')
    	}
	},
	'sel-gov': function(element){
		var el = element.find('select');
		var el_ID = element.attr('id');
		var searchWidget = false;
		
		typeof el_ID !== 'undefined' ? el_ID.includes('_resultholder') === true ? searchWidget = true : searchWidget = false : searchWidget = false
		
			if (el.find('option:first').val() === '' && el.find('option').length  > 1) {
				el.find('option:first').val('');
				el.find('option:first').text('Please select...');
				el.find('option:first').removeAttr('disabled');
				el.find('option:first').prop('hidden', true);
			}
			else {
				el.find('option:first').text('No results...');
				el.find('option:first').val('No results...');
				el.find('option:first').prop('hidden', true);
			}
	},
}

function individualApplyStyle(element, specificVal){
	//used to update elements that have be edited and require their JS functionility updated/refreshed
	if (specificVal !== null){
		if(updateStyleFunctions[specificVal] != undefined){
			updateStyleFunctions[specificVal](element);

			$(formName()).trigger('_style_elementUpdated',[element, specificVal, true]);
		}else{
			if (debugStyle) console.debug('Style not updated - style name was '+specificVal+' and element was:');
			if (debugStyle) console.debug(element);
			if (debugStyle) console.debug('Try a valid name from "updateStyleFunctions" or try it without a name for default functionility');
		}
	}else{
		//use the first style that it tests true for (so order matters)
		var testableClasses = [
			//if tests true for a class name matching the testableClasses[i][0], use the update function found in testableClasses[i][1]
			['mchk-gov','mchk-gov'], ['rad-gov','rad-gov'], ['warning-notice','warning-notice'], ['info-notice','info-notice'],
			['search-gov','search-gov'], ['txta-gov','txta-gov'], ['chk-gov','chk-gov'], ['file-gov','file-gov'], ['detail-gov','detail-gov'],
		];
		var hasAddedStyle = false;
		for (var i = 0; i < testableClasses.length; i++){
			if (element.hasClass(testableClasses[i][0])){
				updateStyleFunctions[testableClasses[i][1]](element);
				hasAddedStyle = true;
		
				$(formName()).trigger('_style_elementUpdated',[element, testableClasses[i][1], false]);
				break;
			}
		}
		if (!hasAddedStyle) {
			if (debugStyle) console.debug('No name provided, and failed class checks. Element was:');
			if (debugStyle) console.debug(element);
			if (debugStyle) console.debug('Try a valid name from "updateStyleFunctions" as the second param to specify type of update');
		}
	}
}

function addStyleListeners(listenerNameArray){
    listenerNameArray.forEach(function(listenerName){
        listenerFunctions[listenerName]();
    });
	
	$(formName()).trigger('_style_allListenersAdded',[listenerNameArray]);	
}
var listenerFunctions = {
	'txta-length-listener':function(){
		$(formName()).on('input', '.txta-gov textarea',txtaLength);
		
		$(formName()).trigger('_style_listenerAdded',['txta-length-listener']);	
	},
	'detailToggle':function(){
		$(formName()).on('click', '.detail-title',detailToggle);
		
		$(formName()).trigger('_style_listenerAdded',['detailToggle']);	
	},
	'noResultsFound':function(){
		$(formName()).on('_KDF_search', function(event, kdf, response, type, name) {
			//call noResultsFound with 'this' set to the search element that triggered the event
			noResultsFound.call($('[name="'+name+'_id"]'))
		});
		
		$(formName()).trigger('_style_listenerAdded',['noResultsFound']);	
	},
	'selectResult':function(){
		$(formName()).on('_KDF_search', function(event, kdf, response, type, name) {
			//call selectResult with 'this' set to the search element that triggered the event
			selectResult.call($('[name="'+name+'_id"]'))
		});
		
		$(formName()).trigger('_style_listenerAdded',['selectResult']);	
	},
	'txt-enter-trigger-btn':function(){
		$(formName()).on('keypress','.search-gov [type="text"], .txt-enter-trigger-btn [type="text"]',function() {
			if (event.keyCode == 13) {
				$(this).parent().parent().parent().find('[type="button"]').trigger('click');
			}
		});
		
		$(formName()).trigger('_style_listenerAdded',['txt-enter-trigger-btn']);	
	},
	'search-empty-search':function(){
		//prevent search error when all feilds are empty and none are required. Inital code by Daire - made to work by KS
		var message = "Please complete some search fields before attempting search";
		$(formName()).find('button[data-type="searchwidget"]').off("click").on("click", function(e) {
			KDF.hideMessages();
			var valid = 0;
			$(this).closest('.searchwidget').find(".dform_widget_searchfield:visible :input").each(function() {
			  if ($(this).val() !== ""){
				valid += 1;
			  }
			});
			if (valid > 0) {
			  $(this).parents('.searchwidget').removeClass('dform_widgeterror');
			  $(this).parents('.searchwidget').find('.dform_validationMessage').first().empty();
			  $(this).parents('.searchwidget').find('.dform_validationMessage').first().hide();
  		  KDF.searchwidget($(this).data("action"), $(this).data("widgetname"));
			} else {
			  e.preventDefault();
			  $(this).parents('.searchwidget').addClass('dform_widgeterror');
			  $(this).parents('.searchwidget').find('> .dform_validationMessage').text(message);
			  $(this).parents('.searchwidget').find('> .dform_validationMessage').show();
			  $(this).parents('.searchwidget').find(".dform_widget_searchfield:visible :input").first().focus();
			}
		});
	}
	
}


function formName(){
	
	if (KDF.kdf().name){
		return '#dform_'+KDF.kdf().name;
	}else{
		if (debugStyle) console.debug('kdf name undefined - using #dform_container')
		return '#dform_container';
	}
}
function txtaLength(){
    //updates the chars left box for txta-length styled elements
    //used as the function in the textarea input 
    var maxLength = $(this).attr('maxlength');
    if (maxLength !== undefined && maxLength !== 0){
        var currentLength = $(this).val().length;
       
        var message = $(this).parent().find("> .txta-length-message");
        if (currentLength >= maxLength){
            message.html("You have reached the maximum number of characters")
        }else{
            message.html((maxLength-currentLength)+" characters left")
        }
    }
	$(formName()).trigger('_style_lengthChanged',[$(this), message, (currentLength >= maxLength) ? true : false ,maxLength, currentLength]);
}
	
function detailToggle(){
	var prefix = {'closed':'►', 'opened':'▼'};
	var open;
    //this expands/collapses the detail tab and chnages the indicator
    //the indicator is an array in which the collapsed indicator is first and the expanded indicator is second
    
    if($(this).text().indexOf(prefix.closed) >= 0){
        $(this).text($(this).text().replace(new RegExp(prefix.closed,'g'), prefix.opened))
        $(this).siblings('.detail-block').addClass("detail-block-visible");
		open = true;
    } else {
        $(this).text($(this).text().replace(new RegExp(prefix.opened,'g'), prefix.closed))
        $(this).siblings('.detail-block').removeClass("detail-block-visible");
		open = false;
    }
	$(formName()).trigger('_style_detailToggled',[$(this), open, prefix.opened, prefix.closed]);
}

function noResultsFound(){
    //when there is no results, add a non-selectable option 
	var text = 'No results found';
    if ($(this).find('option:not([hidden])').length < 1){
        $(this).html('<option hidden>'+text+'</option>')
    }

	$(formName()).trigger('_style_noSearchResults',[$(this), text]);
}
function selectResult(){
    //when there is no results, add a non-selectable option 
	var text = 'Please select a result…';
 
    if ($(this).find('option:not([hidden])').length > 0){
	    $(this).find('option:first').attr('hidden', '').text('Please select a result…')
    }
	
	$(formName()).trigger('_style_selectResult',[$(this), text]);
}

function regexSearch(regex, selector){
	if (selector === undefined){
		selector = ".search-gov input:text, .apply-regex, #dform_widget_txt_postcode";
	}
	var elements = $(selector);
	elements.attr('pattern',regex);

	$(formName()).trigger('_style_regexApplied',[elements, regex]);
}
function marginRevertArrange(element){

	element.find('> legend').remove();
	element.find('fieldset legend').removeClass('display-none');
	element.removeClass(function(index, className){
		return (className.match (/\b(mchk-margin-|rad-margin-)\S+/g) || []).join(' ');
	});
	
	$(formName()).trigger('_style_marginReverted',[element]);
}

function marginArrange(legend, style){

	legend.clone().addClass(style).insertBefore(legend.parent().parent());
	legend.addClass('display-none');
	
	$(formName()).trigger('_style_marginAdded',[legend, style]);	
}
function paramElementChange(possibleToChange){
    //possibleToChange is an array of element names which can set to values from the params
    var params = KDF.getParams();
    var defaultParams = ['wss', 'lwssinline', 'token'];
    if (params.wss == 'true'){
        $.each( params, function( key, value ) {
            if (possibleToChange.includes(key) && !defaultParams.includes(defaultParams)){
                KDF.setVal(key, value);
                if (debugStyle) console.debug('wss loaded element '+key+' with '+value);

                $(formName()).trigger('_style_paramElementChanged',[key, value]);
            }
        });
    }
}

function simpleColorCheck(origBgColor, fgIfWhite, altFg){

    var bgColor = origBgColor;
    if (origBgColor === undefined) {bgColor = 'white';}
    var whiteDef = ['rgba(0, 0, 0, 0)', 'rgb(0, 0, 0)', 'white', '#fff', '#ffffff', 'transparent'];
    var choosenFg;
    if ($.inArray(bgColor.toLowerCase(), whiteDef) != -1){
        choosenFg = fgIfWhite;
    } else {
        choosenFg = altFg;
    }

    $(formName()).trigger('_style_simpleColorCheck',[origBgColor, bgColor, choosenFg, fgIfWhite, altFg]);
	
    return choosenFg;
}
function requiredColorCheck(jQueryObject, defaultColor, altColor){
    if (defaultColor === undefined){defaultColor = '#b03535';}
    if (altColor === undefined){altColor = 'white';}
	
    var color = simpleColorCheck(jQueryObject.css("background-color"), defaultColor, altColor);

	$(formName()).trigger('_style_colorChecked',[jQueryObject, defaultColor, altColor]);
	
    return color;
}

function highlightRequired() {

	var eligible = [
		[$('.rad-gov'),function(val){if (val.find('input[required]').length > 0){return val.find('legend')}else{return null}}],
		[$('.mchk-gov'),function(val){if (val.find('input[required]').length > 0){return val.find('legend')}else{return null}}],
		[$('.chk-gov'), function(val){if (val.find('input[required]').length > 0){return val.find('label')}else{return null}}],
		[$('.txt-gov,.dt-gov,.eml-gov,.num-gov,.pas-gov,.tel-gov,.time-gov,.txta-gov'), function(val){if (val.find('input[required], textarea[required]').length > 0){return val.find('label')}else{return null}}],
		[$('.cs-gov, .ss-gov, .ps-gov, .os-gov, .search-gov'), function (val){if (val.find('fieldset[required="true"]') ){return val.find('fieldset > legend')}else{return null}}],
		[$('.sel-gov'), function(val){if (val.find('select[required]').length > 0){return val.find('label')}else{return null}}],
		[$('.highlightRequired'),function(val){return val}],
	]
	
	var textFields = [];
	
	eligible.forEach(function(element){
		element[0].each(function(i, val){
			//checks the elements in their selector for being requires, then adds them to array if they are
			var reqElement = element[1]($(val));
			if (reqElement != null) textFields.push(reqElement);
		});
	});
	
	var reqFun = {
		isEligible:function(element){return element.find('span[title="required"]').length < 1},
		apply:function(element){return '<span title="required" style="color: '+requiredColorCheck(element)+';"> *</span>'},
	};
	
	textFields.forEach(function(element){
		if (reqFun.isEligible(element)) {
			//checks that the required-HTML hasn't already been added - only adds if it isn't
			element.append(reqFun.apply(element));
		}//else would be for when there is already one there
	});
	
	$(formName()).trigger('_style_highlightRequired',[textFields]);
}

function getFieldsLabels(isPosLeft){
	//get the labels when called, example : $(getFieldsLabels(value))
	var selector = '';
	//all fields that can have a left/above label
	var elements = ['.txt-gov','.dt-gov','.eml-gov','.num-gov','.pas-gov','.tel-gov','.time-gov','.field-gov','.txta-gov'];
	
	if (isPosLeft && isPosLeft != 'above'){
		if (debugStyle) console.debug('@getFieldsLabels() a selector for elements with a label to the left is being generated. The elements being considered are: '+JSON.stringify(elements));
		//returns all fields that are to the left of the input
		//columns are used to display them on same line, and is the only way to identify them from above-labels
		var columns = ['.one','.two','.three','.four','.five','.six','.seven','.eight','.nine','.ten','.eleven','.twelve']
		
		for (var i = 0; i < elements.length; i++){
			for (var j = 0; j < columns.length; j++){
				selector += ', '+elements[i]+':not(.dform_widget_searchfield) > div:first-child'+columns[j]+' label';
			}
		}
		//CSS note, if you use this, make sure you have a media query set up for the changing sizes
		//else if it changes to label-above at a certain width, then it will look messed up
	}else{
		if (debugStyle) console.debug('@getFieldsLabels() a selector for elements with a label above is being generated. The elements being considered are: '+JSON.stringify(elements))
		//returns all field labels that are above text field
		for (var i = 0; i < elements.length; i++){
			selector += ', '+elements[i]+' > div:first-child:not(.one,.two,.three,.four,.five,.six,.seven,.eight,.nine,.ten,.eleven,.twelve) label'
		}
	}
	selector = selector.substring(2,selector.length);
	return selector;
}

function toggleFormControlsButton() {
	$("#dform_controls").hide();
	KDF.hideNav();
	
	if (KDF.kdf().viewmode === 'U' || KDF.kdf().viewmode === 'R') {
		$("#dform_controls").show();
		KDF.showNav();
	}
	else if (KDF.kdf().form.readonly === true && KDF.kdf().access === 'citizen') {
		KDF.showNav();
	}
}

Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};



/** 
=====================================
            STYLING - END
=====================================
**/

function replaceHeader(className,tag) {
	$('.' + className).each(function() {
        var id = $(this).attr('id');
	if (id) {
         var header = document.getElementById(id);
         var newHeader = document.createElement(tag);
         var attrs = header.attributes;
         for (var i=0;i<attrs.length;i++){
            newHeader.setAttribute(attrs[i].name,attrs[i].value);
         }
         newHeader.innerHTML = header.innerHTML;
         header.parentNode.replaceChild(newHeader, header);
	}
    });
}

function updateCPETitle() {
	if (KDF.kdf().access === 'citizen') {
		var title = document.getElementsByTagName('title')[0];
		var word_title = '';
		if ($('.dform_page[data-active="true"]').eq(0).find('div > h1').length > 0) {
			word_title = $('.dform_page[data-active="true"]').eq(0).find('div > h1').text().trim();
		} else {
			word_title = $('.dform_page[data-active="true"]').eq(0).find('div > div > div > h1').text().trim();
		}
		title.innerText = word_title;
	}
}

function addAutoComplete() {
	if (KDF.kdf().access === 'citizen') {
		$('#dform_' + KDF.kdf().form.name).attr("autocomplete","on");
		$('[id*="eml"],[id*="email"]').attr("autocomplete","email");
		$('[id*="forename"],[id*="firstname"],[id*="first_name"]').attr("autocomplete","given-name");
		$('[id*="surname"],[id*="lastname"],[id*="last_name"]').attr("autocomplete","family-name"); 		
		$('[id*="phone"],[id*="tel"]').attr("autocomplete","tel");
		$('[id*="town"]').attr("autocomplete","shipping address-level2"); 
		$('[id*="postcode"]').attr("autocomplete","postal-code"); 
		$('[id*="street_name"], [id*="address_name"]').attr("autocomplete","address-line1 street-address"); 
	}
}

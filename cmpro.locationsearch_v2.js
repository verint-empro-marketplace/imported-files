/*! Location search widget that supports searching by street and property
	Based on JQuery UI Widget Factory
	J Elwood, Aug 2021

    v1 (Aug 2021) - Initial release of widget
    v2 (15 Nov 2021) - Add support for button class, loading data into a specific page only and returning page in event
    
    ----------------------
    Example instantiation:
    ----------------------

	//Streetsearch widget
	$('#propsearchwidget2').locationsearch({
	    customaction_search: 'property-search', 
	    customaction_resultsfield: 'prop_search_results',
	    onselect_loadandsetdata: false,
	    onselect_hidesearch: false
	});

	$('#streetsearchwidget').locationsearch({
	    customaction_search: 'cl_street_search', 
	    customaction_resultsfield: 'street-results', 
	    search_button_label: 'Search Street', 
	    search_type: 'street',
	    search_fields: [         {
                    field_name: 'Street',
                    field_id: 'streetname',
                    display: true
                }]
	}); 


    
    -----------------------------------
    Custom validation function example:
    -----------------------------------

    function custom_validation(id, fields){
                                                                                                
        console.log("Validating:", id);
        console.log("Validating fields: ", fields);
        return true;
    }


    ----------------------
    EXAMPLE EVENT HANDLERS
    ----------------------

        $('#dform_widgets').off('_KDFWidget_locationResultSelected').on('_KDFWidget_locationResultSelected', function(event, kdf, label, value, name, page) {
            //Fires when result selected from widget
            console.log("_KDFWidget_locationResultSelected: label", label);
            console.log("_KDFWidget_locationResultSelected: value", value);
            console.log("_KDFWidget_locationResultSelected: name", name);
            console.log("_KDFWidget_locationResultSelected: page", page);
            
        });

        $('#dform_widgets').off('_KDFWidget_locationSearchResponse').on('_KDFWidget_locationSearchResponse', function(event, kdf, response, action, name, numresults, page) {
            //Fires when search has been performed and results returned (even if zero results)
            console.log("_KDFWidget_locationSearchResponse: response", response);
            console.log("_KDFWidget_locationSearchResponse: action", action);
            console.log("_KDFWidget_locationSearchResponse: name", name);
            console.log("_KDFWidget_locationSearchResponse: num results", numresults);
            console.log("_KDFWidget_locationSearchResponse: page", page);
            
        });

    -------------------------------------
    Example for instantiating child forms
    -------------------------------------

        $('#dform_widgets').off('_KDF_childAdded').on('_KDF_childAdded', function(event, kdf, name, selector) {
            // fires when a child has been added
            console.log("child added - name:", name);
            console.log("child added - selector:", selector);
            
            $(selector + ' .child_propsearch').locationsearch({
                customaction_search: 'property-search', 
                customaction_resultsfield: 'prop_search_results',
                search_button_label: 'Prop Street (child)', 
                id: name,
                child_page: true
            });
            
            
            $(selector + ' .child_streetsearch').locationsearch({
                customaction_search: 'cl_street_search', 
                customaction_resultsfield: 'street-results', 
                search_button_label: 'Search Street (child)', 
                search_type: 'street',
                child_page: true,
                search_fields: [         {
                            field_name: 'Street',
                            field_id: 'streetname',
                            display: true
                        }]
            });
        });
*/

(function($) { // Hide scope, no $ conflict
	'use strict';
	var definition = {
		options: {
            search_type: 'property', //property or street
            child_page: false,
			customaction_search: 'widget-property-search',
            customaction_resultsfield: 'prop_search_results',
            search_fields: [
                {
                    field_name: 'Address Number',
                    field_id: 'addressnumber',
                    access: 'both' //agent | citizen | both | none
                },
                {
                    field_name: 'Street',
                    field_id: 'streetname',
                    access: 'both' //agent | citizen | both | none
                },
                {
                    field_name: 'Street 2',
                    field_id: 'street2',
                    access: 'none' //agent | citizen | both | none
                },
                {
                    field_name: 'Postcode',
                    field_id: 'postcode',
                    access: 'citizen' //agent | citizen | both | none
                },
                {
                    field_name: 'Zip',
                    field_id: 'zip',
                    access: 'none' //agent | citizen | both | none
                },
                {
                    field_name: 'UPRN',
                    field_id: 'uprn',
                    access: 'agent' //agent | citizen | both | none
                }
            ],
            id: '',
            search_button_label: 'Search',
            search_button_class: '',
            msg_noresults: 'No results, please refine your search terms.',
            onsearch_lockform: true,
            onsearch_hidesearch: true,
            onsearch_showresults: true,
            onselect_hidesearch: false,
            onselect_loadandsetdata: true,
            onselect_loadpage: '', //name of page into which to load data - e.g. "pg_mydetails"
            display_on_readonly: false,
            display_access: 'both', //agent | citizen | both
            validate_before_search: null
		},
		_create: function() {
            if(this.options.display_on_readonly === false && KDF.kdf().form.readonly === true){ return; }
            if( KDF.kdf().access == 'agent' && this.options.display_access == 'citizen'){ return; }
            if( KDF.kdf().access == 'citizen' && this.options.display_access == 'agent'){ return; }
			this.element.addClass(this.widgetFullName || this.widgetBaseClass);
        
			var html = '';
			if(this.options.id === '') {
                this.options.id = $(this.element).attr('id').replace('dform_widget_','');
            }
            if(this.options.child_page === true ){
                var childindex = $(this.element).parents('div[data-type="child"]').data('pos');
                this.options.id = this.options.id + childindex;
            }
            if($(this.element).parents('div[data-type="child"]').length > 0 && this.options.child_page === false){  return; } //do not initialise child widgets until ready
            
            html += '<div style="clear: both;" id="' + this.options.id + '" data-active="true" class="dform_widget locationsearch">';
			    html += this._buildSearchHolder();
                html += this._buildResultsHolder();
            html+= '</div';
            this.element.append(html);

            this._attachEvents(this.options.id);  
		},
        _attachEvents: function(id) {
			var widget_instance = this;
            var page = $(widget_instance.element).closest('div[data-type="page"]').attr('id').replace("dform_page_",'');

            $('#' + id + '_searchholder').off('keypress').on('keypress', function(e){
                if(e.which == 13) {
                    $('#' + id + '_searchbutton').click();
                }
            });

            $('#' + id + '_searchbutton').off('click').on('click', function(e) {
                KDF.hideMessages();
                

                if( widget_instance.options.onsearch_lockform === true) {KDF.lock();}
                var data = $('#' + id + '_searchholder .locationsearch_searchfield input').serializeJSON({useAlias: true, useIntKeysAsArrayIndex: true});
                var dataobj = {
                    "name": KDF.kdf().form.name,
                    "data": data,
                    "email": KDF.kdf().form.email,
                    "caseid": KDF.kdf().form.caseid,
                    "xref": KDF.kdf().form.xref,
                    "xref1": KDF.kdf().form.xref1,
                    "xref2": KDF.kdf().form.xref2
                };

                if (widget_instance.options.validate_before_search !== null){
                    if(widget_instance.options.validate_before_search(widget_instance.options.id, data)=== false){ KDF.unlock();  return; }
                }

                var searchurl = KDF.kdf().rest.custom + '?action=' + widget_instance.options.customaction_search + '&actionedby=' + id;
                    searchurl+= '&loadform=true&access=' + KDF.kdf().access + '&locale=' + KDF.kdf().locale;
                return $.ajax({
                    url: searchurl,
                    data: JSON.stringify(dataobj),
                    type: 'POST', dataType: 'json',	contentType: 'application/json', mimeType: 'application/json',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', KDF.kdf().auth);
                    }
                }).done (function(response, status, xhr) {
                    KDF.kdf().auth=xhr.getResponseHeader('Authorization');
                    var results = response.data[widget_instance.options.customaction_resultsfield];
                    $( '#dform_'+ KDF.kdf().name ).trigger('_KDFWidget_locationSearchResponse', [ KDF.kdf(), response, widget_instance.options.customaction_search, id, results.length, page ] );
                    if(widget_instance.options.onsearch_hidesearch === true){
                        $('#' + id + '_searchholder').hide();
                    }
                    if(widget_instance.options.onsearch_showresults === true){
                        widget_instance._renderResults(id, response);
                    }
                    KDF.unlock();
                }).fail(function(xhr, settings, thrownError){
                    console.log("ERROR:", thrownError);
                    $( '#dform_'+ KDF.kdf().name ).trigger('_KDF_customError', [ KDF.kdf().customaction, xhr, settings, thrownError, page ] );
                    KDF.showError('ERROR: There was a problem encountered during the search!' );
                    KDF.unlock();
                });
            });

            $('#' + id + '_resultsholder .dform_widget_search_closeresults').off('click').on('click', function(e) {
                KDF.hideMessages();
                $('#'+ id +'_searchholder').show();
				$('#'+ id +'_resultsholder').hide();
                $('#'+ id +'_noresults').hide();
				$('#' + id + '_results').empty();
            });

            $('#' + id + '_results ').off('change').on('change', function(e) {
                var selectedVal = $('#' + id + '_results ').find(':selected').val();
                var selectedLabel = $('#' + id + '_results ').find(':selected').text();
                var loaddata = $(this).data('loaddata');
                if(loaddata === true){
                    if(widget_instance.options.search_type == 'property'){
                        KDF.setPropertyID(selectedVal, loaddata, widget_instance.options.onselect_loadpage);
                    } else {
                        KDF.setStreetID(selectedVal, loaddata, widget_instance.options.onselect_loadpage);
                    }
                }

                if(widget_instance.options.onselect_hidesearch === true){
                    $('#'+ id).hide();
                }
                $( '#dform_'+ KDF.kdf().name ).trigger('_KDFWidget_locationResultSelected', [ KDF.kdf(), selectedLabel, selectedVal, id, page ] );
            });

		},
        _renderResults: function(id, r) {            
            var results = r.data[this.options.customaction_resultsfield];
            var num_results = results.length;
            $('#' + id + '_results').empty().append('<option value=""></option>');

            if (num_results === 0){
                $('#' + id + '_noresults').show();
                $('#' + id + '_resultsholder').show();
            }
            else {
                $('#' + id + '_noresults').hide();
                $('#' + id + '_resultsholder').show();
                $.each(results, function(pos) {
                    if (this.selected) {
                        $('#' + id + '_results').append($("<option></option>").attr({'value': this.value, 'selected': 'selected'}).text(this.label));
                    } else {
                        $('#' + id + '_results').append($("<option></option>").attr({'value': this.value}).text(this.label));
                    }
                });
            }
		},
		_buildSearchHolder: function() {
			var h = '<div class="container locationsearch_searchholder" id="' + this.options.id + '_searchholder">';
            var widget_instance = this;
            $.each(this.options.search_fields, function(index, field){
                if(field.access != 'none'){
                    if( KDF.kdf().access == 'agent' && field.access == 'citizen'){ return; }
                    else if( KDF.kdf().access == 'citizen' && field.access == 'agent'){ return; }
                    else {
                        h += widget_instance._buildSearchField(field.field_name, field.field_id);
                    }
                }
            });
            h += '<br/><button type="button" id="' + widget_instance.options.id + '_searchbutton" data-type="searchwidget" class="dform_widget dform_widget_type_button ' + widget_instance.options.search_button_class + '">' + widget_instance.options.search_button_label + '</button>';
            h += '<br/></div>';
            return h;
		},
		_buildSearchField: function(label, id) {
			var h = '<div class="locationsearch_searchfield">';
            var fieldid = this.options.id + '_' + id;
                h += '<div><label for="' + fieldid + '">' + label + '</label></div>';
                h += '<div><input id="' + fieldid + '" name="' + id + '" type="text" class="dform_nopersist "data-customalias="' + id + '"></div>';
            h += '</div>';
            return h;
		},		
		_buildResultsHolder: function() {
            var h = '<div id="' + this.options.id + '_resultsholder" class="container locationsearch_resultsholder"  style="display: none;">';
                h += '<span><select title="Property search" id="' + this.options.id + '_results" name="' + this.options.id + '_results" data-setid="' + this.options.onselect_loadandsetdata + '" data-loaddata="' + this.options.onselect_loadandsetdata + '" style="display: inline-block;">';
                    h+= '<option value="" selected="true"/>';
                h += '</select></span><a href="javascript:void(0);" class="dform_widget_search_closeresults" aria-label="Reset">b</a>'; 
                //TODO - event handler for this reset button
            h+='<div id="' + this.options.id + '_noresults" class="container ' + this.options.id + '_noresults" style="display: none;">' + this.options.msg_noresults + '</div>';
            h+= '</div>';
            return h;
		},
		_destroy: function() {
			this.element.removeClass(this.widgetFullName || this.widgetBaseClass);
		}
	};
	
	if (!$.Widget.prototype._destroy) {
		$.extend(definition, {
			destroy: function() {
				this._destroy();
				$.Widget.prototype.destroy.call(this); 
			}
		});
	}
	
	if ($.Widget.prototype._getCreateOptions === $.noop) {
		$.extend(definition, {
			_getCreateOptions: function() {
				return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
			}
		});
	}
	$.widget('cmpro.locationsearch', definition); 
	$.cmpro.locationsearch.options = $.cmpro.locationsearch.prototype.options;
})(jQuery);
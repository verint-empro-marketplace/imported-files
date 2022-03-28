/* BEGIN MANAGE INDIVIDUAL*/
//The purpose of this file is to isolate the specific JS functions required to handle the individual pages and function in the Verint individual template.

var manual_change_address = false;
var create_customer_flow = false;
var yd_cs_search_again_clicked = false;

var individualTemplateIdentifier = 'individual_template_';

function do_KDF_Ready_Individual(event, kdf) {

	var form_name = kdf.name;
	KDF.showSection('area_customer_information');
	
	if (KDF.kdf().access === 'agent' && KDF.getVal('rad_viewmode') !== 'R' && KDF.getVal('rad_viewmode') !== 'U') {
		KDF.hideSection('area_customer_information');
		KDF.hideSection('area_your_details_next_updateaddress');

		$('#dform_widget_eml_email').prop('required', true);
		
		//auto search for customer
		if($("#dform_widget_txt_firstname").val().length >0 || $("#dform_widget_txt_lastname").val().length > 0){
    		$("#dform_widget_cs_txt_firstname").val($("#dform_widget_txt_firstname").val());
    		$("#dform_widget_cs_txt_lastname").val($("#dform_widget_txt_lastname").val());
    		$("#dform_widget_cs_customer_search_searchbutton").click();
    		$("#dform_widget_cs_txt_firstname").val();
    		$("#dform_widget_cs_txt_lastname").val();
		}
		
		if (typeof KDF.getParams().customerid !== 'undefined' && KDF.getParams().customerid !== '') {
			KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'KDF_Ready', true, true, { 'person_search_results': KDF.getParams().customerid });
		}
	}

    //manual enter address yd
    $('#dform_widget_button_but_update_address_manually').off('click').on('click', function () {
        manual_change_address = true;
	var params = [ 'txt_p_uprn', 'txt_address_number_yd', 'txt_street_name_yd', 'txt_city_yd'];
        clearValue(params);	
         
         $("#dform_widget_txt_address_number_yd").attr("readonly", false);
         $("#dform_widget_txt_street_name_yd").attr("readonly", false);
         $("#dform_widget_txt_city_yd").attr("readonly", false);
         
         var options = document.getElementById("location-search-citizen_results").options;
         options[0].selected = true;
    }); 

    $('#dform_widget_cs_customer_search_resultholder').on('show', function () {
        KDF.showWidget('but_individual_not_found');
    });

    $('#dform_widget_cs_customer_search_resultholder').on('hide', function () {
        clearCustomerInformation();
	    var params = ['area_customer_information', 'area_your_details_next_updateaddress'];
	    hideSections(params);
	    
	    var params_widgets = ['bset_your_details_next_updateaddress', 'but_individual_not_found'];
	    hideWidgets(params_widgets);
    });
    
    $('#dform_widget_button_but_submit_report').click(function () {
        
        if(create_customer_flow === true && KDF.kdf().access === 'agent'){
            
            KDF.customdata('create-individual-new', individualTemplateIdentifier + 'create', true, true, {
					'txt_c_forename': KDF.getVal('txt_firstname'),
					'txt_c_surname': KDF.getVal('txt_lastname'),
					'tel_c_telephone': KDF.getVal('txt_contact_number'),
					'eml_c_email': KDF.getVal('eml_email'),
					'tel_c_mobile': KDF.getVal('txt_contact_number'),
					'txt_c_addressnumber': KDF.getVal('txt_address_number_yd'),
					'txt_c_addressline1': KDF.getVal('txt_street_name_yd'),
					'txt_c_town': KDF.getVal('txt_city_yd'),
					'txt_c_postcode': KDF.getVal('txt_c_postcode'),
					'txt_c_uprn': KDF.getVal('txt_c_uprn')
				});	
        }
        else{
            if((custAddresssCheck() === true || custDetailsCheck() === true) && KDF.kdf().access === 'agent'){
                
                KDF.customdata('update-individual-new', individualTemplateIdentifier + 'create', true, true, {
					'customerID': KDF.getVal('txt_customer_id'),
					'txt_first_name': KDF.getVal('txt_firstname'),
					'txt_last_name': KDF.getVal('txt_lastname'),
					'phone': KDF.getVal('txt_contact_number'),
					'num_p_streetnumber': KDF.getVal('txt_address_number_yd'),
					'txt_p_streetname': KDF.getVal('txt_street_name_yd'),
					'txt_p_town': KDF.getVal('txt_city_yd'),
					'txt_p_postcode': KDF.getVal('txt_cust_info_postcode'),
					'txt_p_uprn': KDF.getVal('txt_p_uprn'),
					'email':KDF.getVal('eml_email')
				});     
            }
            else{
                KDF.gotoNextPage();
            }
        }
    });
    
    if (KDF.kdf().access === 'citizen') {
	    var params = [ 'area_yd_customer_details', 'area_property_search_yd', 'area_yd_property_details'];
        showSections(params); 
        
        var params_widgets = [ 'but_next_update_yd'];
        showWidgets(params_widgets); 
    }
}//end do_KDF_Ready_Individual

function do_KDF_Custom_Individual(event, kdf, response, action) {	
	var isIndividualTemplate = false;
	
	if (response.actionedby.indexOf(individualTemplateIdentifier) === 0) {isIndividualTemplate = true;}
	
	if (isIndividualTemplate) {		
		var actionedBySource = response.actionedby.replace(individualTemplateIdentifier, '');
		
		if (action === 'person-retrieve-new' && actionedBySource === 'KDF_Ready') {
			KDF.showWidget('bset_your_details_next_updateaddress');
			//Ensure the First Name and Last Name are read-only, aunthenticated citizen
			if (KDF.kdf().access === 'citizen') {
				KDF.hideWidget('ahtm_manually_entered_address_info');
				KDF.showSection('area_your_details_addressdetails');

				$("#dform_widget_txt_firstname").attr("readonly", true);
				$("#dform_widget_txt_lastname").attr("readonly", true);
			}
			
			setDefaultAddress(response);
			
			KDF.showSection('area_customer_information');
			KDF.showSection('area_your_details_next_updateaddress');
		}
		else if (action === 'person-retrieve-new' && actionedBySource == 'update-individual') {
			KDF.gotoNextPage();

		}
		else if (action === 'person-retrieve-new' && actionedBySource == 'create-individual') {
			KDF.setCustomerID(KDF.getVal('txt_customer_id'), true, false); /*set Reporter*/
			setDefaultAddress(response);
			KDF.gotoNextPage();

		}
		else if (action === 'person-retrieve-new' && actionedBySource == 'search-individual') {
			KDF.setVal('txt_cust_info_uprn', KDF.getVal('txt_logic_uprn'));
		}
		else if (action === 'update-individual-new') {
			KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'update-individual', true, true, { 'person_search_results': KDF.getVal('txt_customer_id') });
		}
		else if (action == 'create-individual-new') {
			if (response.data.txt_customerID !== undefined) {
				
				KDF.setVal('txt_customer_id', response.data.txt_customerID);
				KDF.setCustomerID(response.data.txt_customerID, true, false); /*set Reporter*/
				KDF.setVal('le_associated_obj_id',response.data.txt_customerID);
				KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'create-individual', true, true, { 'person_search_results': KDF.getVal('txt_customer_id') });
			}
		}
	}
}//end do_KDF_Custom_Individual()

function do_KDF_objectdataLoaded_Individual(event, kdf, response, type, id) {
    
    if (type === 'customer' && kdf.widgetresponse.actionedby === 'cs_customer_search') {
        create_customer_flow = false;
        
        KDF.setVal('txt_customer_id', id);

        KDF.showWidget('bset_your_details_next_updateaddress');
        KDF.showSection('area_customer_information');
        KDF.showSection('area_your_details_next_updateaddress');
        
        KDF.setVal('txt_address_number_yd', response["profile-AddressNumber"]);
	    KDF.setVal('txt_street_name_yd', response["profile-AddressLine1"]);
	    KDF.setVal('txt_city_yd', response["profile-City"]);
		
	    //set default value for placeholder fields used in update individual
	    KDF.setVal('txt_logic_streetnumber', response["profile-AddressNumber"]);
	    KDF.setVal('txt_logic_streetname', response["profile-AddressLine1"]);
	    KDF.setVal('txt_logic_town', response["profile-City"]);
	    KDF.setVal('txt_logic_postcode', response["profile-Postcode"]);
    }

}//end do_KDF_objectdataLoaded_Individual

function do_KDF_optionSelected_Individual(event, kdf, field, label, val) {
    
    if(field==='cs_customer_search_id'){
        showCustomerSearchYdWidgets();
    }
} //end do_KDF_optionSelected_Individual

function do_KDF_fieldChange_Individual(event, kdf, field) {
	
}//end do_KDF_fieldChange_Individual

// Check if the customer detail is change
function custDetailsCheck() {
    
    if (KDF.getVal('txt_firstname') !== KDF.getVal('txt_logic_firstname') || KDF.getVal('txt_lastname') !== KDF.getVal('txt_logic_lastname') ||
        KDF.getVal('eml_email') !== KDF.getVal('txt_logic_email') || KDF.getVal('txt_contact_number') !== KDF.getVal('txt_logic_phone')) {
        return true;
    } else {
        return false;
    }
}

// Check if the customer address is change
function custAddresssCheck() {

    if (KDF.getVal('txt_address_number_yd') !== KDF.getVal('txt_logic_streetnumber') || KDF.getVal('txt_street_name_yd') !== KDF.getVal('txt_logic_streetname') ||
        KDF.getVal('txt_city_yd') !== KDF.getVal('txt_logic_town')) {
        return true;
    } else {
        return false;
    }
}

/*jquery trigger based on display value*/
(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
})(jQuery);

function showCustomerSearchYdWidgets(){
    var params = [ 'area_yd_customer_details', 'area_yd_property_details'];
    showSections(params);
    
    var params_widgets = ['bset_your_details_next_updateaddress', 'but_next_update_yd'];
    showWidgets(params_widgets);
}

function doCreateCustomerFlow(){
    create_customer_flow = true;
        
    showCustomerSearchYdWidgets();    
    var params = [ 'txt_customer_id', 'txt_firstname', 'txt_lastname', 'eml_email', 'txt_contact_number', 'txt_address_number_yd', 'txt_street_name_yd', 'txt_city_yd'];
    clearValue(params);		
	
    KDF.showSection('area_property_search_yd');
    
    var options = document.getElementById("dform_widget_cs_customer_search_id").options;
    options[0].selected = true;
}

function setDefaultAddress(response){
    KDF.setVal('txt_address_number_yd', response.data["profile-AddressNumber"]);
    KDF.setVal('txt_street_name_yd', response.data["profile-AddressLine1"]);
    KDF.setVal('txt_city_yd', response.data["profile-City"]);
}

function clearCustomerInformation() {
    var params = [ 'txt_firstname', 'txt_lastname', 'eml_email', 'txt_contact_number'];
    clearValue(params);
}

function showWidgets (params){
  for (i=0; i<params.length; i++) {
    KDF.showWidget(params[i]);
  }
}

function hideWidgets (params){	
  for (i=0; i<params.length; i++) {
    KDF.hideWidget(params[i]);
  }
}

function hideSections (params){
  for (i=0; i<params.length; i++) {
    KDF.hideSection(params[i]);
  }
}

function showSections (params){
  for (i=0; i<params.length; i++) {
    KDF.showSection(params[i]);
  }
}

function clearValue (params){
  for (i=0; i<params.length; i++) {
    KDF.setVal(params[i],'');
  }
}

function clearValueHtml (params){
  for (i=0; i<params.length; i++) {
    document.getElementById(params[i]).value = ''
  }

function disableWidgets (params){
  for (i=0; i<params.length; i++) {
    $(params[i]).prop('readonly', true);
  }		
}
/*END MANAGE INDIVIDUAL*/

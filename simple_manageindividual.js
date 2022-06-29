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
	
	var firstSelected = document.getElementById("dform_widget_cs_customer_search_id").options[0];
	if(firstSelected != null && firstSelected.text == ''){
	    firstSelected.text = 'Please select...';
	    firstSelected.hidden = true;	
	}	
    });

    $('#dform_widget_cs_customer_search_resultholder').on('hide', function () {
        clearCustomerInformation();
	hideSections(['area_customer_information', 'area_your_details_next_updateaddress','area_property_search_yd']);
	hideWidgets(['bset_your_details_next_updateaddress', 'but_individual_not_found', 'txta_address_yd']);
	KDF.setVal('txta_address_yd','');
	clearValueHtml(['dform_widget_cs_txt_firstname','dform_widget_cs_txt_lastname','dform_widget_cs_txt_emailaddress','dform_widget_cs_txt_phonenumber']);    
    });
    
    $('#dform_widget_button_but_submit_report').click(function () {
        
        if(create_customer_flow === true && KDF.kdf().access === 'agent'){
            
            KDF.customdata('create-individual', individualTemplateIdentifier + 'create', true, true, {
					'txt_c_forename': KDF.getVal('txt_firstname'),
					'txt_c_surname': KDF.getVal('txt_lastname'),
					'tel_c_telephone': KDF.getVal('txt_contact_number'),
					'eml_c_email': KDF.getVal('eml_email'),
					'txt_c_addressnumber': KDF.getVal('txt_address_number_yd'),
					'txt_c_addressline1': KDF.getVal('txt_street_name_yd'),
		    		'txt_c_town': KDF.getVal('txt_city_yd'),
					'txt_c_postcode': KDF.getVal('txt_c_postcode'),
					'txt_c_uprn': KDF.getVal('txt_c_uprn')
				});	
        }
        else{
            if((custAddresssCheck() === true || custDetailsCheck() === true) && KDF.kdf().access === 'agent' && (KDF.getVal('txt_created_by') != 'citizen' && KDF.kdf().viewmode != 'U')){
                
                KDF.customdata('update-individual-details', individualTemplateIdentifier + 'create', true, true, {
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
	    var params = [ 'area_yd_customer_details', 'area_yd_additional_details', 'area_property_search_yd', 'area_yd_property_details'];
        showSections(params); 
        
        var params_widgets = [ 'but_next_update_yd'];
        showWidgets(params_widgets);
	
	if (KDF.kdf().authenticated) {
		KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'KDF_Ready', true, true, { 'person_search_results': KDF.kdf().profileData.customerid });
	}
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
				KDF.showWidget('txta_address_yd');
				KDF.hideWidget('ahtm_manually_entered_address_info');
				KDF.showSection('area_your_details_addressdetails');

				$("#dform_widget_txt_firstname").attr("readonly", true);
				$("#dform_widget_txt_lastname").attr("readonly", true);
				$("#dform_widget_eml_email").attr("readonly", true);
				$("#dform_widget_txt_contact_number").attr("readonly", true);
			}
			
			setDefaultAddress(response);
			
			KDF.setVal('txt_profile_address',response.data['profile-Address']);
			KDF.customdata('widget-property-search', individualTemplateIdentifier + 'search-property', true, true, {
					'addressnumber': response.data['profile-AddressNumber'],
					'streetname': response.data['profile-AddressLine1']
				}); 
			
			showWidgets(['txta_address_yd','bset_your_details_next_updateaddress','but_cust_info_update_address']);
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
		else if (action === 'update-individual-details') {
			KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'update-individual', true, true, { 'person_search_results': KDF.getVal('txt_customer_id') });
		}
		else if (action == 'create-individual') {
			if (response.data.txt_customerID !== undefined) {
				
				KDF.setVal('txt_customer_id', response.data.txt_customerID);
				KDF.setCustomerID(response.data.txt_customerID, true, false); /*set Reporter*/
				if(KDF.getVal('le_associated_obj_type') == '' && KDF.getVal('le_associated_obj_id') == ''){
				    KDF.setVal('le_associated_obj_type','C1'); 
				    KDF.setVal('le_associated_obj_id',response.data.txt_customerID);    
				}
				KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'create-individual', true, true, { 'person_search_results': KDF.getVal('txt_customer_id') });
			}
		}
		else if(action === 'widget-property-search'){
		    KDF.setVal('txt_property_id',response.data['first_result_value']);
		    KDF.showWidget('rad_existing_address');
		    KDF.hideSection('area_property_search');
		    $('#dform_widget_rad_existing_address1').next().html(KDF.getVal('txt_profile_address'));
		}
		else if(action === 'retrieve-property'){
		    //will be used as default address when creating new customer
		    KDF.setVal('txt_addressnum',response.data['addressNumber']);
	        KDF.setVal('txt_street_name',response.data['streetName']);
	        KDF.setVal('txt_city',response.data['town']);
		}
	}
}//end do_KDF_Custom_Individual()

function do_KDF_objectdataLoaded_Individual(event, kdf, response, type, id) {
    
    if (type === 'customer' && kdf.widgetresponse.actionedby === 'cs_customer_search') {
        create_customer_flow = false;
        
        KDF.setVal('txt_customer_id', id);

	showWidgets(['txta_address_yd','bset_your_details_next_updateaddress','but_cust_info_update_address']);
	showSections(['area_customer_information','area_your_details_next_updateaddress','']);    
	    
	    hideWidgets(['txt_address_number_yd','txt_city_yd','txt_street_name_yd','but_yd_edit_address', 'rad_yd_same_address']);
			
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

function hideManualEnterAddress(is_noresult_property){
    hideWidgets(['txt_addressnum','txt_street_name','txt_city']);   
    clearValue(['txt_addressnum','txt_street_name','txt_city','txta_address']);
    clearValueHtml(['location_search_property_addressnumber','location_search_property_streetname','location_search_property_postcode']);
    if(is_noresult_property == false){
        KDF.hideWidget('but_edit_address');    
    }
}

function hideManualEnterAddressYd(is_noresult_property_yd){
    hideWidgets(['txt_address_number_yd','txt_street_name_yd','txt_city_yd']);
    clearValue(['txt_address_number_yd','txt_street_name_yd','txt_city_yd','txta_address_yd']);
    clearValueHtml(['location-search-citizen_addressnumber','location-search-citizen_streetname','location-search-citizen_postcode']);
    if(is_noresult_property_yd == false){
        KDF.hideWidget('but_yd_edit_address');
    }
}

hideWidgets(['txt_address_number_yd','txt_street_name_yd','txt_city_yd']);
            clearValue(['txt_address_number_yd','txt_street_name_yd','txt_city_yd','txta_address_yd']);
            clearValueHtml(['location-search-citizen_addressnumber','location-search-citizen_streetname','location-search-citizen_postcode']);
            KDF.hideWidget('but_yd_edit_address');

function showCustomerSearchYdWidgets(){
    var params = [ 'area_yd_customer_details', 'area_yd_additional_details', 'area_yd_property_details'];
    showSections(params);
    
    var params_widgets = ['bset_your_details_next_updateaddress', 'but_next_update_yd'];
    showWidgets(params_widgets);
}

function doCreateCustomerFlow(){
    create_customer_flow = true;
        
    showCustomerSearchYdWidgets();    
    var params = [ 'txt_customer_id', 'txt_firstname', 'txt_lastname', 'eml_email', 'txt_contact_number', 'txt_address_number_yd', 'txt_street_name_yd', 'txt_city_yd', 'txta_address_yd'];
    clearValue(params);		
	
    KDF.showSection('area_property_search_yd');
    hideWidgets(['txta_address_yd','bset_your_details_next_updateaddress']);
    KDF.hideSection('area_yd_property_details');
    KDF.hideWidget('ahtm_no_result_yd');
    
    var options = document.getElementById("dform_widget_cs_customer_search_id").options;
    options[0].selected = true;
    
    //use the same address
    if(KDF.getVal('txta_address') != '' && getIncidentPropertyId() != ''){
        KDF.hideSection('area_property_search_yd');
        KDF.showWidget('rad_yd_same_address');
        
        $('#dform_widget_rad_yd_same_address1').next().html(KDF.getVal('txta_address'));
        
        KDF.setVal('txt_address_number_yd',KDF.getVal('txt_addressnum'));
	    KDF.setVal('txt_street_name_yd',KDF.getVal('txt_street_name'));
	    KDF.setVal('txt_city_yd',KDF.getVal('txt_city'));
    }
}

function getIncidentPropertyId(){
    var propertyId = '';
    
    if(KDF.getVal('le_associated_obj_type') === 'D3'){
        propertyId = KDF.getVal('le_associated_obj_id');
    }
    
    return propertyId;
}

function setDefaultAddress(response){
    KDF.setVal('txt_address_number_yd', response.data["profile-AddressNumber"]);
    KDF.setVal('txt_street_name_yd', response.data["profile-AddressLine1"]);
    KDF.setVal('txt_city_yd', response.data["profile-City"]);
    KDF.setVal('txt_postcode_yd', response.data["profile-Postcode"]);
    KDF.setVal('txta_address_yd',validateFullAddress(['txt_address_number_yd','txt_street_name_yd','txt_city_yd','txt_postcode_yd']));	
}

function validateFullAddress(params){
  var fullAddress = '';    
  for (i=0; i<params.length; i++) {
    if(KDF.getVal(params[i]) != ''){
        if(i > 0){fullAddress += ', '};
        fullAddress += KDF.getVal(params[i]);
    }
  }
  return fullAddress;
}

function validateProperty(param){
    var property_error_msg = 'Please provide property details';
    
    if(KDF.getVal(param) != ''){
        KDF.gotoNextPage();    
    }
    else{
        KDF.showError(property_error_msg);
    }
}

function hideIndividualSearchYd(){
    hideSections(['area_yd_customer_details','area_yd_additional_details']);
    hideWidgets(["ahtm_no_result_yd","rad_yd_same_address"]);
}

function hidePropertySearchYd(){
    KDF.hideSection("area_yd_property_details");
    hideWidgets(["bset_your_details_next_updateaddress","but_yd_edit_address","ahtm_no_result_yd"]);
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
    if(params != null){
        for (i=0; i<params.length; i++) {
          if(params[i] != null){
            $('#'+params[i]).val('');
          }
        }    
    }
}	

function disableWidgets (params){
  for (i=0; i<params.length; i++) {
    $(params[i]).prop('readonly', true);
  }		
}

function enableWidgets (params){
  for (i=0; i<params.length; i++) {
    $(params[i]).prop('readonly', false);
  }		
}

function toggleNavigation(){
	KDF.hideNav();

	// Show save controls for agent
	if(KDF.kdf().viewmode=== 'U' || KDF.kdf().viewmode=== 'R' && KDF.kdf().access=== 'agent') {
	    $("#dform_controls").show();
		KDF.showNav();
	}
	else if(KDF.kdf().form.readonly=== true && KDF.kdf().access=== 'citizen') {
		KDF.showNav();
	}

	// Hide all button controls on the form on Read mode for Agent and Citizen
	if((KDF.kdf().access=== 'agent' && KDF.kdf().viewmode=== 'R') ||(KDF.kdf().access=== 'citizen' && KDF.kdf().form.readonly=== true)) {
		$('#dform_'+KDF.kdf().form.name).find('button').hide();
	}
}
/*END MANAGE INDIVIDUAL*/

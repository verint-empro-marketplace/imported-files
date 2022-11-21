var individualTemplateIdentifier = 'individual_template_';

function do_KDF_Ready_Individual(event, kdf) {
	var form_name = kdf.name;
	KDF.showSection('area_customer_information');
	
	if (KDF.kdf().access === 'agent' && KDF.getVal('rad_viewmode') !== 'R' && KDF.getVal('rad_viewmode') !== 'U') {
		KDF.hideSection('area_customer_information');
		KDF.hideSection('area_your_details_next_updateaddress');

		$('#dform_widget_eml_email').prop('required', true);
		
		if (typeof KDF.getParams().customerid !== 'undefined' && KDF.getParams().customerid !== '') {
			KDF.customdata('person-retrieve-new', individualTemplateIdentifier + 'KDF_Ready', true, true, { 'person_search_results': KDF.getParams().customerid });
		}
		else{
			//prevents flickering issue when displaying same address rad button
			KDF.showSection('area_property_search');	
		}	
	}
    
    //Setting tabindex=0 for headings --> this to fix accessibility issues in heading for not being narrated by NVDA
    $("#dform_widget_header_hrd_addresssearch").attr("tabindex","0");
    $("#dform_widget_header_hrd_address_details").attr("tabindex","0");
    $("#dform_widget_header_hrd_report_summary").attr("tabindex","0");
    $("label[for='dform_widget_le_eventcode']").attr("tabindex","0");
    
    //Instantiate select2 widget for search inside the service dropdown
    $("#dform_widget_le_eventcode").select2({
        width: '31.5%',
        dropdownAutoWidth: true,
        placeholder:'Please select...',
    });
	
    if(KDF.getVal('txt_created_by') == ''){
        KDF.setVal('txt_created_by',KDF.kdf().access);
    }
    //view mode 
    if(KDF.kdf().viewmode == 'R'){
	    KDF.showNav();
	    showWidgets(['txta_address_yd','txt_firstname','txt_lastname','eml_email','txt_contact_number']);
	    showSections(['area_yd_customer_details','area_yd_additional_details']);
	    toggleNavigation();
	}
	
	//edit mode
	if(KDF.kdf().viewmode == 'U'){
	    KDF.showNav();
	    showWidgets(['txta_address_yd','txt_firstname','txt_lastname','eml_email','txt_contact_number']);
	    showSections(['area_yd_customer_details','area_yd_additional_details']);
	    
	    if(KDF.getVal('txt_created_by') == "citizen"){
	        showWidgets(['but_next_update_yd','bset_your_details_next_updateaddress','but_cust_info_update_address']);
	    }
	}
}

function do_KDF_Custom_Individual(event, kdf, response, action){
	var isIndividualTemplate = false;
	
	if (response.actionedby.indexOf(individualTemplateIdentifier) === 0) {isIndividualTemplate = true;}
	
	if (isIndividualTemplate) {		
		var actionedBySource = response.actionedby.replace(individualTemplateIdentifier, '');
		
		if (action === 'person-retrieve-new' && actionedBySource === 'KDF_Ready') {
			KDF.showWidget('bset_your_details_next_updateaddress');
			if (KDF.kdf().access === 'citizen') {
				//aunthenticated citizen
				if(response.data.txt_customerID !== ''){
					KDF.showWidget('txta_address_yd');
				}
				else{
					$("#dform_widget_txt_firstname").attr("readonly", false);
					$("#dform_widget_txt_lastname").attr("readonly", false);
					$("#dform_widget_eml_email").attr("readonly", false);
					$("#dform_widget_txt_contact_number").attr("readonly", false);	
					
					KDF.hideWidget('txta_address_yd');
				}	
				KDF.hideWidget('ahtm_manually_entered_address_info');
				KDF.showSection('area_your_details_addressdetails');
				
				if(response.data['profile-Address'] !== ''){
					KDF.hideSection('area_property_search_yd');
				}	
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
			
			showWidgets(['txta_address_yd','bset_your_details_next_updateaddress','but_cust_info_update_address', 'but_update_customer']);
	        showSections(['area_customer_information','area_your_details_next_updateaddress','']);    
	    
	        hideWidgets(['txt_address_number_yd','txt_city_yd','txt_street_name_yd','but_yd_edit_address', 'rad_yd_same_address']);
		    disableWidgets(['#dform_widget_txt_firstname','#dform_widget_txt_lastname','#dform_widget_eml_email','#dform_widget_txt_contact_number']);
			
	        //set default value for placeholder fields used in update individual
	        KDF.setVal('txt_logic_streetnumber', response["profile-AddressNumber"]);
	        KDF.setVal('txt_logic_streetname', response["profile-AddressLine1"]);
	        KDF.setVal('txt_logic_town', response["profile-City"]);
	        KDF.setVal('txt_logic_postcode', response["profile-Postcode"]);
		}
		else if (action === 'person-retrieve-new' && actionedBySource == 'search-individual') {
			KDF.setVal('txt_cust_info_uprn', KDF.getVal('txt_logic_uprn'));
		}
		else if(action === 'widget-property-search'){
		    KDF.setVal('txt_property_id',response.data['first_result_value']);
		    KDF.showWidget('rad_existing_address');
		    KDF.hideSection('area_property_search');
		    $('#dform_widget_rad_existing_address1').next().html('Yes - '+KDF.getVal('txt_profile_address'));
		}
		else if(action === 'retrieve-property'){
		    //will be used as default address when creating new customer
		    KDF.setVal('txt_addressnum',response.data['addressNumber']);
	        KDF.setVal('txt_street_name',response.data['streetName']);
	        KDF.setVal('txt_city',response.data['town']);
		}
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

function showCustomerSearchYdWidgets(){
    var params = [ 'area_yd_customer_details', 'area_yd_additional_details', 'area_yd_property_details'];
    showSections(params);
    
    var params_widgets = ['bset_your_details_next_updateaddress', 'but_next_update_yd'];
    showWidgets(params_widgets);
}

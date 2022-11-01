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
function initFormConfig(event, kdf){
	if ($('.txta-gov').is(':visible')) {

              var maxLength = $('#dform_widget_txta_your_enquiry').attr('maxlength');
              console.log(maxLength)
              
              $('.txta-length-message').html(maxLength + ' characters left');
        }
    
    if (KDF.kdf().access === 'citizen' && KDF.kdf().form.readonly) {
        KDF.showNav();
    }
    else {
        if ( KDF.getVal('rad_viewmode') != 'R' && KDF.getVal('rad_viewmode') != 'U' ) {
            console.log('hide navigation');
            KDF.hideNav();
            KDF.hideControls();
        } else {
            $('#dform_widget_le_gis_reversegeo').hide();
            console.log('show navigation');
            KDF.showNav();
            console.log('make read only');
            KDF.makeReadonly();
        }
    }
    
    $('#dform_mp_general_enquiry').off('click', '.copyaddressvalue').on('click', '.copyaddressvalue', function() {
        console.log ('accessed by : '+KDF.access);
            console.log('retrieved value for address : '+KDF.getVal('txt_r_streetnumber') +' '+ KDF.getVal('txt_r_streetname') +' '+ KDF.getVal('txt_r_town') +' '+ KDF.getVal('txt_r_postcode'));
            
            KDF.setVal('num_p_streetnumber',KDF.getVal('txt_r_streetnumber'));
            KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
            KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
            KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
            KDF.showPage('provide_details_address');
  
            KDF.gotoNextPage();
    });
    
    if (KDF.getVal('txt_access') === 'agent') {
        if (KDF.getVal('txt_customerID')) {
        KDF.showSection('area_customer_name');
        KDF.showSection('area_customer_contacts');
        KDF.showWidget('but_continue_selectindividual');
        KDF.showWidget('but_individual_address');
        KDF.showWidget('hrd_customerdetails');
        KDF.setVal('customerID',KDF.getVal('txt_customerID'));
        }
    } else if (KDF.getVal('txt_access') === 'citizen') {
        KDF.showWidget('but_submit_citizen_details');
        KDF.showWidget('eml_subscriber');
        
        KDF.setVal('txt_customerid_subscriber',KDF.getVal('txt_customerID'));
    }
}	

function onCreateIndividualNewCACalled(event, kdf, response, action){
	if (action == 'create-individual-new') {
        setCreateIndividualResult(false);
        
        if (response.data.txt_customerID !== undefined) {
            setCreateIndividualResult(true);
            KDF.showSuccess('Individual created successfully');
            console.log('txt_customerID '+response.data.txt_customerID);
            customerid_subscriber = response.data.txt_customerID;
            KDF.setVal('txt_customerid_subscriber',response.data.txt_customerID);
            console.log('customerid_subscriber :'+customerid_subscriber);
        }
	}
	/* action performed when CA  update-indivudal is called */
	else if (action == 'update-individual-new') {
	   setUpdateIndividualResult(false);
	    console.log ('update result :'+response.data.txt_success);
	    if ( response.data.txt_success === 'Completed' ) {
	        setUpdateIndividualResult(true);
	    }
	} else if (action === 'get_uprn') {
	    v_uprn = null;
	    if (response.data.uprn) {
	        v_uprn = response.data.uprn;
	    }
	    KDF.setVal('txt_p_uprn',v_uprn);
	    KDF.setVal('txt_c_uprn',v_uprn);
	    if (var_update) {
            update_individual_details = false;
            KDF.customdata('update-individual-new', 'create', true, true, {'customerID':KDF.getVal('customerID'), 'txt_first_name':KDF.getVal('txt_first_name'),'txt_last_name':KDF.getVal('txt_last_name'),'phone':KDF.getVal('phone'),'email':KDF.getVal('email'),'tel_mobile':KDF.getVal('tel_mobile'),'num_p_streetnumber':KDF.getVal('num_p_streetnumber'),'txt_p_streetname':KDF.getVal('txt_p_streetname'),'txt_p_town':KDF.getVal('txt_p_town'),'txt_p_postcode':KDF.getVal('txt_p_postcode'),'txt_p_uprn':KDF.getVal('txt_p_uprn')});  
	    } else if (var_create) {
            KDF.customdata('create-individual-new', 'create', true, true, {'txt_c_forename':KDF.getVal('txt_c_forename'),'txt_c_surname':KDF.getVal('txt_c_surname'),'tel_c_telephone':KDF.getVal('tel_c_telephone'),'eml_c_email':KDF.getVal('eml_c_email'),'tel_c_mobile':KDF.getVal('tel_c_mobile'),'txt_c_addressnumber':KDF.getVal('txt_c_addressnumber'),'txt_c_addressline1':KDF.getVal('txt_c_addressline1'),'txt_c_town':KDF.getVal('txt_c_town'),'txt_c_postcode':KDF.getVal('txt_c_postcode'), 'txt_c_uprn':KDF.getVal('txt_c_uprn')});
	    }
	} else if (action === 'voluntary_subscription') {
	   if (response.data.output_log === 'Subscribed') {
	        console.log('subscribed');
	    }
	} else if (  action == 'person-retrieve-new' ) {
	    console.log('person is retrieved');
	}
}	

function onKDFOptionSelected(field, label, val){
	if (field === 'rad_identifyc'){
         if (label == 'yes') {
             
            if (KDF.getVal('txt_access') === 'citizen') {
                  KDF.showWidget('eml_subscriber');
                  KDF.showWidget('but_submit_citizen_details');
            } else if (KDF.getVal('txt_access') === 'agent') {
              KDF.showWidget('but_continue_citizen_details');
              KDF.hideWidget('but_submit_citizen_details');
            } 
            not_associated = false;
         } else if (label === 'no') {
            if (KDF.getVal('txt_access') === 'citizen') {
                  KDF.showWidget('but_submit_citizen_details');
                  KDF.hideWidget('eml_subscriber');
            } else if (KDF.getVal('txt_access') === 'agent') {
              KDF.hideWidget('but_continue_citizen_details');
              KDF.showWidget('but_submit_citizen_details');
            }
            not_associated = true;
         }
    } 
    
    /*show or hide widget when label of CS is changed*/
    if (field == 'cs_customer_search_id'){
        ps_property_search = false;
        ps_property_customer = false;
        ps_property_individual = false;
        cs_customer_search = true;
        
        if(label == '') {
            hideCustomerDetails();
        } else {
            KDF.setVal('customerID',val);
            showCustomerDetails();
        }
    } 
    
    /* show or hide address widget when label of PS is changed */
    if (field == 'ps_individual_id') {
        ps_property_search = false;
        ps_property_customer = false;
        ps_property_individual = true;
        cs_customer_search = false;
    }
    
    if (field == 'ps_existing_customer_id') {
        ps_property_search = false;
        ps_property_customer = true;
        ps_property_individual = false;
        cs_customer_search = false;
    }	
}

function loadObjectsByCustomerType(type){
	if (type === 'customer') {
	    if (cs_customer_search) {
	         if (KDF.getVal('cs_customer_search_id')) {
	       KDF.setVal('num_p_streetnumber',KDF.getVal('txt_r_streetnumber'));
           KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
           KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
           KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
           
           KDF.showWidget('but_individual_notfound');
           KDF.showWidget('but_continue_selectindividual');
           KDF.showWidget('but_individual_address');
	         }
	    }
	        
        console.log('current value of customer address (retrieved): ' + KDF.getVal('num_r_streetnumber') + KDF.getVal('txt_r_streetname') + KDF.getVal('txt_r_town') + KDF.getVal('txt_r_postcode'));
        console.log('current value of customer address : ' + KDF.getVal('num_p_streetnumber') + KDF.getVal('txt_p_streetname') + KDF.getVal('txt_p_town') + KDF.getVal('txt_p_postcode'));
	} else if (type === 'property') {
	    console.log('property UPRN :'+KDF.getVal('txt_uprn_ret'));
	     if (ps_property_customer ) {
	        
	        $("#dform_widget_num_p_streetnumber").attr("readonly", true);
            $("#dform_widget_txt_p_streetname").attr("readonly", true);
            $("#dform_widget_txt_p_town").attr("readonly", true);
            $("#dform_widget_txt_p_postcode").attr("readonly", true);
            KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
	        
	        KDF.showWidget('but_property_notfound_customer');
	        
	    } else if (ps_property_individual) {
	        KDF.showWidget('txt_c_addressnumber');
            KDF.showWidget('txt_c_addressline1');
            KDF.showWidget('txt_c_town');
            KDF.showWidget('txt_c_postcode');
            KDF.showWidget('but_continue_individual_address');
            KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
            KDF.showWidget('but_property_notfound');
            
            $("#dform_widget_txt_c_addressnumber").attr("readonly", true);
            $("#dform_widget_txt_c_addressline1").attr("readonly", true);
            $("#dform_widget_txt_c_town").attr("readonly", true);
            $("#dform_widget_txt_c_postcode").attr("readonly", true);
	    }
	}	
}	

function propertyNotFoundClicked(){
        $("#dform_widget_txt_c_addressnumber").attr("readonly", false);
        $("#dform_widget_txt_c_addressline1").attr("readonly", false);
        $("#dform_widget_txt_c_town").attr("readonly", false);
        $("#dform_widget_txt_c_postcode").attr("readonly", false);
        
        if (!KDF.getVal('txt_c_addressline1')) {
            KDF.setVal('txt_c_addressnumber','');
            KDF.setVal('txt_c_addressline1','');
            KDF.setVal('txt_c_town','');
            KDF.setVal('txt_c_postcode','');
            KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
        } else {
            KDF.showWidget('ahtm_cancel_edit_manual_createindividual');
        }
        
        KDF.showWidget('txt_c_addressnumber');
        KDF.showWidget('txt_c_addressline1');
        KDF.showWidget('txt_c_town');
        KDF.showWidget('txt_c_postcode');
        KDF.showWidget('but_continue_individual_address');
        KDF.hideWidget('but_property_notfound');
}

function onBtnContinueCustomerAddressClicked(){
	console.log('customer details address continue');
    KDF.hidePage('create_individual_details');
    KDF.hidePage('create_individual_address');
    KDF.setVal('email_subscriber', KDF.getVal('email'));
    KDF.setVal('txt_customerid_subscriber',KDF.getVal('customerID'));
    console.log('retrieving UPRN');
    var_update = true;
	var_create = false;
	KDF.customdata('get_uprn', 'create', true, true, {'p_addressnumber':KDF.getVal('num_p_streetnumber'), 'p_addressname':KDF.getVal('txt_p_streetname'), 'p_postcode':KDF.getVal('txt_p_postcode')});
}	

function onBtnContinueIndividualAddressClicked(){
	console.log('retrieving UPRN');
    KDF.setVal('email_subscriber', KDF.getVal('eml_c_email'));
    customerid_subscriber = null;
    console.log('customerid_subscriber : '+customerid_subscriber);
    var_update = false;
	var_create = true   ;
	KDF.customdata('get_uprn', 'create', true, true, {'p_addressnumber':KDF.getVal('txt_c_addressnumber'), 'p_addressname':KDF.getVal('txt_c_addressline1'), 'p_postcode':KDF.getVal('txt_c_postcode')});
}	

function onBtnContinueSelectIndividualClicked(){
	if (KDF.getVal('email')) {
        
        KDF.hidePage('create_individual_details');
        KDF.hidePage('create_individual_address')
        
        KDF.setVal('email_subscriber', KDF.getVal('email'));    
        KDF.setVal('txt_customerid_subscriber',KDF.getVal('customerID'));

        KDF.hidePage('create_individual_details');
        KDF.hidePage('create_individual_address');
        
        KDF.setVal('num_p_streetnumber',KDF.getVal('txt_r_streetnumber'));
        KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
        KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
        KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
        
        KDF.hidePage('provide_details_address');
        
        update_individual_details = true;
        KDF.customdata('update-individual-new', 'create', true, true, {'customerID':KDF.getVal('customerID'), 'txt_first_name':KDF.getVal('txt_first_name'),'txt_last_name':KDF.getVal('txt_last_name'),'phone':KDF.getVal('phone'),'email':KDF.getVal('email'),'tel_mobile':KDF.getVal('tel_mobile'),'num_p_streetnumber':KDF.getVal('txt_r_streetnumber'),'txt_p_streetname':KDF.getVal('txt_r_streetname'),'txt_p_town':KDF.getVal('txt_r_town'),'txt_p_postcode':KDF.getVal('txt_r_postcode'),'txt_p_uprn':KDF.getVal('txt_uprn_details')});

    } else {
        KDF.showWarning('Please provide email address');
    }
}	

function onSearchCloseResultClicked(){
	var activeCustomerDetails =  $('#dform_page_provide_details').attr('data-active');
    var activeIndividualAddress =  $('#dform_page_create_individual_address').attr('data-active');
    var activeCustomerAddress = $('#dform_page_provide_details_address').attr('data-active');

    if (activeCustomerDetails === 'true') {
         if (!KDF.getVal('txt_customerID')) {
             KDF.hideSection('area_customer_name');
             KDF.hideSection('area_customer_contacts');
             KDF.hideWidget('hrd_customerdetails');
             KDF.hideWidget('but_continue_selectindividual');
             KDF.hideWidget('but_individual_address');
        }
        KDF.hideWidget('but_individual_notfound');
         
    }
    
    if (activeIndividualAddress === 'true') {
         KDF.hideWidget('txt_c_addressnumber');
         KDF.hideWidget('txt_c_addressline1');
         KDF.hideWidget('txt_c_town');
         KDF.hideWidget('txt_c_postcode');
         KDF.hideWidget('but_continue_individual_address');
         KDF.hideWidget('but_property_notfound');
         KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
    }
    
    if (activeCustomerAddress === 'true') {
        KDF.hideWidget('but_property_notfound_customer');
    }
    
    KDF.hideWidget('but_continue_home_address');
}	

function onHideCustomerSearchResultHolder(){
	KDF.hideSection('area_customer_name');
    KDF.hideSection('area_customer_contacts');
    KDF.hideWidget('hrd_customerdetails');
    KDF.hideWidget('but_continue_selectindividual');
    KDF.hideWidget('but_individual_address');
}	

function onHideIndividualResultHolder(){
	KDF.hideWidget('txt_c_addressnumber');
    KDF.hideWidget('txt_c_addressline1');
    KDF.hideWidget('txt_c_town');
    KDF.hideWidget('txt_c_postcode');
    KDF.hideWidget('but_continue_individual_address');
    KDF.hideWidget('ahtm_edit_manual_createindividual');
    KDF.hideWidget('but_property_notfound');
    KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
}	

function updateIndividualResult(){
	KDF.setVal('txt_r_streetnumber',KDF.getVal('num_p_streetnumber'));
        KDF.setVal('txt_r_streetname',KDF.getVal('txt_p_streetname'));    
        KDF.setVal('txt_r_town',KDF.getVal('txt_p_town'));    
        KDF.setVal('txt_r_postcode',KDF.getVal('txt_p_postcode'));
        
        KDF.setVal('txta_full_address_retrieve',KDF.getVal('txt_r_streetnumber') +' '+KDF.getVal('txt_r_streetname').toProperCase()+', '+KDF.getVal('txt_r_town').toProperCase()+' '+KDF.getVal('txt_r_postcode'));
        
        KDF.setCustomerID($('[name="customerID"]').val());
        
        KDF.gotoNextPage();
}	

function showCustomerDetails() {
     KDF.showSection('area_customer_name');
     KDF.showSection('area_customer_contacts');
     KDF.showWidget('but_continue_selectindividual');
     KDF.showWidget('but_individual_address');
     KDF.showWidget('hrd_customerdetails');
}

function hideCustomerDetails() {
    KDF.hideSection('area_customer_name');
    KDF.hideSection('area_customer_contacts');
    KDF.hideWidget('hrd_customerdetails');
    KDF.hideWidget('but_updatedetails');
    KDF.hideWidget('but_continue_selectindividual');
    KDF.hideWidget('but_individual_address');
}

function onBtnPropertyNotFoundClicked(){
	$("#dform_widget_num_p_streetnumber").attr("readonly", false);
        $("#dform_widget_txt_p_streetname").attr("readonly", false);
        $("#dform_widget_txt_p_town").attr("readonly", false);
        $("#dform_widget_txt_p_postcode").attr("readonly", false);
        
        if (!KDF.getVal('txt_p_streetname')) {
            KDF.setVal('num_p_streetnumber','');
            KDF.setVal('txt_p_streetname','');
            KDF.setVal('txt_p_town','');
            KDF.setVal('txt_p_postcode','');
            KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
        } else {
             KDF.showWidget('ahtm_cancel_edit_manual_customerdetails');
        }
        
        KDF.hideWidget('but_property_notfound_customer');
}	

function editManuallyClicked(){
        KDF.setVal('num_p_streetnumber',KDF.getVal('txt_temp_streetnumber_customerdetails'));
        KDF.setVal('txt_p_streetname',KDF.getVal('txt_temp_streetname_customerdetails'));
        KDF.setVal('txt_p_town','YourCity');
        KDF.setVal('txt_p_postcode',KDF.getVal('txt_temp_postcode_customerdetails'));
        
        $("#dform_widget_num_p_streetnumber").attr("readonly", true);
        $("#dform_widget_txt_p_streetname").attr("readonly", true);
        $("#dform_widget_txt_p_town").attr("readonly", true);
        $("#dform_widget_txt_p_postcode").attr("readonly", true);
        KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
        KDF.showWidget('but_property_notfound_customer');
}	

function manualCreateIndividual(){
	KDF.setVal('txt_c_addressnumber',KDF.getVal('txt_temp_streetnumber_createindividual'));
        KDF.setVal('txt_c_addressline1',KDF.getVal('txt_temp_streetname_createindividual'));
        KDF.setVal('txt_c_town','YourCity');
        KDF.setVal('txt_c_postcode',KDF.getVal('txt_temp_postcode_createindividual'));
        
        $("#dform_widget_txt_c_addressnumber").attr("readonly", true);
        $("#dform_widget_txt_c_addressline1").attr("readonly", true);
        $("#dform_widget_txt_c_town").attr("readonly", true);
        $("#dform_widget_txt_c_postcode").attr("readonly", true);
        KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
        KDF.showWidget('but_property_notfound');
}	

function submitCitizenDetails(){
	if (KDF.getVal('rad_identifyc')==='yes') {
        KDF.setVal('email_subscriber', KDF.getVal('eml_subscriber'));
    } else {
        KDF.setVal('email_subscriber', null);
    }
    
    KDF.hidePage('create_individual_details');
    KDF.hidePage('create_individual_address');
    KDF.gotoPage('complete',true,true,true);
}	
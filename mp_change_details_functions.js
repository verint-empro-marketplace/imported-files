/* When right arrow of CS is clicked, then customer details will be closed */
$(document).on('click','.dform_widget_search_closeresults',function(){
	var activeCustomerDetails =  $('#dform_page_provide_details').attr('data-active');
    var activeIndividualAddress =  $('#dform_page_create_individual_address').attr('data-active');
    var activeCustomerAddress = $('#dform_page_provide_details_address').attr('data-active');

    if (activeCustomerDetails === 'true') {
         if (!KDF.getVal('txt_customer_id')) {
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
});

$('#dform_widget_ps_existing_customer_resultholder').on('show', function(){
    KDF.showWidget('but_property_notfound_customer');
});

$('#cancel_edit_manually_customerdetails').click(function(){
        KDF.setVal('num_p_streetnumber',KDF.getVal('txt_temp_streetnumber_customerdetails'));
        KDF.setVal('txt_p_streetname',KDF.getVal('txt_temp_streetname_customerdetails'));
        KDF.setVal('txt_p_town','EDINBURGH');
        KDF.setVal('txt_p_postcode',KDF.getVal('txt_temp_postcode_customerdetails'));
        
        $("#dform_widget_num_p_streetnumber").attr("readonly", true);
        $("#dform_widget_txt_p_streetname").attr("readonly", true);
        $("#dform_widget_txt_p_town").attr("readonly", true);
        $("#dform_widget_txt_p_postcode").attr("readonly", true);
        KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
        KDF.showWidget('but_property_notfound_customer');  
});

//$('#edit_manually_customerdetails_provide').click(function(){
$('#dform_widget_button_but_property_notfound_customer').click(function(){
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
});


//$('#edit_manually_customerdetails_provide').click(function(){
$('#dform_widget_button_but_property_notfound_customer').click(function(){
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
});

$('#cancel_edit_manually_customerdetails').click(function(){
	KDF.setVal('num_p_streetnumber',KDF.getVal('txt_temp_streetnumber_customerdetails'));
	KDF.setVal('txt_p_streetname',KDF.getVal('txt_temp_streetname_customerdetails'));
	KDF.setVal('txt_p_town','EDINBURGH');
	KDF.setVal('txt_p_postcode',KDF.getVal('txt_temp_postcode_customerdetails'));
	
	$("#dform_widget_num_p_streetnumber").attr("readonly", true);
	$("#dform_widget_txt_p_streetname").attr("readonly", true);
	$("#dform_widget_txt_p_town").attr("readonly", true);
	$("#dform_widget_txt_p_postcode").attr("readonly", true);
	KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
	KDF.showWidget('but_property_notfound_customer');
});

/*function to show customer details */
function showCustomerDetails() {
     KDF.showSection('area_customer_name');
     KDF.showSection('area_customer_contacts');
     KDF.showWidget('but_continue_selectindividual');
     KDF.showWidget('but_individual_address');
     KDF.showWidget('hrd_customerdetails');
}

/*function to hide customer details */
function hideCustomerDetails() {
    KDF.hideSection('area_customer_name');
    KDF.hideSection('area_customer_contacts');
    KDF.hideWidget('hrd_customerdetails');
    KDF.hideWidget('but_continue_selectindividual');
    KDF.hideWidget('but_individual_address');
}


$(document).on('keypress','#dform_widget_cs_customerdetails_txt_forename',function() {
	if (event.keyCode == 13) {
	    event.preventDefault();
		document.getElementById("dform_widget_cs_customer_r_search_searchbutton").click();
	}
});


$(document).on('keypress','#dform_widget_cs_customerdetails_txt_name',function() {
	if (event.keyCode == 13) {
	    event.preventDefault();
		document.getElementById("dform_widget_cs_customer_r_search_searchbutton").click();
	}
});


$(document).on('keypress','#dform_widget_ps_customerdetails_txt_streetname',function() {
	if (event.keyCode == 13) {
	    event.preventDefault();
		document.getElementById("dform_widget_ps_existing_customer_searchbutton").click();
	}
});

$(document).on('keypress','#dform_widget_ps_customerdetails_txt_postcode',function() {
	if (event.keyCode == 13) {
	    event.preventDefault();
		document.getElementById("dform_widget_ps_existing_customer_searchbutton").click();
	}
});                                                                                                                                                                                                              
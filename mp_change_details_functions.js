var hideclass = 'fileuploadobject';
var ps_property_customer = false;
var ps_property_individual = false;
var cs_customer_search = false;
var ps_property_search = false;
var editaddressflag=0;
var fullname_final=[];

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

$('#dform_mp_change_detail').off('_KDF_objectdataLoaded').on('_KDF_objectdataLoaded', function(event, kdf, response, type, id) {
	// fires when the object data has been loaded
	if (type === 'customer') {
	    if (cs_customer_search) {
            if (KDF.getVal('cs_customer_search_id')) {
                KDF.setVal('num_p_streetnumber',KDF.getVal('txt_r_streetnumber'));
                KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
                KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
                KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
               
                KDF.showWidget('but_continue_selectindividual');
                KDF.showWidget('but_individual_address');
            }
	    }
	    KDF.setVal('txt_customer_id',id);
	}
	else if (type === 'property') {
        if (ps_property_customer ) {
            $("#dform_widget_num_p_streetnumber").attr("readonly", true);
            $("#dform_widget_txt_p_streetname").attr("readonly", true);
            $("#dform_widget_txt_p_town").attr("readonly", true);
            $("#dform_widget_txt_p_postcode").attr("readonly", true);
            KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
            KDF.showWidget('but_property_notfound_customer');
        } 
	}
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

function do_KDF_ready(event, kdf){
    $('#dform_widget_button_but_homeaddress_edit').click(function () {
        KDF.showPage('provide_details_address');
        editaddressflag = 1;
        
        KDF.showWidget('but_continue');
        
        // Copy address from original value to editable fields
        KDF.setVal('num_p_streetnumber', KDF.getVal('num_r_streetnumber'));
        KDF.setVal('txt_p_streetname', KDF.getVal('txt_r_streetname'));
        KDF.setVal('txt_p_town', KDF.getVal('txt_r_town'));
        KDF.setVal('txt_p_postcode', KDF.getVal('txt_r_postcode'));
        
        KDF.gotoPage('provide_details_address');
    });
        
    $('#dform_widget_button_but_submit_main').click(function () {
        fullname_final = KDF.getVal('txt_fullname').split(" ");
        KDF.gotoPage('complete');
    });
    
     $('#dform_widget_button_but_continue').click(function () {
        fullname_final = KDF.getVal('txt_fullname').split(" ");
    });
    
    $('#dform_widget_button_but_continue_customer_address').click(function() {
        KDF.customdata('get_uprn', 'create', true, true, {
            'p_addressnumber':KDF.getVal('num_p_streetnumber'),
            'p_addressname':KDF.getVal('txt_p_streetname'),
            'p_postcode':KDF.getVal('txt_p_postcode')
        });
        
        KDF.setVal('num_r_streetnumber', KDF.getVal('num_p_streetnumber'));
        KDF.setVal('txt_r_streetname', KDF.getVal('txt_p_streetname'));
        KDF.setVal('txt_r_town', KDF.getVal('txt_p_town'));
        KDF.setVal('txt_r_postcode', KDF.getVal('txt_p_postcode'));
        
        var address = [];
        if(KDF.getVal('num_r_streetnumber')) {
            address.push(KDF.getVal('num_r_streetnumber'));
        }
        if(KDF.getVal('txt_r_streetname')) {
            address.push(KDF.getVal('txt_r_streetname'));
        }
        if(KDF.getVal('txt_r_town')) {
            address.push(KDF.getVal('txt_r_town'));
        }
        if(KDF.getVal('txt_r_postcode')) {
            address.push(KDF.getVal('txt_r_postcode'));
        }
        
        KDF.setVal('txt_fullstreetadd', address.join(', '));
        KDF.setVal('txta_homeaddress_edit', KDF.getVal('txt_fullstreetadd'));
        KDF.gotoPage('page_changeofdetails');
    });
    
    $('#dform_widget_button_but_back_customer_address').click(function () {
        $('.dform_widget_search_closeresults').click();
        
        KDF.gotoPrevPage();
    });

    if (KDF.getVal('txt_customer_id')) {
        KDF.showSection('area_customer_name');
        KDF.showSection('area_customer_contacts');
        KDF.showWidget('but_continue_selectindividual');
        KDF.showWidget('but_individual_address');
        KDF.showWidget('hrd_customerdetails');
        KDF.setVal('customerID',KDF.getVal('txt_customerID'));
        KDF.showWidget('but_continue_citizen_details');
        KDF.hideWidget('but_submit_citizen_details');
        if (KDF.getVal('txt_access') === 'citizen') {
            KDF.hideWidget('but_back_mainpage');
        }
		
		KDF.customdata('person-retrieve-new', 'create', true, true, {'person_search_results':KDF.getVal('txt_customer_id')});
    }
    
    $('#dform_mp_change_detail').off('click', '.copyaddressvalue').on('click', '.copyaddressvalue', function() {
        KDF.setVal('num_p_streetnumber',KDF.getVal('num_r_streetnumber'));
        KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
        KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
        KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
        
        KDF.gotoNextPage();
    });
	
    $('#dform_widget_ps_existing_customer_resultholder').on('show', function () {
        KDF.showWidget('but_property_notfound_customer');
    });

    $('#dform_widget_ps_existing_customer_resultholder').on('hide', function () {
        KDF.hideWidget('but_property_notfound_customer');
    });

    $('#dform_widget_button_but_property_notfound_customer').click(function () {
        $("#dform_widget_num_p_streetnumber").attr("readonly", false);
        $("#dform_widget_txt_p_streetname").attr("readonly", false);
        $("#dform_widget_txt_p_town").attr("readonly", false);
        $("#dform_widget_txt_p_postcode").attr("readonly", false);

        if (!KDF.getVal('txt_p_streetname')) {
            KDF.setVal('num_p_streetnumber', '');
            KDF.setVal('txt_p_streetname', '');
            KDF.setVal('txt_p_town', '');
            KDF.setVal('txt_p_postcode', '');
            KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
        } else {
            KDF.showWidget('ahtm_cancel_edit_manual_customerdetails');
        }

        KDF.hideWidget('but_property_notfound_customer');

    });
    
    $('#cancel_edit_manually_customerdetails').click(function () {
        KDF.setVal('num_p_streetnumber', KDF.getVal('txt_temp_streetnumber_customerdetails'));
        KDF.setVal('txt_p_streetname', KDF.getVal('txt_temp_streetname_customerdetails'));
        KDF.setVal('txt_p_town', KDF.getVal('txt_temp_town_customerdetails'));
        KDF.setVal('txt_p_postcode', KDF.getVal('txt_temp_postcode_customerdetails'));

        $("#dform_widget_num_p_streetnumber").attr("readonly", true);
        $("#dform_widget_txt_p_streetname").attr("readonly", true);
        $("#dform_widget_txt_p_town").attr("readonly", true);
        $("#dform_widget_txt_p_postcode").attr("readonly", true);
        KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
        KDF.showWidget('but_property_notfound_customer');

    });

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
}	

function do_KDF_objectDataLoaded(event, kdf, response, type, id){
    if (type === 'customer') {
	if (cs_customer_search) {
            if (KDF.getVal('cs_customer_search_id')) {
                KDF.setVal('num_p_streetnumber',KDF.getVal('txt_r_streetnumber'));
                KDF.setVal('txt_p_streetname',KDF.getVal('txt_r_streetname'));    
                KDF.setVal('txt_p_town',KDF.getVal('txt_r_town'));    
                KDF.setVal('txt_p_postcode',KDF.getVal('txt_r_postcode'));
               
                KDF.showWidget('but_continue_selectindividual');
                KDF.showWidget('but_individual_address');
            }
	}
	    KDF.setVal('txt_customer_id',id);
    }
    else if (type === 'property') {
        if (ps_property_customer) {
            $("#dform_widget_num_p_streetnumber").attr("readonly", true);
            $("#dform_widget_txt_p_streetname").attr("readonly", true);
            $("#dform_widget_txt_p_town").attr("readonly", true);
            $("#dform_widget_txt_p_postcode").attr("readonly", true);
            KDF.hideWidget('ahtm_cancel_edit_manual_customerdetails');
            KDF.showWidget('but_property_notfound_customer');
        } 
    }	
}	

function do_KDF_optionSelected(event, kdf, field, label, val) {
    if (field == 'ps_youraddress_id') {
		KDF.showSection('area_youraddress');
		KDF.showWidget('but_submit');
    }
	else if (field == 'cs_customer_search_id'){ /*show or hide widget when label of CS is changed*/
        ps_property_search = false;
        ps_property_customer = false;
        ps_property_individual = false;
        cs_customer_search = true;
        
        if(label == '') {
            hideCustomerDetails();
        } else {
            KDF.setVal('customerID',val);
            showCustomerDetails();;
        }
    } 
	else if (field == 'ps_existing_customer_id') {
        ps_property_search = false;
        ps_property_customer = true;
        ps_property_individual = false;
        cs_customer_search = false;
    }	
}	

function do_KDF_Complete(event, kdf){
    KDF.showWidget('html_pleasewait');
    KDF.showWidget('loading_gif');
    
    $('#dform_successMessage').addClass(hideclass); 
	var name_before;
	var name_after;
	var email_before;
	var email_after;
	var address_before;
	var address_after;
    
    setTimeout(function(){
        KDF.customdata('update-individual-new', 'create', true, true, {
                'customerID':KDF.getVal('txt_customer_id'),
                'txt_first_name':KDF.getVal('txt_firstname'),
                'txt_last_name':KDF.getVal('txt_lastname'),
                'email':KDF.getVal('txt_emailaddress'),
                'phone':KDF.getVal('tel_phone_number'),
                'num_p_streetnumber':KDF.getVal('num_p_streetnumber'),
                'txt_p_streetname':KDF.getVal('txt_p_streetname'),
                'txt_p_town':KDF.getVal('txt_p_town'),
                'txt_p_postcode':KDF.getVal('txt_p_postcode'),
                'txt_p_uprn':KDF.getVal('txt_p_uprn')
        });
        
	//compare citizen details
        if ( (KDF.getVal('txt_firstnamePH') !== KDF.getVal('txt_firstname')) || (KDF.getVal('txt_lastnamePH') !== KDF.getVal('txt_lastname')) ) {
            name_before = KDF.getVal('txt_firstnamePH') + ' ' + KDF.getVal('txt_lastnamePH');
            name_after = KDF.getVal('txt_firstname') + ' ' + KDF.getVal('txt_lastname');
        } 
        
        if ( KDF.getVal('email') !== KDF.getVal('txt_emailaddress') ) {
            email_before = KDF.getVal('email');
            email_after = KDF.getVal('txt_emailaddress');
        } 
        
        if (editaddressflag === 1) {
            address_before = KDF.getVal('txt_fullstreetadd');
            address_after = KDF.getVal('txta_homeaddress_edit');
        }
        email_after = KDF.getVal('txt_emailaddress');
    	KDF.setVal('txt_caseid', KDF.kdf().saveresponse.caseid);
    	KDF.showSection('box_complete');
    }, 4000);
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

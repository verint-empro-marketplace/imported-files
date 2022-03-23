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
		KDF.showWidget('but_cust_info_update_address');

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

    $('#dform_' + form_name).off('click', '#dform_widget_button_but_back_create_individual').on('click', '#dform_widget_button_but_back_create_individual', function () {
        KDF.hidePage('create_individual_details');
        KDF.hidePage('create_individual_address');
    });

    $('#dform_' + form_name).off('click', '#dform_widget_button_but_back_customer_address').on('click', '#dform_widget_button_but_back_customer_address', function () {
        KDF.hidePage('provide_details_address');
    });

    $('#dform_' + form_name).off('click', '.copyaddressvalue').on('click', '.copyaddressvalue', function () {
        KDF.setVal('txt_p_uprn', KDF.getVal('txt_logic_uprn'));
        KDF.setVal('num_p_streetnumber', KDF.getVal('txt_logic_streetnumber'));
        KDF.setVal('txt_p_streetname', KDF.getVal('txt_logic_streetname'));
        KDF.setVal('txt_p_town', KDF.getVal('txt_logic_town'));
        KDF.setVal('txt_p_postcode', KDF.getVal('txt_logic_postcode'));
    });

    //manual enter address yd
    $('#dform_widget_button_but_update_address_manually').off('click').on('click', function () {
        manual_change_address = true;
        KDF.setVal('txt_p_uprn','');
        KDF.setVal('txt_cust_info_postcode','');
         
         KDF.setVal('txt_address_number_yd','');
         KDF.setVal('txt_street_name_yd','');
         KDF.setVal('txt_city_yd','');
         
         $("#dform_widget_txt_address_number_yd").attr("readonly", false);
         $("#dform_widget_txt_street_name_yd").attr("readonly", false);
         $("#dform_widget_txt_city_yd").attr("readonly", false);
         
         var options = document.getElementById("location-search-citizen_results").options;
         options[0].selected = true;
    }); 

    $('#dform_widget_button_but_next_update_yd').off('click').on('click', function () {
        KDF.gotoNextPage();
    });
	
    // Button "Continue" on Customer details - address page click event.
    $('#dform_widget_button_but_continue_customer_address').click(function () {
        if (KDF.kdf().access === 'agent' && custAddresssCheck() || custDetailsCheck()) {
            if (KDF.check('.dform_section_area_customer_details_address') === 0) {
                KDF.customdata('update-individual-new', individualTemplateIdentifier + 'create', true, true, {
					'customerID': KDF.getVal('txt_customer_id'),
					'txt_first_name': KDF.getVal('txt_firstname'),
					'txt_last_name': KDF.getVal('txt_lastname'),
					'phone': KDF.getVal('tel_contactnum'),
					'utilitiesID': KDF.getVal('utilities_id'),
					'num_p_streetnumber': KDF.getVal('num_p_streetnumber'),
					'txt_p_streetname': KDF.getVal('txt_p_streetname'),
					'txt_p_town': KDF.getVal('txt_p_town'),
					'txt_p_postcode': KDF.getVal('txt_p_postcode'),
					'txt_p_uprn': KDF.getVal('txt_p_uprn'),
					'email':KDF.getVal('eml_email')
				});
            }
        }
    
    });

    $('#dform_widget_cs_customer_search_resultholder').on('show', function () {
        KDF.showWidget('but_individual_not_found');
    });


    $('#dform_widget_cs_customer_search_resultholder').on('hide', function () {
        clearCustomerInformation();
        KDF.hideWidget('but_individual_not_found');
        KDF.hideWidget('but_cust_info_update_address');
        KDF.hideSection('area_customer_information');
        KDF.hideSection('area_your_details_next_updateaddress');
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

    // ps manual edit create customer
    $('#dform_widget_button_but_property_not_found').click(function () {
        $("#dform_widget_txt_c_addressnumber").attr("readonly", false);
        $("#dform_widget_txt_c_addressline1").attr("readonly", false);
        $("#dform_widget_txt_c_town").attr("readonly", false);
        $("#dform_widget_txt_c_postcode").attr("readonly", false);

        KDF.showWidget('txt_c_addressnumber');
        KDF.showWidget('txt_c_addressline1');
        KDF.showWidget('txt_c_town');

        KDF.hideWidget('bset_createindividualaddress_propnotfound');
    });

    $('#cancel_edit_manually_createindividual').click(function () {
        KDF.setVal('txt_c_addressnumber', KDF.getVal('txt_temp_streetnumber_createindividual'));
        KDF.setVal('txt_c_addressline1', KDF.getVal('txt_temp_streetname_createindividual'));
        KDF.setVal('txt_p_town', KDF.getVal('txt_temp_town_createindividual'));
        KDF.setVal('txt_c_postcode', KDF.getVal('txt_temp_postcode_createindividual'));

        $("#dform_widget_txt_c_addressnumber").attr("readonly", true);
        $("#dform_widget_txt_c_addressline1").attr("readonly", true);
        $("#dform_widget_txt_c_town").attr("readonly", true);
        $("#dform_widget_txt_c_postcode").attr("readonly", true);
        KDF.hideWidget('ahtm_cancel_edit_manual_createindividual');
        KDF.showWidget('but_property_notfound');

    });
    
    if (KDF.kdf().access === 'citizen') {

        KDF.showSection("area_yd_customer_details");
        KDF.showSection("bset_yd_edit");
        KDF.showSection("area_property_search_yd");
        KDF.showSection("area_yd_property_details");
        KDF.showWidget("but_next_update_yd");
    }
}//end do_KDF_Ready_Individual

function do_KDF_Custom_Individual(event, kdf, response, action) {	
	var isIndividualTemplate = false;
	
	if (response.actionedby.indexOf(individualTemplateIdentifier) === 0) {isIndividualTemplate = true;}
	
	if (isIndividualTemplate) {		
		var actionedBySource = response.actionedby.replace(individualTemplateIdentifier, '');
		
		if (action === 'person-retrieve-new' && actionedBySource === 'KDF_Ready') {
			KDF.showWidget('but_cust_info_update_address');
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
    
    //change button search again in customer search
    $('.dform_widget_search_closeresults').addClass('btn-gov-secondary').css("font-family", "Arial").text('Search again');
    $('#dform_widget_cs_customer_search_id').css("margin-right","0.75rem").css("width","80%");
    
    if (type === 'customer' && kdf.widgetresponse.actionedby === 'cs_customer_search') {
        create_customer_flow = false;
        
        KDF.setVal('txt_customer_id', id);
		//KDF.setVal('txta_cust_info_address', response["profile-Address"]);
        KDF.showWidget('but_cust_info_update_address');
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
        KDF.getVal('eml_email') !== KDF.getVal('txt_logic_email') || KDF.getVal('tel_contactnum') !== KDF.getVal('txt_logic_phone')) {
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
        
    KDF.showSection("txta_cust_info_address");
    KDF.showSection("area_yd_customer_details");
    KDF.showSection("area_yd_property_details");
    KDF.showWidget("bset_your_details_next_updateaddress");
    KDF.showWidget("bset_yd_edit");
    KDF.showWidget("but_next_update_yd");
    
}

function doCreateCustomerFlow(){
    create_customer_flow = true;
        
    showCustomerSearchYdWidgets();
    KDF.setVal('txt_customer_id','');
    
    KDF.setVal('txt_firstname','');
    KDF.setVal('txt_lastname','');
    KDF.setVal('eml_email','');
    KDF.setVal('txt_contact_number','');
    
    KDF.setVal('txt_address_number_yd','');
    KDF.setVal('txt_street_name_yd','');
    KDF.setVal('txt_city_yd','');
    
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
    KDF.setVal('txt_firstname', '');
    KDF.setVal('txt_lastname', '');
    KDF.setVal('eml_email', '');
    KDF.setVal('tel_contactnum', '');
    KDF.setVal('txta_cust_info_address', '');
    KDF.setVal('txt_cust_info_address_number', '');
	KDF.setVal('txt_cust_info_street', '');
	KDF.setVal('txt_cust_info_city', '');
}

function showWidgets (widgetArr){
    $.each(widgetArr, function( index, value ) {
        KDF.showWidget(value);
      });
}

function hideWidgets (widgetArr){
    $.each(widgetArr, function( index, value ) {
        KDF.hideWidget(value);
      });
}

function hideSections (sectionArr){
    $.each(sectionArr, function( index, value ) {
        KDF.hideSection(value);
      });
}

function showSections (sectionArr){
    $.each(sectionArr, function( index, value ) {
        KDF.showSection(value);
      });
}
/*END MANAGE INDIVIDUAL*/
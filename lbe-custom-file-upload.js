var formParams = {
	fileBlob: '',
	inputFileID: '$("#custom_fileupload_holder")',
	randomNumber: '',
	allowedFileType: '',
	maxFileSize: '4000000',
	maxFileSizeDisplay: '4000000',
	imgClickSelector: '',
	deleteFileSelector: '',
	kdfSaveFlag: false,
	full_classification: '',
	fileUploadUrl: 'https://cloudservices.form.beta.em.verintcloudservicesaws.com/api/private/attachfiles'
}

function do_KDF_Ready_Sharepoint (event, kdf) {

	formParams.fileUploadUrl = 'https://cloudservices.form.beta.em.verintcloudservicesaws.com/api/private/attachfiles'
	
     var template_name = KDF.getVal('txt_FT_template');	
     if (KDF.getVal('txt_FT_template') == '' || $('#dform_widget_txt_FT_template').length  < 1) {
			template_name = 'FT_template1';
	  	}
	 KDF.customdata('sharepoint_config', '', true, true, {
		            ft_operation : 'file_list',
		            txt_FT_template : template_name
		        })

    if((KDF.kdf().form.readonly && KDF.kdf().access == 'citizen') || (KDF.kdf().viewmode == 'R')){
		KDF.makeReadonly();
    	KDF.hideWidget('ahtm_custom_fileupload');
		KDF.showSection('area_file_view_mode');
    	 KDF.customdata('sharepoint_token', 'imitateKdfReady readonly', true, true, {});
    } else if (KDF.kdf().viewmode == 'U') {
		KDF.showWidget('ahtm_custom_fileupload');
		KDF.hideSection('area_file_view_mode');
    	 KDF.customdata('sharepoint_token', 'imitateKdfReady readonly', true, true, {});
	}

	var CustomFileUploadWidget=$('#custom_fileupload_holder');	
	$(document).on('drop dragover', function (e) {
				e.preventDefault();
			});
        $(document).on('change', '#custom_fileupload', function() {
		    var fileName = $("#custom_fileupload")[0].files[0].name;
		    var fileNameClean = fileName.split('.').pop();
		    var template_name = KDF.getVal('txt_FT_template');
		
           	 if (KDF.getVal('txt_FT_template') == '' || $('#dform_widget_txt_FT_template').length  < 1) {
			template_name = 'FT_template1';
	    	}
		        KDF.customdata('sharepoint_config', '', true, true, {
		            txt_FT_template: template_name,
		            txt_file_format: fileNameClean
		        })
		
       });

     $('body').on('click','img',function(){
		 if ( $(this).attr('class').includes('filename')){
			if(KDF.kdf().form.readonly){		 
				formParams.imgClickSelector = $(this).attr('class');
				KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
			}
		 }
	  })
	  
	   $('body').on('click','.delete_file',function(){		 
		 formParams.deleteFileSelector = $(this).closest('span').attr('id');
		 KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
		
	  })
	  
	  

}

function setFileBlobData (fileBlob){
            formParams.fileBlob = fileBlob;
        }


function processFile() {
             var fileError= false;
		    var fileName = $("#custom_fileupload")[0].files[0].name;
		    var fileNameClean = fileName.split('.').pop();
		    
		    if ( $("#custom_fileupload")[0].files[0].size <= formParams.maxFileSize) {
		    		fileError= false;
		    } else {
		    		fileError = true;
		    		KDF.showError('File size is too large');
		    }
		    
		    if (!fileError) {
		    	if (KDF.getVal('txt_filename_one') == ''){
		    			fileError = false;
		    	} else if (KDF.getVal('txt_filename_two') == '') {
		    			fileError = false;
		    	} else {
		    			fileError = true;
		    			KDF.showError('Maximum file upload has been reach');
		    	}
		    		
		    }
		    
		    if (!fileError) {
		    	if (KDF.getVal('txt_filename_one') == fileName){
		    			fileError = true;
		    	} else if (KDF.getVal('txt_filename_two') == fileName) {
		    			fileError = true;
		    	} else {
		    			fileError = false;
		    	}
		    	
		    	if (fileError) {
		    			KDF.showError('A file with this name already exists');
		    	}
		    		
		    }
		    
		    if (!fileError) {
		    	KDF.hideMessages();
                $(".dform_fileupload_progressbar").html("<div style='width: 0%;'>");
                var selector = formParams.inputFileID;
                
                $(".dform_fileupload_progressbar").html("<div style='width: 10%;'>");
		    	
		    	$("#custom_fileupload").prop('disabled', true);
		    	
                var reader = new FileReader();
                 reader.readAsArrayBuffer($("#custom_fileupload")[0].files[0]);
                  
                  reader.onloadend = function() {
                    setFileBlobData(reader.result);
                    
                    $(".dform_fileupload_progressbar").html("<div style='width: 30%;'>");
		    		
		    		if (!formParams.kdfSaveFlag) {
		    			
		    			KDF.save();
		    			document.getElementById("custom_fileupload_holder").focus();
		    		} else {
		    			KDF.customdata('sharepoint_token', 'imitateKdfReady', true, true, {});
		    		}
		    		
    
                  };
		    }
       	    
       }

function do_KDF_Custom_Sharepoint (response, action) {
        if (action === 'sharepoint_token') {
        	var access_token = response.data['access_token'];
        	if (!KDF.kdf().form.readonly && formParams.deleteFileSelector == '') {
				
				if (KDF.kdf().viewmode == 'U' && formParams.fileBlob == '') {
					if (KDF.getVal('txt_filename_one') !== ''){
					
						sharepointFileThumbnail (KDF.getVal('txt_sharepointID_one'), access_token, 'txt_filename_one')
					}
				
					if (KDF.getVal('txt_filename_two') !== ''){
						sharepointFileThumbnail (KDF.getVal('txt_sharepointID_two'), access_token, 'txt_filename_two')
					}
				} else if (formParams.fileBlob !== ''){
					
					if (!formParams.kdfSaveFlag) {
						formParams.kdfSaveFlag = true;
						formParams.full_classification = response.data['full_classification'];
					}
					
					sharepointFileUploader(access_token);
				}
				
                
        	} else if (!KDF.kdf().form.readonly && formParams.deleteFileSelector !== '') {
                deleteFile(access_token);
        	} 
			
			if (KDF.kdf().form.readonly && formParams.imgClickSelector == '') {
        		//sharepointFileThumbnail (itemID, access_token)
				if (KDF.getVal('txt_filename_one') !== ''){
					
					sharepointFileThumbnail (KDF.getVal('txt_sharepointID_one'), access_token, 'txt_filename_one')
				}
				
				if (KDF.getVal('txt_filename_two') !== ''){
					
					sharepointFileThumbnail (KDF.getVal('txt_sharepointID_two'), access_token, 'txt_filename_two')
				}
        	} else if (KDF.kdf().form.readonly && formParams.imgClickSelector !== '') {
				sharepointDownloadFile(access_token)
			}
        } else if (action == 'sharepoint_config') {
        	if (response.data['pass_status']) {
        	    if (response.data['pass_status'] == 'good'){
        	    	processFile();
        	    } else {
        	    	KDF.showError('Incorrect file type selected.')
        	    }
        	} else {
				var sharepoint_title = '';
				if ($('#dform_widget_txt_sharepoint_title').length > 0) {
						sharepoint_title = KDF.getVal('txt_sharepoint_title');
						console.log('asdf')
				} else {
						sharepoint_title = 'Please upload up to two photos of the problem';
						console.log('123')
				}
        		var txt_file_types = response.data['txt_file_types'];
        		formParams.allowedFileType = txt_file_types.replace(/'/g, '').replace('(','').replace(')','').replace(/,/g,', ');
        		formParams.maxFileSizeDisplay = response.data['txt_max_filesize'];

        			if($('#custom_fileupload_holder').length>0){

                        	var widget = '<div data-type="file" data-name="file_ootb" data-active="true" data-agentonly="false" class="file-progress lbe-file-gov">' + 
	                							'<div><label>'+ sharepoint_title + '</div></label>' +
	                						  '<div style="position: relative;"><input id="custom_fileupload" type="file" name="uploadedFile">' + 
	                						  '<span class="file-gov-icon"><span class="file-gov-icon-a"></span><span class="file-gov-icon-b"></span><label class="file-gov-text">Upload file</label></span>' +
	                						  '<div class="helptext">Image file types accepted are ' + formParams.allowedFileType +  ' up to ' + formParams.maxFileSizeDisplay + ' MB in size</div>' +
	                						'<div class="dform_fileupload_progressbar" id="custom_fileupload_progressbar"></div>'+
	                						 '<div class="filenames" id="custom_fileupload_files"></div><br><br></div>'+
	                					  ' </div>'	;
                
	                		$('#custom_fileupload_holder').html(widget);
	                }
        	}
        }
}

function do_KDF_Save_Sharepoint() {

    if (formParams.fileBlob !== '') {
		     $('#custom_fileupload').focus(); 
    }

	if (!formParams.kdfSaveFlag) {
		if (formParams.fileBlob !== '') {
		     $('#custom_fileupload').focus(); 
			$('#dform_successMessage').remove();
			//formParams.kdfSaveFlag = true;
			KDF.customdata('sharepoint_token', 'imitateKdfReady', true, true, {'SaveForm': 'true', 'caseid': KDF.kdf().form.caseid});
		}
	}
}

function sharepointFileUploader (access_token){
	KDF.lock();
	var fileName = $("#custom_fileupload")[0].files[0].name;
	var fileSize = $("#custom_fileupload")[0].files[0].size;

    var uploadURL = formParams.fileUploadUrl + 'root:/Verint/' + formParams.full_classification + '/' + KDF.kdf().form.caseid + '/' + fileName + ':/content';
    $(".dform_fileupload_progressbar").html("<div style='width: 50%;'>");
    $.ajax({
    	url: uploadURL, 
    	dataType: 'json',
		contentType: 'image/jpeg',
    	processData: false,
    	headers: {'Authorization': access_token, 'Content-Type': 'image/jpeg'},
    	data: formParams.fileBlob,
    	method: 'PUT',
    
    }).done(function(response) {
        sharepointFileThumbnail(response.id, access_token)
        $(".dform_fileupload_progressbar").html("<div style='width: 60%;'>");

        if(KDF.getVal('txt_sharepointID_one') == ''){
        	KDF.setVal('txt_sharepointID_one', response.id);
        	KDF.setVal('txt_filename_one', fileName);
			KDF.setVal('txt_sharepoint_link_one', response['webUrl']);
        } else {
        	KDF.setVal('txt_sharepointID_two', response.id);
        	KDF.setVal('txt_filename_two', fileName);
			KDF.setVal('txt_sharepoint_link_two', response['webUrl']);
        }
		
		KDF.save();
    });
	
	
}

function sharepointFileThumbnail (itemID, access_token, widgetName){
    var getThumbnailURL = formParams.fileUploadUrl + itemID + '/thumbnails';

    $.ajax({
    	url: getThumbnailURL, 
    	dataType: 'json',
    	headers: {Authorization: access_token},
    	method: 'GET',
    
    }).done(function(response) {		
		if (!KDF.kdf().form.readonly) {
			
			if (KDF.kdf().viewmode === 'U' && formParams.fileBlob == ''){
				
				if (widgetName == 'txt_filename_one') {
					KDF.setVal('txt_filename_one_thumb', response.value[0].medium['url']);
				} else if (widgetName == 'txt_filename_two') {
					KDF.setVal('txt_filename_two_thumb', response.value[0].medium['url']);
				}
		
				addFileContainer(widgetName);
			} else if (formParams.fileBlob !== ''){
				
				$(".dform_fileupload_progressbar").html("<div style='width: 60%;'>");
		
				if(KDF.getVal('txt_filename_one_thumb') == ''){
					KDF.setVal('txt_filename_one_thumb', response.value[0].medium['url']);
				} else {
					KDF.setVal('txt_filename_two_thumb', response.value[0].medium['url']);
				}
				$(".dform_fileupload_progressbar").html("<div style='width: 100%;'>");
				setTimeout(function(){ addFileContainer(); $(".dform_fileupload_progressbar").html("<div style='width: 0%;'>"); }, 1000);
			}
			
		} else if (KDF.kdf().form.readonly || KDF.kdf().viewmode == 'R') {
				var thumbnailUrl = response.value[0].medium['url'];
				var html;
		
				html =	'<div id="' + widgetName + '"style="float: left;">' +
				'<div style="margin-right: 10px"><img class="' + widgetName + '"src=' + thumbnailUrl + '></img></div><div>' + KDF.getVal(widgetName) + '</div></div>';
		
				setTimeout(function(){ $('#custom_fileupload_view').append(html)}, 1000);
		}
    });
	
	$("#custom_fileupload").prop('disabled', false);
	
	
}

function addFileContainer(widgetName) {
  $('input#custom_fileupload').val('');
  var fileName;
  var fileThumbnail;
  var widgetName;

  if (KDF.kdf().viewmode == 'U' && formParams.fileBlob == '') {
      fileName = KDF.getVal(widgetName);
      fileThumbnail = KDF.getVal(widgetName + '_thumb');
  } else if (formParams.fileBlob !== '') {
      if ($('.filenames .txt_filename_one').length < 1) {
          fileName = KDF.getVal('txt_filename_one');
          fileThumbnail = KDF.getVal('txt_filename_one_thumb');
          widgetName = 'txt_filename_one';
      } else if ($('.filenames .txt_filename_two').length < 1) {
          fileName = KDF.getVal('txt_filename_two');
          fileThumbnail = KDF.getVal('txt_filename_two_thumb');
          widgetName = 'txt_filename_two';
      }
  }

  $(".filenames").append('<span class="' + widgetName + '"> <span class="img_container"> <img id="img_' + widgetName + '" src=' + fileThumbnail + '><div>' + fileName + '<span id="delete_' + widgetName + '" style="font-weight:bold;" class="delete_file">4</span></div></span></span>');

  //$("#custom_fileupload").attr("value", "");

  KDF.unlock();
}


function sharepointDownloadFile(access_token) {
	var selector = formParams.imgClickSelector;
	var sharepointID;
	
	if (selector === 'txt_filename_one'){
		sharepointID = KDF.getVal('txt_sharepointID_one');
	} else {
		sharepointID = KDF.getVal('txt_sharepointID_two');
	}
	var getFileURL = formParams.fileUploadUrl + sharepointID + '/preview';
	
	$.ajax({
    url: getFileURL, 
    headers: {Authorization: access_token},
    type: 'POST'
	
	}).done(function(response) {
		
		window.open(response.getUrl);
	}).fail(function() {
		
	});
	
	formParams.imgClickSelector = '';
}

function deleteFile (access_token){
	 $(".dform_fileupload_progressbar").html("<div style='width: 0%;'>");
	
	var fileID;
	var selector = formParams.deleteFileSelector;
	
	if (formParams.deleteFileSelector.includes('one')) {
			fileID = KDF.getVal('txt_sharepointID_one')
	} else if (formParams.deleteFileSelector.includes('two')) {
			fileID = KDF.getVal('txt_sharepointID_two')
	}

    var deleteURL = formParams.fileUploadUrl + fileID;
	
    $.ajax({
    	url: deleteURL, 
    	processData: false,
    	headers: {'Authorization': access_token},
    	method: 'DELETE'
		
	}).done(function(response) {
		if (selector.includes('one')) {
			$('span.txt_filename_one').remove();
			KDF.setVal('txt_sharepointID_one', '')
			KDF.setVal('txt_filename_one', '')
			KDF.setVal('txt_filename_one_thumb', '')
			
		} else if (selector.includes('two')) {
			$('span.txt_filename_two').remove();
			KDF.setVal('txt_sharepointID_two', '')
			KDF.setVal('txt_filename_two', '')
			KDF.setVal('txt_filename_two_thumb', '')
		}
		
		KDF.save();
	}).fail(function() {
		KDF.showError('Delete file has failed, please try again');
	});
	
	formParams.deleteFileSelector = '';
}

function preventScroll() {
	
	var scrollPosition = [
        self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];
    
    var html = jQuery('html'); // it would make more sense to apply this to body, but IE7 won't have that
	html.data('scroll-position', scrollPosition);
	html.data('previous-overflow', html.css('overflow'));
	html.css('overflow', 'hidden');
	window.scrollTo(scrollPosition[0], scrollPosition[1]);
}

function allowScroll() {
	 var html = jQuery('html');
	 var scrollPosition = html.data('scroll-position');
	 html.css('overflow', html.data('previous-overflow'));
	if (scrollPosition !== undefined){
	 	window.scrollTo(scrollPosition[0], scrollPosition[1])
	}
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

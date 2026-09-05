$(document).ready(function(){

	initailizeSelect2();

	// Add new element
	$(document).on("click", ".tbr_add_disease", function () {

		// Finding total number of elements added
		var total_element = $(".tbr_disease_group").length;

		// last <div> with element class id
		var lastid = $(".tbr_disease_group:last").attr("id");
		var split_id = lastid.split("_");
		var nextindex = Number(split_id[1]) + 1;

		var max = 20;
			// Check total number elements

			if(total_element < max ){
			// Adding new div container after last occurance of element class
			$(".tbr_disease_group:last").after(
				'<div class="tbr_disease_group" id="element_'+ nextindex +'"></div>'
			);

			// Adding element to <div>
			$("#element_" + nextindex).append(
				'<div class="form-group mb-1">' +
					'<input type="text" name="disease_name[]" id="disease_name-'+ nextindex +'" class="form-control" spellcheck="false" placeholder="Nama Penyakit">' +
				'</div>' +
				'<div class="form-group">' +
					'<select class="form-control" id="disease_status-'+ nextindex +'" name="disease_status[]" placeholder="" tabindex="">' +
						'<option selected value="">Select</option>' +
						'<option value="sembuh">Sembuh</option>' +
						'<option value="masa perawatan">Masa Perawatan</option>' +
						'<option value="belum sembuh">Belum Sembuh</option>' +
					'</select>' +
				'</div>' +
				'<button type="button" anim="ripple" class="btn tbr_btn tbr_btn-light-danger p-0 remove" id="remove_'+ nextindex +'">' +
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
						'<g id="Layer_2" data-name="Layer 2" opacity="0.7">' +
							'<g id="close">' +
								'<rect id="Rectangle_1936" data-name="Rectangle 1936" width="24" height="24" transform="translate(24 24) rotate(180)" fill="#f64e60" opacity="0"/>' +
								'<path id="Path_751" data-name="Path 751" d="M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,1,0,1.42,1.42L12,13.41l4.29,4.3a1,1,0,1,0,1.42-1.42Z" fill="#f64e60"/>' +
							'</g>' +
						'</g>' +
					'</svg>' +
				'</button>'
			);
			initailizeSelect2();
		}
	});
});

// Initialize select2
function initailizeSelect2(){
	$("select").select2();
}

$(document).on('click','.remove', function(){

	var id = this.id;
	var split_id = id.split("_");
	var deleteindex = split_id[1];

	// Remove <div> with id
	$("#element_" + deleteindex).remove();
});
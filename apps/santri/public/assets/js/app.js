$(function () {
	/* ======================================
	* Button ripple
	====================================== */
	"use strict";
	[].map.call(document.querySelectorAll('[anim="ripple"]'), (el) => {
		el.addEventListener("click", (e) => {
			e = e.touches ? e.touches[0] : e;
			const r = el.getBoundingClientRect(),
				d = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2)) * 2;
			el.style.cssText = `--s: 0; --o: 1;`;
			el.offsetTop;
			el.style.cssText = `--t: 1; --o: 0; --d: ${d}; --x:${e.clientX - r.left}; --y:${
				e.clientY - r.top
			};`;
		});
	});

	/* ======================================
    * On scroll fixed header
    ====================================== */
	$(window).scroll(function () {
		var scroll = $(window).scrollTop();
		if (scroll) {
			$("html").addClass("tbr_header_fixed");
		} else {
			$("html").removeClass("tbr_header_fixed");
		}
	});

	/* ======================================
	* Back to top
	====================================== */
	var btn = $('#tbr_back_to_top');

	$(window).scroll(function() {
		if ($(window).scrollTop() > 300) {
			btn.addClass('show');
		} else {
			btn.removeClass('show');
		}
	});

	btn.on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop:0}, '300');
	});

	/* ======================================
    * Custom file input
    ====================================== */
	$(".custom-file-input").on("change", function () {
		let fileName = $(this).val().split("\\").pop();
		$(this).next(".custom-file-label").addClass("selected").html(fileName);
	});

	/* ======================================
	* Custom pnotify and sample toast
	====================================== */
	if (typeof PNotify != "undefined") {
		PNotify.prototype.options.styling = "fontawesome";
		$.extend(true, PNotify.prototype.options, {
			shadow: false,
		});
		$.extend(PNotify.styling.fontawesome, {
			container: "notification",
			notice: "notification-warning",
			info: "notification-info",
			success: "notification-success",
			error: "notification-danger",
			notice_icon: "fas fa-exclamation",
			info_icon: "fas fa-info",
			success_icon: "fas fa-check",
			error_icon: "fas fa-times",
		});
	}

	var stack_topleft = { dir1: "down", dir2: "left", push: "bottom", spacing1: 50, spacing2: 100 };
	var iconSuccess = "tbr_icon_success";
	var iconError = "tbr_icon_error";
	
	$("#custom-icon-primary").click(function () {
		var notice = new PNotify({
			title: "Berhasil",
			text: "Anda telah berhasil melakukan pendaftaran di haloterapi.",
			addclass: "notification-primary",
			icon: iconSuccess,
			type: "success",
			stack: stack_topleft,
			width: "348px",
			buttons: {
				sticker: false,
			},
		});
	});
	
	$("#custom-icon-error").click(function () {
		var notice = new PNotify({
			title: "Opss!",
			text: "Akun telah diblokir dari aplikasi ini dikarenakan melanggar ketentuan yang berlaku atau hal lainnya.",
			addclass: "notification-error",
			icon: iconError,
			type: "error",
			stack: stack_topleft,
			width: "348px",
			buttons: {
				sticker: false,
			},
		});
	});

	if (typeof(blocked) !== 'undefined' && blocked == "true") {
		new PNotify({
			title: "Opss!",
			text: "Akun telah diblokir dari aplikasi ini dikarenakan melanggar ketentuan yang berlaku atau hal lainnya.",
			addclass: "notification-error",
			icon: iconError,
			type: "error",
			stack: stack_topleft,
			width: "348px",
			buttons: {
				sticker: false,
			},
		});
	}

	if (typeof(sessionExpired) !== 'undefined' && sessionExpired == "true") {
		new PNotify({
			title: "Opss!",
			text: "Sesi Anda telah kedaluwarsa dikarenakan tidak ada aktivitas permintaan terhadap sistem.",
			addclass: "notification-error",
			icon: iconError,
			type: "error",
			stack: stack_topleft,
			width: "348px",
			buttons: {
				sticker: false,
			},
		});
	}
});
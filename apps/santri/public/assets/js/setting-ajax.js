function initAjax(className) {
    $('.' + className).on("submit", function (e) {
        const submitButton = $(this).find("button:submit");
        const invisibleText = $(this).find('.tbr_btn_text');
        const buttonText = submitButton.html();
        const redirect = $(this).attr('data-redirect');

        e.preventDefault();
        submitButton.prop("disabled", true);
        submitButton.append(
            `<div class="spinner-grow text-light" role="status"></div>`
        );
        invisibleText.addClass("tbr_invisible");
        
        $.ajax({
            url: this.action,
            type: this.method,
            data: new FormData($(this)[0]),
            contentType: false,
            processData: false,
        })
        .done(function (res) {
            var stack_topleft = {"dir1": "down", "dir2": "left", "push": "bottom", "spacing1": 50, "spacing2": 100};
            new PNotify({
                title: 'Berhasil',
                text: res?.message,
                addclass: 'notification-primary',
                icon: "tbr_icon_success",
                type: "success",
                stack: stack_topleft,
                width: "348px",
                buttons: {
                    sticker: false
                }
            });
            if (typeof redirect !== typeof undefined && redirect !== false) {
                setTimeout(function () {
                    window.location = redirect;
                }, 1000);
            } else {
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        })
        .fail(function (res) {
            let errorList = "";
            if (typeof (res.responseJSON?.errors) === 'object') {
                $.each(res.responseJSON?.errors, function (key, value) {
                    if (value.length > 1) {
                        $.each(value, function (key, value) {
                            errorList += value + "<br/>";
                        });
                    } else {
                        errorList += value + "<br/>";
                    }
                });
            } else {
                errorList += res.responseJSON?.message;
            }
            var stack_topleft = {"dir1": "down", "dir2": "left", "push": "bottom", "spacing1": 50, "spacing2": 100};
            new PNotify({
                title: "Gagal",
                text: errorList,
                addclass: 'notification-error',
                icon: "tbr_icon_error",
                type: "error",
                stack: stack_topleft,
                width: "348px",
                buttons: {
                    sticker: false
                }
            });
            submitButton.prop("disabled", false);
            submitButton.html(buttonText);
            if (res.responseJSON?.status === "session_expired") {
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        });
    });
}
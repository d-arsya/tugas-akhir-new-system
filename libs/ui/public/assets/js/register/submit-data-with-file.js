$(document).on("submit", ".main-form", function (e) {
    const submitButton = $(this).find("button:submit");
    const invisibleText = $(this).find('button:submit .tbr_btn_text');
    const buttonText = submitButton.html();
    const redirect = $(this).attr("data-redirect");

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
            window.location = res.redirect;
        })
        .fail(function (res) {
            $('.invalid-feedback').addClass("d-none");
            $.each(res.responseJSON?.errors, function (key, value) {
                $(`[name='${key}']`).addClass("is-invalid");
                $(`[data-name='${key}']`).removeClass("d-none");
                $(`[data-name='${key}']`).html(value);
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
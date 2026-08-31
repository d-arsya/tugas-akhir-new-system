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

    $(".summernote").each(function () {
        var summernote = $(this);
        if (summernote.summernote("isEmpty")) {
            summernote.val("");
        } else if (summernote.val() == "<p><br></p>") {
            summernote.val("");
        }
    });
    $.ajax({
        url: this.action,
        type: this.method,
        data: $(this).serialize(),
    })
        .done(function (res) {
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
            if (res.responseJSON?.status === "session_expired") {
                return window.location.reload();
            }

            $(".main-form").replaceWith(
                $(res.responseJSON?.view).find(".main-form")
            );
            $("select").select2();
            if ($(".datepicker").length) {
                $(".datepicker").datepicker({
                    format: "dd-mm-yyyy",
                    autoclose: true,
                    todayHighlight: true,
                    language: "id",
                    endDate: "0d",
                });
            }
            if (typeof initSummernote == "function") {
                initSummernote();
            }
        });
});
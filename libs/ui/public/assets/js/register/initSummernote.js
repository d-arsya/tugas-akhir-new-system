function initSummernote() {
    $(".summernote").summernote({
        styleWithSpan: false,
        minHeight: 120,
        toolbar: [
            ["style", ["style"]],
            ["font", ["bold", "italic", "underline", "clear"]],
            ["color", ["color"]],
            ["para", ["ul", "ol", "paragraph"]],
            ["table", ["table"]],
            ["insert", ["link"]],
            ["view", ["fullscreen", "codeview"]],
            ["help", ["help"]],
        ],
        callbacks: {
            onBlur: function () {
                $.ajax({
                    url: $(".main-form").data("session-url"),
                    type: "POST",
                    data: $(".main-form").serialize(),
                })
                    .done(function (res) {})
                    .fail(function (res) {
                        failedResponse(res);
                    });
            },
        },
    });
}

initSummernote();
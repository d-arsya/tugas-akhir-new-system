let typingTimer = 0;
const typingInterval = 1000;

$(document).on(
    "keyup",
    "input[type=text], input[type=number], input[type=email], textarea, input:not(.datepicker)",
    function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, typingInterval);
    }
);

$(document).on(
    "keydown",
    "input[type=text], input[type=number], input[type=email], textarea, input:not(.datepicker)",
    function () {
        clearTimeout(typingTimer);
    }
);

function doneTyping() {
    $.ajax({
        url: $(".main-form").data("session-url"),
        type: "POST",
        data: $(".main-form").serialize(),
    })
        .done(function (res) {})
        .fail(function (res) {
            failedResponse(res);
        });
}

$(document).on("change", ".datepicker", function (e) {
    setTimeout(() => {
        $.ajax({
            url: $(".main-form").data("session-url"),
            type: "POST",
            data: $(".main-form").serialize(),
        })
            .done(function (res) {})
            .fail(function (res) {
                failedResponse(res);
            });
    }, 500);
});

$(document).on("select2:select", "select", function () {
    $.ajax({
        url: $(".main-form").data("session-url"),
        type: "POST",
        data: $(".main-form").serialize(),
    })
        .done(function (res) {})
        .fail(function (res) {
            failedResponse(res);
        });
});

$(document).on("change", "input[type=radio]", function (e) {
    $.ajax({
        url: $(".main-form").data("session-url"),
        type: "POST",
        data: $(".main-form").serialize(),
    })
        .done(function (res) {})
        .fail(function (res) {
            failedResponse(res);
        });
});

$(document).on("click", "button.remove", function (e) {
    setTimeout(() => {
        $.ajax({
            url: $(".main-form").data("session-url"),
            type: "POST",
            data: $(".main-form").serialize(),
        })
            .done(function (res) {})
            .fail(function (res) {
                failedResponse(res);
            });
    }, 500);
});

$(document).on("click", ".tbr_add_disease", function () {
    setTimeout(() => {
        $.ajax({
            url: $(".main-form").data("session-url"),
            type: "POST",
            data: $(".main-form").serialize(),
        })
            .done(function (res) {})
            .fail(function (res) {
                failedResponse(res);
            });
    }, 500);
});

function failedResponse(res) {
    let errorList = "";
    if (typeof res.responseJSON?.errors === "object") {
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
    new PNotify({
        title: "Gagal!",
        text: errorList,
        icon: false,
        width: "340px",
        type: "error",
        animate_speed: "fast",
    });
    if (res.responseJSON?.status === "session_expired") {
        setTimeout(function () {
            window.location.reload();
        }, 1000);
    }
}
function initRegency(regencySelector, districtSelector) {
    $(document).on("change", regencySelector, function () {
        const regencyId = $(this).val();
        $.ajax({
            url: "/districts/" + regencyId,
            type: "GET",
        }).done(function (res) {
            if (res) {
                $(districtSelector).children().not(":first").remove();
                $.each(res, function (key, value) {
                    $(districtSelector)
                        .append('<option value="' + value['id'] + '">' + value['name'] + '</option>');
                });
            } else {
                $(districtSelector).children().not(":first").remove();
            }
        }).fail(function () {
            $(districtSelector).children().not(":first").remove();
        });
    });
}
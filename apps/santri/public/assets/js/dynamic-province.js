function initProvince(provinceSelector, regencySelector, districtSelector) {
    $(document).on("change", provinceSelector, function () {
        const provinceId = $(this).val();
        $.ajax({
            url: "/regencies/" + provinceId,
            type: "GET",
        }).done(function (res) {
            if (res) {
                $(regencySelector).children().not(":first").remove();
                $(districtSelector).children().not(":first").remove();
                $.each(res, function (key, value) {
                    $(regencySelector)
                        .append('<option value="' + value['id'] + '">' + value['name'] + '</option>');
                });
            } else {
                $(regencySelector).children().not(":first").remove();
            }
        }).fail(function () {
            $(regencySelector).children().not(":first").remove();
            $(districtSelector).children().not(":first").remove();
        });
    });
}
$("input:file").on("change", function () {
    const file = this.files[0];
    const fileSize = file.size / 1024 / 1024;
    const invalid = $(this).attr("name");

    if (fileSize > 2) {
        $(this).val("");
        $(this).addClass("is-invalid");

        $(`[data-name=${invalid}]`)
            .removeClass("d-none")
            .html("Foto maksimal berukuran 2 MB.");

        setTimeout(() => {
            $(this).next("label").text("Choose File");
        }, 500);
    } else {
        $(`[data-name=${invalid}]`)
            .addClass("d-none")
            .html("Foto maksimal berukuran 2 MB.");
    }
});
const persianConverter = {
    _persianNumbers: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],

    convert: function(str) {
        for(let i=0; i<10; i++) {
            str = str.replaceAll(i, this._persianNumbers[i]);
        }
        return str;
    }
};

jQuery(document).ready(function ($) {
    $("[data-persian-convertor]").map(function () {
        $(this).text(persianConverter.convert($(this).text()));
    });
});
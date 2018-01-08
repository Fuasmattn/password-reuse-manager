       $(document).ready(function() {
        $(".button-floating").click(function() {
            var $wrapper = $("#fab_wrapper");

            if (!$wrapper.hasClass("button-floating-clicked"))
            {
                $wrapper.attr("class", "center");
                $wrapper.toggleClass("button-floating-clicked-out");
            }

            $wrapper.toggleClass("button-floating-clicked");

            $(".button-sub").click(function() {
                       //TODO
                   });
        });
    });
       
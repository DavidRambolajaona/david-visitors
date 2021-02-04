
$("#btn-logout").on("click", function(e){
    e.preventDefault();
    var $thisBtn = $("#btn-logout");
    switchButtonLoader($thisBtn);

    // API logging out
    letsAjaxIt("/api/user/logout", "GET", {}, "json", function(r, s, e) {
        if (!e) {
            if (r.success) {
                $("#homeMainBtn").html(r.btn_signin);
                $("#info_visit").html(r.info_visit);
                $("#modal-user-info").modal("hide");
            }
            else {
                $("#text_info_user_info").text(getInfoMessage(r.code));
            }
        }
        else {
            $("#text_info_user_info").text(getInfoMessage("problem_ocuring"));
        }

        switchButtonLoader($thisBtn);
    });
    
});
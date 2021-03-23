
$("#btn-logout").on("click", function(e){
    e.preventDefault();
    var $thisBtn = $("#btn-logout");
    switchButtonLoader($thisBtn);

    // API logging out
    letsAjaxIt("/api/user/logout", "GET", {}, "json", function(r, s, e) {
        if (!e) {
            if (r.success) {
                $("#homeMainBtn").html(r.btn_signin);
                $(".dav-messages-input").html(r.message_input);
                $("#info_visit").html(r.info_visit);
                $("#modal-user-info").modal("hide");
                user = null;
                visitor_id = r.visitor_id;

                // My messages are not mine anylonger
                $(".dav-bloc-message.dav-msg-mine").addClass("dav-msg-others");
                $(".dav-bloc-message.dav-msg-mine").removeClass("dav-msg-mine");
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

$("#modal-user-info").on("show.bs.modal", function(e){
    $('body').addClass("dav-custom-bg-modal-user-info");
}).on('hide.bs.modal', function (e) {
    $('body').removeClass("dav-custom-bg-modal-user-info");
});
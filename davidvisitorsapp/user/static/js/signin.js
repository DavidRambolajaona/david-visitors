
function validateDataSignIn(data) {
    var isValid = true;
    var minPasswordLength = 6;

    // Pseudo
    if (data.hasOwnProperty("pseudo")) {
        if (data["pseudo"].trim().length == 0) {
            $("#modal-signin #form-signin input[name='pseudo']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signin #form-signin input[name='pseudo']").removeClass("is-invalid");
        }
    }

    // Password
    if (data.hasOwnProperty("password")) {
        if (data["password"].length < minPasswordLength) {
            $("#modal-signin #form-signin input[name='password']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signin #form-signin input[name='password']").removeClass("is-invalid");
        }
    }

    return isValid;
};

// Switch to sign up modal
$("#btn-switch-to-signup").on("click", function(e){
    e.preventDefault();
    $("#modal-signin").modal("hide");
    $("#modal-signup").modal({backdrop: 'static'});
});

$("#btn-ok-signin").on("click", function(e){
    e.preventDefault();
    var $thisBtn = $(this);
    switchButtonLoader($thisBtn);

    $("#text_info_signin").text("");

    var data = {};
    $("#modal-signin #form-signin input").each(function(){
        data[$(this).attr("name")] = $(this).val();
    });

    // Validating data
    if (validateDataSignIn(data)){
        letsAjaxIt("/api/user/check", "POST", data, "json", function(r, s, e) {
            if (!e) {
                if (r.success) {
                    $("#homeMainBtn").html(r.btn_user);
                    $(".dav-messages-input").html(r.message_input);
                    $("#modal-signin").modal("hide");
                    user = r.user;

                    // Restoring my messages
                    $(".dav-bloc-message[data-user-id='"+user.user_id+"']").addClass("dav-msg-mine");
                    $(".dav-bloc-message[data-user-id='"+user.user_id+"']").removeClass("dav-msg-others");
                }
                else {
                    $("#text_info_signin").text(getInfoMessage(r.code));
                }
            }
            else {
                $("#text_info_signin").text(getInfoMessage("problem_ocuring"));
            }

            switchButtonLoader($thisBtn);
        });
    }
    else {
        switchButtonLoader($thisBtn);
    }
    
});


$("#modal-signin").on("show.bs.modal", function(e){
    // $('#modal-signin').modal({backdrop: 'static'});
    cleanFormSignin();
    $('body').addClass("dav-custom-bg-modal-signin");
}).on('hide.bs.modal', function (e) {
    $('body').removeClass("dav-custom-bg-modal-signin");
});

$("body").on('keypress', '#modal-signin form input', function(e){
    if (e.which == 13) {
        $("#btn-ok-signin").click();
    }
});
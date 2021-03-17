
function validateDataSignIn(data) {
    var isValid = true;

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
        if (data["password"].length == 0) {
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
    $("#modal-signup").modal("show");
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
    cleanFormSignin();
});
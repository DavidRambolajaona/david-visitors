

function validateDataSignUp(data) {
    var isValid = true;

    // Pseudo
    if (data.hasOwnProperty("pseudo")) {
        if (data["pseudo"].trim().length == 0) {
            $("#modal-signup #form-signup input[name='pseudo']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signup #form-signup input[name='pseudo']").removeClass("is-invalid");
        }
    }

    // Email
    if (data.hasOwnProperty("email")) {
        var regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$");
        if (data["email"].trim().length != 0 && !regex.test(data["email"])) {
            $("#modal-signup #form-signup input[name='email']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signup #form-signup input[name='email']").removeClass("is-invalid");
        }
    }

    // Password
    if (data.hasOwnProperty("password")) {
        if (data["password"].length == 0) {
            $("#modal-signup #form-signup input[name='password']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signup #form-signup input[name='password']").removeClass("is-invalid");
        }
    }

    // Confirm password
    if (data.hasOwnProperty("confirm_password")) {
        var p = $("#modal-signup #form-signup input[name='password']").val();
        if (data["confirm_password"] != p) {
            $("#modal-signup #form-signup input[name='confirm_password']").addClass("is-invalid");
            isValid = false;
        }
        else {
            $("#modal-signup #form-signup input[name='confirm_password']").removeClass("is-invalid");
        }
    }

    return isValid;
};

// Switch to signin modal
$("#btn-switch-to-signin").on("click", function(e){
    e.preventDefault();
    $("#modal-signup").modal("hide");
    $("#modal-signin").modal("show");
});

$("#btn-create-account").on("click", function(e){
    e.preventDefault();
    var $thisBtn = $(this);
    switchButtonLoader($thisBtn);

    $("#text_info_signup").text("");

    var data = {};
    $("#modal-signup #form-signup input").each(function(){
        data[$(this).attr("name")] = $(this).val();
    });

    // Validating data
    if (validateDataSignUp(data)){
        letsAjaxIt("/api/user/create", "POST", data, "json", function(r, s, e) {
            if (!e) {
                if (r.success) {
                    $("#homeMainBtn").html(r.btn_user);
                    $("#modal-signup").modal("hide")
                }
                else {
                    $("#text_info_signup").text(getInfoMessage(r.code));
                }
            }
            else {
                $("#text_info_signup").text(getInfoMessage("problem_ocuring"));
            }

            switchButtonLoader($thisBtn);
        });
    }
    else {
        switchButtonLoader($thisBtn);
    }
    
});

$("#modal-signup").on("show.bs.modal", function(e){
    cleanFormSignup();
});
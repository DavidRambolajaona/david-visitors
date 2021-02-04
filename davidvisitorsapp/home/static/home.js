
const btnHomeSigninHtml = '<button type="button" class="btn btn-outline-dark" data-toggle="modal" data-target="#modal-signin">Sign in</button>';
var url_host = window.location.origin;


function letsAjaxIt(url="/", type="GET", data={}, datatype="json", cb=function(r,s,e){}) {
    $.ajax({
        url : url_host + url,
        type : type,
        data: data,
        dataType : datatype,
        success : function (res, statut){
            cb(res, statut, false);
        },
        error : function (res, statut){
            cb(res,statut, true);
        },
        complete : function (res, statut){
            
        }
    });
};

// Switch button loader
function switchButtonLoader($btn){
    if ($btn.attr("btn-loading") && $btn.attr("btn-loading") == "true") {
        $btn.attr("btn-loading", "false");
        $btn.html($btn.attr("btn-text"));
        $btn.removeAttr("disabled");
    }
    else {
        $btn.attr("btn-loading", "true");
        $btn.attr("btn-text", $btn.text());
        $btn.html($btn.text() + ' <span class="spinner-border spinner-border-sm"></span>');
        $btn.attr("disabled", "");
    }
};

function getInfoMessage(code = "") {
    switch (code) {
        case "pseudo_already_exists":
            return "The pseudo already exists. Try another one.";
            break;

        case "email_already_exists":
            return "The email address already exists. Try another one.";
            break;

        case "problem_connection":
            return "Check your network.";
            break;

        case "problem_ocuring":
            return "Oh... An error occured...";
            break;

        case "user_not_exist":
            return "That user doesn't exist... Maybe wrong pseudo/email or password.";
            break;
    
        default:
            return "Oups...";
            break;
    }
}

function cleanFormSignin() {
    $("#text_info_signin").text("");

    $("#pseudo_signin").val("");
    $("#pseudo_signin").removeClass("is-invalid");

    $("#password_signin").val("");
    $("#password_signin").removeClass("is-invalid");
}

function cleanFormSignup() {
    $("#text_info_signup").text("");

    $("#pseudo_signup").val("");
    $("#pseudo_signup").removeClass("is-invalid");

    $("#email_signup").val("");
    $("#email_signup").removeClass("is-invalid");

    $("#password_signup").val("");
    $("#password_signup").removeClass("is-invalid");

    $("#confirm_password_signup").val("");
    $("#confirm_password_signup").removeClass("is-invalid");
}
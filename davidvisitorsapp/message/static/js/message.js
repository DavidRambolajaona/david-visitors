var scrolled = false;

function updateScroll(){
    var element = document.getElementById("dav-messages-body");
    element.scrollTop = element.scrollHeight;
    scrolled = false;
}

function isScrolledIntoView(elem, container="#dav-messages-body")
{
    var docViewTop = $(container).scrollTop();
    var docViewBottom = docViewTop + $(container).height();

    var elemTop = $(elem).position().top + docViewTop;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function getMessageModeleHtml(userName="User", userId=0, msgText="Test", msgDate="Lun 01 Jan 2021, 07:00", msgTimestamp='', me=true, alreadySent=true, lastMsg=true) {
    var msgHtml = '<div class="dav-bloc-message '+ (me ? "dav-msg-mine" : "dav-msg-others") + ' ' + (alreadySent ? "" : "dav-msg-not-already-sent") + ' ' + (lastMsg ? "dav-last-msg" : "") +'" data-user-id="'+userId+'" data-timestamp="'+msgTimestamp+'">';
    msgHtml += '<div class="dav-msg-user-icon"></div>';
    msgHtml += '<div class="dav-msg-infos">';
    msgHtml += '<div class="dav-msg-user-name">'+userName+'</div>';
    msgHtml += '<div class="dav-msg-text">'+msgText+'</div>';
    msgHtml += '<div class="dav-msg-date d-none">'+msgDate+'</div>';
    msgHtml += '</div>';
    msgHtml += '</div>';

    return msgHtml;
}

updateScroll();

$("#dav-messages-body").on("scroll", function(e){
    if ($(".dav-last-msg").length > 0) {
        scrolled = !isScrolledIntoView(".dav-last-msg");
    }
});


$("body").on('keypress', '#message-text-input', function(e){
    if (e.which == 13) {
        $("#message-btn-send").click();
    }
});

$("body").on('click', '#message-btn-send', function(e){
    var msgVal = $("#message-text-input").val().trim();
    if (msgVal != '') {
        var userName = user.user_pseudo;
        var userId = user.user_id;
        var msgVal = msgVal;
        var msgDate = "Now";
        var msgTimestamp = Date.now();
        var me = true;
        var alreadySent = false;
        var lastMsg =false;

        var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent, lastMsg);

        var dataToSend = {
            "type": "send_message_from_client",
            "info": {
                "msg_val": msgVal,
                "msg_timestamp": msgTimestamp,
                "user_id": user.user_id
            }
        };

        socket.send(JSON.stringify(dataToSend));

        $("#dav-messages-body").append(msgHtml);
        $("#message-text-input").val('');
        updateScroll();
    }
});

socket.on('message', function(data){
    var data = JSON.parse(data);
    if (data.type && data.type == "send_message_broadcast_from_server") {
        var userName = data.info.user_name;
        var userId = data.info.user_id;
        var msgVal = data.info.msg_val;
        var msgDate = data.info.msg_date;
        var msgTimestamp = data.info.msg_timestamp;
        if (typeof user == "undefined" || user == null || (user && user.user_id != data.info.user_id)) {
            var me = false;
        }
        else {
            var me = true;
        }
        var alreadySent = true;
        var lastMsg = true;

        var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent, lastMsg);

        $(".dav-bloc-message.dav-last-msg").removeClass("dav-last-msg");

        if (user && data.info.user_id != user.user_id) {
            $("#dav-messages-body").append(msgHtml);
        }
        else {
            var $myMsgSent = $(".dav-bloc-message.dav-msg-mine[data-timestamp='"+data.info.msg_timestamp+"']");
            if ($myMsgSent.length > 0) {
                $myMsgSent.before(msgHtml);
                $myMsgSent.remove();
            }
            else {
                $("#dav-messages-body").append(msgHtml);
            }
        }
        if (!scrolled) {
            updateScroll();
        }
    }
});


$("body").on('click', '.dav-msg-text', function(e){
    e.preventDefault();
    if ($(this).parent().find(".dav-msg-date").hasClass("d-none")) {
        $(".dav-msg-date").addClass("d-none");
        $(this).parent().find(".dav-msg-date").toggleClass("d-none");
    }
    else {
        $(this).parent().find(".dav-msg-date").toggleClass("d-none");
    }
});
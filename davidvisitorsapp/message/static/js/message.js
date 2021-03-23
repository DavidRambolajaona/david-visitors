var scrolled = false;
var topMsgId = '';
var isTopMsg = false;
var searchingOldMessagesApi = false;

function updateScroll(targetElem=null){
    var element = document.getElementById("dav-messages-body");
    var toTop = 0;
    if (targetElem == null) {
        scrolled = false;
        toTop = element.scrollHeight;
    }
    else {
        var $target = $(targetElem);
        if ($target.length > 0) {
            var docViewTop = $("#dav-messages-body").scrollTop();
            var elemTop = $target.position().top + docViewTop;
            toTop = elemTop;
        }
        else {
            toTop = element.scrollHeight;
        }
    }
    element.scrollTop = toTop;
}

function isScrolledIntoView(elem, container="#dav-messages-body")
{
    var docViewTop = $(container).scrollTop();
    var docViewBottom = docViewTop + $(container).height();

    var elemTop = $(elem).position().top + docViewTop;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function getMessageModeleHtml(userName="User", userId=0, msgText="Test", msgDate="Lun 01 Jan 2021, 07:00", msgTimestamp='', me=true, alreadySent=true, lastMsg=true, msgId='', userBg="000000", userFg="FFFFFF") {
    var msgHtml = '<div class="dav-bloc-message '+ (me ? "dav-msg-mine" : "dav-msg-others") + ' ' + (alreadySent ? "" : "dav-msg-not-already-sent") + ' ' + (lastMsg ? "dav-last-msg" : "") +'" data-user-id="'+userId+'" data-timestamp="'+msgTimestamp+'" data-msg-id="'+msgId+'">';
    msgHtml += '<div class="dav-msg-user-icon" style="background: radial-gradient(circle, #'+userFg+' 0%, #'+userBg+' 100%);"></div>';
    msgHtml += '<div class="dav-msg-infos">';
    msgHtml += '<div class="dav-msg-user-name">'+userName+'</div>';
    msgHtml += '<div class="dav-msg-text">'+msgText+'</div>';
    msgHtml += '<div class="dav-msg-date d-none">'+msgDate+'</div>';
    msgHtml += '</div>';
    msgHtml += '</div>';

    return msgHtml;
}

function showLoaderOldMessages(show=true) {
    if (show) {
        var loaderHtml = '<div id="dav-loader-old-messages"><span class="spinner-border"></span></div>';
        $("#dav-messages-body").prepend(loaderHtml);
    }
    else {
        $("#dav-loader-old-messages").remove();
    }
}

function loadOldMessages(topMsgIdParam='', loadingPage=false) {
    searchingOldMessagesApi = true;
    if (!loadingPage) {
        showLoaderOldMessages();
    }
    letsAjaxIt("/api/message/messages", "GET", {"top_msg_id": topMsgIdParam}, "json", function(r, s, e) {
        showLoaderOldMessages(false);
        if (!e) {
            if (r.success) {
                isTopMsg = r.topMsg;
                var msgs = r.msgs;
                if (topMsgId) {
                    var topMsgSelector = ".dav-bloc-message[data-msg-id='"+topMsgId+"']";
                }
                else {
                    var topMsgSelector = null;
                }
                for (i in msgs) {
                    var msg = msgs[i];
                    var userName = msg.msg_user_name;
                    var userId = msg.msg_user_id;
                    var msgVal = msg.msg_text;
                    var msgDate = msg.msg_date;
                    var msgTimestamp = '';
                    if (typeof user == "undefined" || user == null || (user && user.user_id != msg.msg_user_id)) {
                        var me = false;
                    }
                    else {
                        var me = true;
                    }
                    var alreadySent = true;
                    var lastMsg = false;
                    var msgId = msg.msg_id;
                    var userBg = msg.msg_user_colors.split('.')[0];
                    var userFg = msg.msg_user_colors.split('.')[1];
    
                    var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent, lastMsg, msgId, userBg, userFg);
                    $("#dav-messages-body").prepend(msgHtml);
                    topMsgId = msgId;
                }
                $(".dav-bloc-message.dav-last-msg").removeClass("dav-last-msg");
                $(".dav-bloc-message").last().addClass("dav-last-msg");

                searchingOldMessagesApi = false;
                if (isTopMsg) {
                    var textTopMsgHtml = '<div id="dav-top-discussion-text">You are at the top of the chat</div>';
                    $("#dav-messages-body").prepend(textTopMsgHtml);
                }

                if (loadingPage) {
                    updateScroll();
        
                    readyLoadingMessages["message"] = true;
                    if (readyLoadingMessages["home"]) {
                        $("#dav-loading-messages").hide();
                    }
                }
                else {
                    updateScroll(topMsgSelector);
                }

                loadOldMessagesIfTopScroll(false);

            }
            else {
                searchingOldMessagesApi = false;
            }
        }
        else {
            searchingOldMessagesApi = false;
        }
    });
}

function loadOldMessagesIfTopScroll(loadingPage=false) {
    var scrollTop = $("#dav-messages-body").scrollTop();
    if (scrollTop < 1) {
        if (!isTopMsg) {
            if (!searchingOldMessagesApi) {
                loadOldMessages(topMsgId, loadingPage);
            }
        }
    }
}

updateScroll();

$("#dav-messages-body").on("scroll", function(e){
    if ($(".dav-last-msg").length > 0) {
        scrolled = !isScrolledIntoView(".dav-last-msg");
    }
    loadOldMessagesIfTopScroll(false);
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
        var userBg = user.user_colors.split('.')[0];
        var userFg = user.user_colors.split('.')[1];

        var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent, lastMsg, msgId='', userBg, userFg);

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
        var userBg = data.info.user_colors.split('.')[0];
        var userFg = data.info.user_colors.split('.')[1];

        var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent, lastMsg, msgId='', userBg, userFg);

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

// Getting messages
loadOldMessages('', true);
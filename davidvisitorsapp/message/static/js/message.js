var scrolled = false;

function updateScroll(){
    var element = document.getElementById("dav-messages-body");
    element.scrollTop = element.scrollHeight;
    scrolled = false;
}

function isScrolledIntoView(elem, container="dav-messages-body")
{
    var docViewTop = $(container).scrollTop();
    var docViewBottom = docViewTop + $(container).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function getMessageModeleHtml(userName="User", userId=0, msgText="Test", msgDate="Lun 01 Jan 2021, 07:00", msgTimestamp='', me=true, alreadySent=true) {
    var msgHtml = '<div class="dav-bloc-message '+ (me ? "dav-msg-mine" : "dav-msg-others") + ' ' + (alreadySent ? "" : "dav-msg-not-already-sent") +'" data-user-id="'+userId+'" data-timestamp="'+msgTimestamp+'">';
    msgHtml += '<div class="dav-msg-user-icon"></div>';
    msgHtml += '<div class="dav-msg-infos">';
    msgHtml += '<div class="dav-msg-user-name">'+userName+'</div>';
    msgHtml += '<div class="dav-msg-text">'+msgText+'</div>';
    msgHtml += '<div class="dav-msg-date">'+msgDate+'</div>';
    msgHtml += '</div>';
    msgHtml += '</div>';

    return msgHtml;
}

updateScroll();

$("#dav-messages-body").on("scroll", function(e){
    var element = document.getElementById("dav-messages-body");
    var s = "Top: " + element.scrollTop + " Height: " + element.scrollHeight;
    console.log(s);
    console.log(isScrolledIntoView(".dav-last-msg"));
});

$("#message-text-input").on("keypress", function(e){
    if (e.which == 13) {
        $("#message-btn-send").click();
    }
});

$("#message-btn-send").on("click", function(e){
    var msgVal = $("#message-text-input").val().trim();
    if (msgVal != '') {
        var userName = "David";
        var userId = 0;
        var msgVal = msgVal;
        var msgDate = "Lundi";
        var msgTimestamp = Date.now();
        var me = true;
        var alreadySent = false;

        var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent);

        var dataToSend = {
            "type": "send_message_from_client",
            "info": {
                "msg_val": msgVal,
                "msg_timestamp": msgTimestamp
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
        if (data.info.visitor_id != visitor_id) {
            var userName = data.info.user_name;
            var userId = data.info.user_id;
            var msgVal = data.info.msg_val;
            var msgDate = data.info.msg_date;
            var msgTimestamp = data.info.msg_timestamp;
            var me = false;
            var alreadySent = true;

            var msgHtml = getMessageModeleHtml(userName, userId, msgVal, msgDate, msgTimestamp, me, alreadySent);
            $("#dav-messages-body").append(msgHtml);
            updateScroll();
        }
        else {
            $(".dav-bloc-message.dav-msg-mine[data-timestamp='"+data.info.msg_timestamp+"']").removeClass("dav-msg-not-already-sent");
        }
    }
});
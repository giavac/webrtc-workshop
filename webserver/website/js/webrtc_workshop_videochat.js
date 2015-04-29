// Connection management
    var is_caller = true;
    var callerSDP = "";
    var calleeSDP = "";
    var caller_id = "";

    // Change this to the right websocket IP address:port
    var connection = new WebSocket('ws://111.11.11.11:8080');

    connection.onopen = function () {
        // connection is opened and ready to use
        console.log("WebSocket connection is open");
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
        console.log("An error happened: ", error);
    };

    connection.onmessage = function (message) {
        console.log("Received a message: \n", message.data);

        var rcvd_message = null
        try {
            rcvd_message = JSON.parse(message.data)
            if (rcvd_message && (rcvd_message['command'] == 'call')) {
                callerSDP = rcvd_message['SDP'];
                caller_id = rcvd_message['caller'];
                is_caller = false;
                if (confirm('Incoming call from ' + caller_id + '. Answer?')) {
                    // Get your own media & trigger the whole thing
                    runGetUserMedia();
                }
            }

            if (rcvd_message && (rcvd_message['command'] == 'answer')) {
                calleeSDP = rcvd_message['SDP'];
                rtcSessionDescription = new RTCSessionDescription();
                rtcSessionDescription.type = 'answer';
                rtcSessionDescription.sdp = calleeSDP;
                console.log("Setting remote description on caller, with SDP: \n", calleeSDP);
                myRTCPeerConnection.onaddstream = gotRemoteStream;
                myRTCPeerConnection.setRemoteDescription(rtcSessionDescription);
            }
        }
        catch(exception) {
//            console.log("Not a JSON message");
        }
    };






// Register and Call functions
var user_id = null;
var remote_id = null;

var registerButton = document.querySelector("button#registerButton");
registerButton.onclick = function() {
    console.log("Clicked on register");
    user_id = document.getElementById('user_id').value;
    console.log("user id: " + user_id);

    if (user_id && user_id != "") {
        request = {};
        request['command'] = 'register';
        request['user_id'] = user_id;
        connection.send(JSON.stringify(request));
    }
}

var callButton = document.querySelector("button#callButton");
callButton.onclick = function() {
    console.log("Clicked on Call");
    remote_id = document.getElementById('remote_id').value;
    console.log("remote id: " + remote_id);

    // Get your own media & trigger the whole thing
    runGetUserMedia();
}

function runGetUserMedia() {
    console.log("Running getUserMedia");

    // Select the right getUserMedia depending on browser
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Let's do video only
    var constraints = {audio: false, video: true};

    navigator.getUserMedia(constraints, successCallBack, errorCallBack);
}

function successCallBack(stream) {
    console.log("successCallBack");

    var myVideo = document.querySelector("video#myVideo");
    window.stream = stream;
    if (window.URL) {
        // Convert stream into Blob URL, for Chrome
        myVideo.src = window.URL.createObjectURL(stream);
    }
    else {
        myVideo.src = stream;
    }

    // Play the local video
    myVideo.play();

    myStream = stream;

    // Establish peer connection
    // If using Chrome
    if (navigator.webkitGetUserMedia) {
        RTCPeerConnection = webkitRTCPeerConnection;
    }
    // or using FF
    else if (navigator.mozGetUserMedia) {
        RTCPeerConnection = mozRTCPeerConnection;
        RTCSessionDescription = mozRTCSessionDescription;
        RTCIceCandidate = mozRTCIceCandidate;
    }

    var servers = null;

    if (is_caller) {
        // the caller
        myRTCPeerConnection = new RTCPeerConnection(servers);
        myRTCPeerConnection.onicecandidate = gotMyIceCandidate;
        myRTCPeerConnection.onaddstream = gotRemoteStream;
        myRTCPeerConnection.addStream(myStream);
    }
    else {
        // the callee
        myRTCPeerConnection = new RTCPeerConnection(servers);
        myRTCPeerConnection.addStream(myStream);
        myRTCPeerConnection.onicecandidate = gotTheirIceCandidate;
        myRTCPeerConnection.onaddstream = gotRemoteStream;
    }

    if (is_caller) {
        // Caller creates offer for callee
        myRTCPeerConnection.createOffer(gotMyDescription, onCreateOfferError);
    }
    else {
        //"type", optional and defaulting to null, of type RTCSdpType, that is "offer", "answer" or "pranswer".
        //"sdp", optional and defaulting to null, of type DOMString and containing a SDP message describing the session.
        console.log("callerSDP: ", callerSDP);

        rtcSessionDescription = new RTCSessionDescription();
        rtcSessionDescription.type = 'offer';
        rtcSessionDescription.sdp = callerSDP;
        myRTCPeerConnection.setRemoteDescription(rtcSessionDescription);
        myRTCPeerConnection.createAnswer(gotTheirDescription, onCreateAnswerError);
    }
}

function errorCallBack(error) {
    console.log("navigator.getUserMedia error: ", error);
}

function onCreateOfferError(error) {
    console.log("onCreateOfferError");
}

// This is the caller's session description, to be transmitted to the callee
function gotMyDescription(description) {
    console.log("gotMyDescription");
    myRTCPeerConnection.setLocalDescription(description);
}

function onCreateAnswerError(error) {
    console.log("onCreateAnswerError: ", error);
}

// This is the answer from the callee received by the caller
function gotTheirDescription(description) {
    console.log("gotTheirDescription");

    if (is_caller) {
        myRTCPeerConnection.setRemoteDescription(description);
    }
    else {
        myRTCPeerConnection.setLocalDescription(description);
    }
}

function gotRemoteStream(event) {
    console.log("gotRemoteStream");
    var remoteVideo = document.querySelector("video#remoteVideo");

    if (window.URL) {
        // Convert stream into Blob URL, for Chrome
        remoteVideo.src = window.URL.createObjectURL(event.stream);
    }
    else {
        remoteVideo.src = event.stream;
    }
}

function gotMyIceCandidate(event) {
    console.log("gotMyIceCandidate");

    if (event.candidate) {
        console.log("gotMyIceCandidate - new candidate");
        myRTCPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
    else {
        console.log("gotMyIceCandidate - end of candidates");
        // Time to send the call offer with SDP
        mySDP = myRTCPeerConnection.localDescription.sdp;
        console.log(mySDP);
        request = {};
        request['command'] = 'call';
        request['caller'] = user_id;
        request['callee'] = remote_id;
        request['SDP'] = mySDP;
        connection.send(JSON.stringify(request));
    }
}

function gotTheirIceCandidate(event) {
    console.log("gotTheirIceCandidate");

    if (event.candidate) {
        console.log("gotTheirIceCandidate - new candidate");
        myRTCPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
    else {
        console.log("gotTheirIceCandidate - end of candidates");
        // Time to send the call answer with SDP
        mySDP = myRTCPeerConnection.localDescription.sdp;
        console.log(mySDP);
        request = {};
        request['command'] = 'answer';
        request['caller'] = caller_id;
        request['SDP'] = mySDP;
        connection.send(JSON.stringify(request));
    }
}
//-------------------------



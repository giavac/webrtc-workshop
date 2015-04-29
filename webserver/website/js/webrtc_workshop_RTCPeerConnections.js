
function successCallBack(stream) {
    var myVideo = document.querySelector("video#myVideo");
    window.stream = stream;
    if (window.URL) {
        // Convert stream into Blob URL, for Chrome
        myVideo.src = window.URL.createObjectURL(stream);
    }
    else {
        myVideo.src = stream;
    }
    myVideo.play();

    myStream = stream;
}

function errorCallBack(error) {
    console.log("navigator.getUserMedia error: ", error);
}

function runGetUserMedia() {
    console.log("Running getUserMedia()");
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {audio: false, video: true};
    navigator.getUserMedia(constraints, successCallBack, errorCallBack);
}

var runGetUserMediaButton = document.querySelector("button#runGetUserMedia");
runGetUserMediaButton.onclick = function() {
    console.log("Clicked on runGetUserMedia()");
    runGetUserMedia();
};


var callButton = document.querySelector("button#callButton");
callButton.onclick = function() {
    console.log("Clicked on Call!");

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

    // the caller
    myRTCPeerConnection = new RTCPeerConnection(servers);
    myRTCPeerConnection.onicecandidate = gotMyIceCandidate;
    myRTCPeerConnection.addStream(myStream);

    // the callee
    theirRTCPeerConnection = new RTCPeerConnection(servers);
    theirRTCPeerConnection.onicecandidate = gotTheirIceCandidate;
    theirRTCPeerConnection.onaddstream = gotTheirStream;;

    // Caller creates offer for callee
    myRTCPeerConnection.createOffer(gotMyDescription, onCreateOfferError);
};

function onCreateOfferError(error) {
    console.log("onCreateOfferError");
}

// This is the caller's session description, to be transmitted to the callee
function gotMyDescription(description) {
    console.log("gotMyDescription");
    myRTCPeerConnection.setLocalDescription(description);

    // This simulates sending the caller's description to the callee
    theirRTCPeerConnection.setRemoteDescription(description);
    theirRTCPeerConnection.createAnswer(gotTheirDescription, onCreateAnswerError);
}

function onCreateAnswerError(error) {
    console.log("onCreateAnswerError");
}

// This is the answer from the callee received by the caller
function gotTheirDescription(description) {
    console.log("gotTheirDescription");
    theirRTCPeerConnection.setLocalDescription(description);

    myRTCPeerConnection.setRemoteDescription(description);
}

function gotTheirStream(event) {
    if (window.URL) {
        // Convert stream into Blob URL, for Chrome
        theirVideo.src = window.URL.createObjectURL(event.stream);
    }
    else {
        theirVideo.src = event.stream;
    }
}

function gotMyIceCandidate(event) {
    console.log("gotMyIceCandidate");
    if (event.candidate) {
        theirRTCPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        console.log("gotMyIceCandidate - new candidate");
    }
}

function gotTheirIceCandidate(event) {
    console.log("gotTheirIceCandidate");
    if (event.candidate) {
        myRTCPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        console.log("gotTheirIceCandidate - new candidate");
    }
}
//-------------------------




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

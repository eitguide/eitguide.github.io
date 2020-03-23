
var peer = null;
var lastPeerId = null;

console.log(peer);

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var idInput = document.getElementById('idUser');
var idInputConnect = document.getElementById('idConnectWith');

const mediaStreamConstraints = {
    video: true,
    audio: true,
};

var startCallButton = document.getElementById('startCallButton');
startCallButton.onclick = function() {
    makingCall();
};

function onCallListener() {
    console.log('onCallListener call');
    peer.on('call', function(call) {
        console.log('on call stream: ' + call);
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
            .then((mediaStream) => {
                localVideo.srcObject = mediaStream;

                call.on('stream', function(remoteStream) {
                    console.log('on stream remote info:' + remoteStream);
                    remoteVideo.srcObject = remoteStream;
                });

                call.answer(mediaStream);

                
            })
            .catch((error) => {
                console.log('Failed to get local stream' ,err);
            })
        }
    );
}

function makingCall() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(handleLocalStreamComming)
        .catch(handleLocalMediaStreamError);
}

function handleLocalStreamComming(mediaStream) {
    console.log(mediaStream);

    localVideo.srcObject = mediaStream;

    var connectWith = idInputConnect.value;
    console.log("Makig a call to: ", connectWith);

    var connectionMedia = peer.call(connectWith, mediaStream);

    connectionMedia.on('stream', function(remoteStream) {
        console.log('on stream comming:' + remoteStream);
        remoteVideo.srcObject = remoteStream;
    });

    connectionMedia.on('error', function(error) {
        console.log(err);
    })

    connectionMedia.on('close', function() {
        console.log("close on connectionMedia");
    })
}

function handleLocalMediaStreamError(error) {
    console.log(error);
}

function initialize() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
        secure: false,
        host: "24hschool.com",
        port: 9000,
        path: "/myapp",
        debug: 3,
        config: { 'iceServers': [
            {"urls": "stun:stun.l.google.com:19302"},
		{"urls": "stun:stun1.l.google.com:19302"},
		{"urls": "stun:stun2.l.google.com:19302"},
		{"urls": "stun:stun3.l.google.com:19302"},
		{"urls": "stun:stun4.l.google.com:19302"}
        ]
    }
    });

    peer.on('open', function (id) {
        if (peer.id === null) {
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        idInput.value = id;
        console.log('ID: ' + peer.id);
    });

    peer.on('disconnected', function () {
        status.innerHTML = "Connection lost. Please reconnect";
        console.log('Connection lost. Please reconnect');

        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });
    peer.on('close', function() {
        conn = null;
        status.innerHTML = "Connection destroyed. Please refresh";
        console.log('Connection destroyed');
    });
    peer.on('error', function (err) {
        console.log(err);
    });
};

initialize();
onCallListener();


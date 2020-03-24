
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

const ice = {
    iceServers: [{
        urls: [ "stun:ss-turn2.xirsys.com" ]
     }, {
        username: "62FEyM1TqTnr7vcYk3lj49LT2PRb92stiHPHJlec1P8891mdD02nFfu_eNdBOlI6AAAAAF55syxuZ2hpYW52OTU=",
        credential: "01a6b5f4-6d9f-11ea-8e0d-322c48b34491",
        urls: [
            "turn:ss-turn2.xirsys.com:80?transport=udp",
            "turn:ss-turn2.xirsys.com:3478?transport=udp",
            "turn:ss-turn2.xirsys.com:80?transport=tcp",
            "turn:ss-turn2.xirsys.com:3478?transport=tcp",
            "turns:ss-turn2.xirsys.com:443?transport=tcp",
            "turns:ss-turn2.xirsys.com:5349?transport=tcp"
        ]
     }]
};

function initialize() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
        key: 'peerjs',
        host: 'nghianvpeerjs.herokuapp.com',
        port: 443,
        secure: true,
        debug: 3,
        config: ice.iceServers,
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


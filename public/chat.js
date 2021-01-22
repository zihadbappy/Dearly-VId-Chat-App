var socket= io('/')
var divVideoChatLobby = document.getElementById("video-chat-lobby")
var divVideoChat = document.getElementById("video-chat-room")
var joinButton = document.getElementById("join")
var userVideo = document.getElementById("user-video")
var peerVideo = document.getElementById("peer-video")
var roomInput = document.getElementById("roomName")
var roomname= roomInput.value
var rtcPeerConnection
var userStream

const iceServers = {
    iceServers:[
        {urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:stun1.l.google.com:19302"}
    ]
}

userVideo.muted= "muted"
// var roomDiv = document.getElementById("room-div")
// roomDiv.style="display:none"
var creator=false

joinButton.addEventListener('click', function () {
    console.log('Room Name:', roomname)
    if (roomName == "") {
        alert("Please enter a room name")
    }
    else {
        socket.emit("join",roomname)
    }
})

socket.on("created",function(){
    creator=true
    navigator.getUserMedia(
        {
            audio: true,
            video:true 
            // { width: 1280, height: 720 }
        },
        function(stream) {
        divVideoChatLobby.style="display:none"
        // roomInput.value
        // roomDiv.style="visibility: visible"
        // console.log('room name',roomInput)
        console.log("got user media stream")
        userStream= stream
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e){
        userVideo.play()}
        },
        function() {
            alert("Couldn't acces User Media")
        }
    )
})

socket.on("joined",function(){
    creator=false
    navigator.getUserMedia(
        {
            audio: true,
            video:true 
            // { width: 1280, height: 720 }
        },
        function(stream) {
            divVideoChatLobby.style="display:none"
            // roomInput.value
            // roomDiv.style="visibility: visible"
            // console.log('room name',roomInput)
            userStream=stream
            userVideo.srcObject = stream
            userVideo.onloadedmetadata = function(e){
                userVideo.play()}
            socket.emit("ready",roomname)
            console.log("haha to you")
        },
            function() {
                alert("Couldn't acces User Media")
            }
            )

            
        })
        
        socket.on("full",function(){
            alert("The room is full. You cannot join now")
        })
        
        socket.on("ready",function(){ 
            console.log("haha to you 3")
            if(creator){
                rtcPeerConnection= new RTCPeerConnection(iceServers)
                rtcPeerConnection.onicecandidate= OnIceCandidateFunction
                rtcPeerConnection.ontrack = OnTrackFunction
                rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream)
                rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream)
                rtcPeerConnection.createOffer(function(offer){
                    socket.emit("offer", offer, roomname)
                 },function(error){
                    console.log(error)    
                })
            }

        })


            socket.on("candidate",function(){})
            socket.on("offer",function(){})
            socket.on("answer",function(){})


function OnIceCandidateFunction(event){
    if(event.onicecandidate){
        socket.emit("candidate",event.candidate,roomname)
    }
} 

function OnTrackFunction(event){
    peerVideo.srcObject = event.streams[0]
    peerVideo.onloadedmetadata = function(e){
    peerVideo.play()
    }
}

// Create a new PeerJS object, which will handle the connection
const peer = new Peer(); // Creates a new Peer instance
const buttton = document.getElementById("makeCallBtn");
const inputBox = document.getElementById("peerInputBox");
const peerIdDisplay = document.getElementById("displayPeerID");
// Once the peer object is created, it will provide a unique ID for this peer
peer.on("open", (id) => {
  peerIdDisplay.innerText = id;
  console.log("My peer ID is:", id); // Logs the unique ID generated for this peer
  // This ID can be shared with another peer to establish a connection
  // For example, you could store this ID in your database or send it to the other peer via signaling
});

// Function to initiate a call to another peer (pass the target peer ID)
function makeCall(peerId) {
  // Request access to the local media devices (camera & microphone)
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // Once access is granted, we get the video/audio stream
      const myVideo = document.getElementById("myVideo"); // Get the video element for local video
      myVideo.srcObject = stream; // Assign the stream to the local video element

      // Make a call to another peer by using the peer's ID and the stream
      const call = peer.call(peerId, stream);

      // When the peer responds with their stream, display it on the peer's video element
      call.on("stream", (peerStream) => {
        const peerVideo = document.getElementById("peerVideo"); // Get the video element for remote peer
        peerVideo.srcObject = peerStream; // Assign the incoming peer's stream to the video element
      });
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error); // If there's an error accessing camera/microphone
    });
}
buttton.addEventListener("click", () => {
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (videoDevices.length === 0) {
        return alert(
          "No camera found. Please make sure your camera is connected and permissions are granted."
        );
      }
      // Continue with accessing the video stream
    })
    .catch((error) => {
      return console.error("Error accessing devices:", error);
    });

  if (!inputBox.value) {
    return alert("Peer id is required");
  }
  makeCall(inputBox.value);
});
// Event listener for incoming calls from other peers
peer.on("call", (call) => {
  // When a call is received, answer it with the local stream (video/audio)
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // Answer the call by passing the local stream to it
      call.answer(stream);

      // When the peer responds with their media stream, display it
      call.on("stream", (peerStream) => {
        const peerVideo = document.getElementById("peerVideo");
        peerVideo.srcObject = peerStream; // Set the remote stream to the peer's video element
      });
    })
    .catch((error) => {
      console.error("Error answering the call:", error); // Handle any errors in accessing media
    });
});

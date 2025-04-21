// Create a new PeerJS object, which will handle the connection
const peer = new Peer(); // Creates a new Peer instance
const buttton = document.getElementById("makeCallBtn");
const inputBox = document.getElementById("peerInputBox");
const peerIdDisplay = document.getElementById("displayPeerID");

// Once the peer object is created, it will provide a unique ID for this peer
peer.on("open", (id) => {
  peerIdDisplay.innerText = id; // Display the unique ID on the page
});

// Function to initiate a call to another peer (pass the target peer ID)
function makeCall(peerId) {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      const myVideo = document.getElementById("myVideo"); 
      console.log(stream)
      myVideo.srcObject = stream;

      const call = peer.call(peerId, stream);
      call.on("stream", (peerStream) => {
        const peerVideo = document.getElementById("peerVideo"); 
        peerVideo.srcObject = peerStream;
      });

      // Handle call error
      call.on("error", (error) => {
        console.error("Call error: ", error);
        alert("Failed to establish call. Please try again.");
      });
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error); 
      alert(
        "Unable to access camera and microphone. Please check permissions."
      );
    });
}

// Click event to make the call
buttton.addEventListener("click", () => {
  if (!inputBox.value) {
    return alert("Peer ID is required");
  }

  // Check for available video devices before making the call
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
      makeCall(inputBox.value);
    })
    .catch((error) => {
      return console.error("Error accessing devices:", error);
    });
});

// Event listener for incoming calls from other peers
peer.on("call", (call) => {
  alert("Incoming call from: " + call.peer);


  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      console.log("Answering incoming call...");

      // Answer the call by passing the local stream to it
      call.answer(stream);

      // When the peer responds with their media stream, display it
      call.on("stream", (peerStream) => {
        const peerVideo = document.getElementById("peerVideo");
        const myVideo = document.getElementById("myVideo"); // Get the video element for local video
        myVideo.srcObject = stream;
        peerVideo.srcObject = peerStream; 
      });

      // Handle call error
      call.on("error", (error) => {
        console.error("Incoming call error: ", error);
        alert("Failed to answer the call. Please try again.");
      });
    })
    .catch((error) => {
      console.error("Error answering the call:", error); // Handle any errors in accessing media
      alert("Unable to answer the call. Please check permissions.");
    });
});

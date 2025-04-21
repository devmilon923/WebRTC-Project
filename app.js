// Create a new PeerJS object, which will handle the connection
const peer = new Peer(); // Creates a new Peer instance
const buttton = document.getElementById("makeCallBtn");
const inputBox = document.getElementById("peerInputBox");
const peerIdDisplay = document.getElementById("displayPeerID");

// Once the peer object is created, it will provide a unique ID for this peer
peer.on("open", (id) => {
  peerIdDisplay.innerText = id; // Display the unique ID on the page
  console.log("My peer ID is:", id); // Logs the unique ID generated for this peer
});

// Function to initiate a call to another peer (pass the target peer ID)
function makeCall(peerId) {
  // Request access to the local media devices (camera & microphone)
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // Once access is granted, we get the video/audio stream
      const myVideo = document.getElementById("myVideo"); // Get the video element for local video
      console.log(stream)
      myVideo.srcObject = stream; // Assign the stream to the local video element

      // Make a call to another peer by using the peer's ID and the stream
      const call = peer.call(peerId, stream);

      // When the peer responds with their stream, display it on the peer's video element
      call.on("stream", (peerStream) => {
        const peerVideo = document.getElementById("peerVideo"); // Get the video element for remote peer
        peerVideo.srcObject = peerStream; // Assign the incoming peer's stream to the video element
      });

      // Handle call error
      call.on("error", (error) => {
        console.error("Call error: ", error);
        alert("Failed to establish call. Please try again.");
      });
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error); // If there's an error accessing camera/microphone
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

  // console.log();

  // When a call is received, answer it with the local stream (video/audio)
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
        console.log(stream)
        myVideo.srcObject = stream; // Assign the stream to the local video 
        peerVideo.srcObject = peerStream; // Set the remote stream to the peer's video element
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

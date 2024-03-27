$(function () {
  const getAudioDevicesButton = document.getElementById("get-devices");
  const callButton = document.getElementById("call");
  const endCallButton = document.getElementById("end-call"); 
  const phoneNumberInput = document.getElementById("input");
  const statusArea = document.getElementById("status");
  

  let device;
  let accessToken;

  // Event Listeners

  window.addEventListener("load", startupClient);
  callButton.addEventListener("click", makeOutgoingCall);
  endCallButton.addEventListener("click", endCall);


  function log(message) {
    console.log(message);
    statusArea.innerHTML = message;
    
    setTimeout(function() {
      statusArea.innerHTML = '';
    }, 15000); 
  }
  
  function updateAllAudioDevices() {
    if (!device || !device.audio) {
      console.error('Device or audio not supported.');
      return;
    }
  }
  
  async function getAudioDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      updateAllAudioDevices.bind(device)();
    } catch (error) {
      console.error('Error accessing audio devices:', error);
    }
  }

  // SETUP STEP 1: Request an Access Token
  async function startupClient() {
    log("Requesting Access Token...");

    try {
      const { token, identity } = await $.getJSON("/token");
        console.log("Got a token");
        accessToken = token;
        initializeDevice();
    } catch (err) {
        console.log(err);
        log("An error occurred.");
    }
  }

  // SETUP STEP 2: Instantiate a new Twilio.Device and register
  function initializeDevice() {
    log("Starting the device");
    device = new Twilio.Device(accessToken, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"],
    });

    addDeviceListeners(device);
    
    device.register();
  }

  // SETUP STEP 3: Listen for Twilio.Device states
  function addDeviceListeners(device) {
    device.on("registered", function () {
        log("Device Ready to make and receive calls!");
    });

    device.on("error", function (error) {
        console.log("Device Error: " + error.message);
    });

    device.on("incoming", handleIncomingCall);

    device.audio.on("deviceChange", updateAllAudioDevices.bind(device));
  }
  
  let ongoingCall = false;

// Make an outgoing call
  async function makeOutgoingCall() {
    const params = {
          To: phoneNumberInput.value,
      };

      if (device) {
          log(`Calling ${params.To} ...`);
          ongoingCall = true;
          log(" Call Connected");

          try {
            const call = await device.connect({ params });
            log("Call in progress ...");
            disableCallButton(true);
            endCallButton.disabled = false;

          /*
            * add listeners to the Call
            * "accepted" means the call has finished connecting and the state is now "open" */

            call.on('accept', () => updateUIOutgoingCall(call, 'accepted'));
            call.on('disconnect', () => updateUIOutgoingCall(call, 'disconnected'));
            call.on('cancel', () => updateUIOutgoingCall(call, 'disconnected'));
            call.on('reject', () => updateUIOutgoingCall(call, 'disconnected'));

          // Handle end call button click
            endCallButton.onclick = () => {
              log("Hanging up ...");
              call.disconnect();
            };
          } catch (error) {
            console.log("Error making outgoing call: " + error.message);
          }
        } else {
          log("Device not initialized.");
        }
  }

  // Update UI when making outgoing calls
    function updateUIOutgoingCall(call, status) {
      if (status === 'accepted') {
        log('Call in progress ...');
        callButton.disabled = true;
      } else if (status === 'disconnected') {
        log('Call disconnected.');
        callButton.disabled = false;
      }
    }  

  // Handle incoming calls
    function handleIncomingCall(call) {
      console.log(`Incoming call from ${call.parameters.From}`);
      log = `Incoming call from ${call.parameters.From}. <button id="call"></button> <button id="end-call"></button>`;
  
    // Add event listeners to accept or reject the call
      document.getElementById("call").addEventListener("click", () => acceptIncomingCall(call));
      document.getElementById("end-call").addEventListener("click", () => rejectIncomingCall(call));
    }
    
  // Accept an incoming call
    function acceptIncomingCall(call) {
      call.accept();
      console.log("Accepted incoming call.");
      disableCallButton(true);
      endCallButton.disabled = false;
      log = "Call in progress ...";
      endCallButton.onclick = () => {
        log("Hanging up ...");
        call.disconnect();
      };
    }


  // Reject an incoming call
    function rejectIncomingCall(call) {
      if (ongoingCall) {
        call.reject();
        log("Call rejected.");
      } else {
        log("No incoming call to reject.");
      }
    }
    
  // End an ongoing call
    function endCall() {
      if (ongoingCall) {
        disableCallButton(false);
        endCallButton.disabled = true;
        log("Call ended.");
        setTimeout(() => {
          statusArea.innerHTML = "";
        }, 3000);
      } else {
        log("No ongoing call to end.");
      }
    }
    
  // Enable or disable the call button
    function disableCallButton(disable) {
      if (ongoingCall) {
        callButton.disabled = disable;
        if (disable) {
          console.log("Call button disabled.");
        } else {
          console.log("Call button enabled.");
        }
      } else {
        console.log("No ongoing call to disable the button.");
      }
    }

  // Handle click event for the call button
    callButton.onclick = (e) => {
      e.preventDefault();
      makeOutgoingCall();
    };

  // Handle click event for the get audio devices button

    getAudioDevicesButton.onclick = getAudioDevices;

});
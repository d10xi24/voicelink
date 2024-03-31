$(function () {
  let device;
  let accessToken;
  let identity;
  let ongoingCall = false;
  let endCallButtonEnabled = false;

  const callButton = document.getElementById("call");
  const endCallButton = document.getElementById("end-call");
  const phoneInput = document.getElementById("input");
  const status = document.getElementById("status");
  const Callduration = document.getElementById("timer");
  const updateAudioDevicesButton = document.getElementById("get-devices");

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    separateDialCode: true,
    utilsScript: "/utils.js",
  });

  iti.promise.then(function () {
    phoneInput.on("countrychange", function () {
      var selectedCountry = iti.getSelectedCountryData();
      var countryCode = selectedCountry.dialCode;
      iti.setNumber("+" + countryCode);
    });
  });

  callButton.addEventListener("click", function (e) {
    e.preventDefault();
    makeOutgoingCall();
  });

  endCallButton.addEventListener("click", endCall);
  updateAudioDevicesButton.onclick = updateAudioDevices;

  // Update the available ringtone and speaker devices

  function updateAudioDevices() {
    if (!device || !device.audio) {
      console.error("Device or audio not supported.");
      return;
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (_stream) {
          console.log("Microphone and speaker access granted.");
        })
        .catch(function (err) {
          console.error("Error accessing microphone and speaker:", err);
        });
    }
  }

  // Make an outgoing call
  async function makeOutgoingCall() {
    var params = {
      To: iti.getNumber(),
    };

    if (device) {
      status.innerHTML = `Calling ${params.To}`;

      try {
        const call = await device.connect({ params });

        call.on("accept", updateUIAcceptedOutgoingCall);
        call.on("disconnect", updateUIDisconnectedOutgoingCall);
        call.on("cancel", updateUIDisconnectedOutgoingCall);

        endCallButton.onclick = () => {
          call.disconnect();
          stopCallTimer();
        };
      } catch (error) {
        console.log("Error making outgoing call: " + error.message);
      }
    } else {
      status.innerHTML = "An error occurred";
    }
  }

  // Function to start the call timer
  async function startCallTimer(call) {
      ongoingCall = true;
      startTime = new Date().getTime();
      callTimerInterval = setInterval(updateCallDuration, 1000);
  }

  // Function to update the UI with call duration
  function updateCallDuration() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000);

    const formattedTime = new Date(seconds * 1000)
      .toISOString()
      .substring(11, 19);

      Callduration.innerHTML = `<h4>${formattedTime}</h4>`;
  }
  // Function to stop the call timer
  function stopCallTimer() {
    clearInterval(callTimerInterval);
    const callDuration = Callduration.innerHTML;
    Callduration.innerHTML = callDuration;
    setTimeout(() => {
      Callduration.innerHTML = "";
    }, 5000);
  }

  // Update UI when handling outgoing calls
  function updateUIAcceptedOutgoingCall(call) {
    status.innerHTML = "Call in progress...";
    setTimeout(() => {
    }, 3000);
    startCallTimer(call);
    callButton.disabled = true;
    bindVolumeIndicators(call);
  }

  function updateUIDisconnectedOutgoingCall() {
    callButton.disabled = false;
    status.innerHTML = "Call disconnected.";
  }

  // Handle incoming calls

  function handleIncomingCall(call) {
    console.log(`Incoming call from ${call.parameters.From}`);
    status.innerHTML = `Incoming call from ${call.parameters.From}.`;

    endCallButtonEnabled = true;

    document.getElementById("call").addEventListener("click", () => {
      call.accept();
      console.log("Accepted incoming call.");
      status.innerHTML = "Call Accepted";
      updateUIIncomingCall(call, "accepted");
    });

    document.getElementById("end-call").addEventListener("click", () => {
      if (ongoingCall) {
        call.reject();
        console.log("Rejected incoming call.");
        updateUIIncomingCall(call, "rejected");
      } else {
        status.innerHTML = "";
      }
    });
  }

  // Update UI when handling incoming calls
  function updateUIIncomingCall(call, status) {
    if (status === "accepted") {
      updateButtonStates(true);
      endCallButton.disabled = false;
      bindVolumeIndicators(true);
      startCallTimer();
      endCallButton.onclick = () => {
        call.disconnect();
      };
    } else if (status === "rejected") {
      status.innerHTML = "Call rejected.";
    } else if (status === "incoming") {
      incomingCallHangupButton.onclick = () => {
        hangupIncomingCall(call);
      };
    }
  }

  function hangupIncomingCall(call) {
    if (ongoingCall) {
      call.reject();
      status.innerHTML = "Call rejected";
    } else {
      status.innerHTML = "No incoming call to reject";
    }
  }

  // End an ongoing call
  function endCall() {
    if (ongoingCall) {
      stopCallTimer();
      updateButtonStates(false);
      endCallButton.disabled = true;
    } else {
      status.innerHTML = "No ongoing call to end.";
    }
  }

  // Enable or disable the call button and end call button based on ongoing call status
  function updateButtonStates(callOngoing) {
    if (callOngoing) {
      callButton.disabled = true;
      if (endCallButtonEnabled) {
        endCallButton.disabled = false;
      }
    } else {
      callButton.disabled = false;
      endCallButton.disabled = true;
    }
  }

  function bindVolumeIndicators(callOngoing) {
    const inputVolume = document.getElementById("input-volume");
    const outputVolume = document.getElementById("output-volume");

    if (callOngoing) {
      inputVolume.style.clipPath = "inset(0% 0 0 0)";
      inputVolume.style.webkitClipPath = "inset(0% 0 0 0)";
      inputVolume.style.animation = "level-animation 400ms alternate infinite";

      outputVolume.style.clipPath = "inset(0% 0 0 0)";
      outputVolume.style.webkitClipPath = "inset(0% 0 0 0)";
      outputVolume.style.animation = "level-animation 400ms alternate infinite";
    } else {
      inputVolume.style.clipPath = "inset(0 0 0 100%)";
      inputVolume.style.webkitClipPath = "inset(0 0 0 100%)";
      inputVolume.style.animation = "none";

      outputVolume.style.clipPath = "inset(0 0 0 100%)";
      outputVolume.style.webkitClipPath = "inset(0 0 0 100%)";
      outputVolume.style.animation = "none";
    }
  }

  // Function to cleanup and unregister the Twilio device
  function cleanupAndUnregisterDevice() {
    if (device) {
      device.disconnectAll();
      device.unregister();
    }
  }

  // Function to handle errors during startup and cleanup
  function handleStartupError(error) {
    console.error("An error occurred during startup:", error);
    cleanupAndUnregisterDevice();
    status.innerHTML = "Trying To reconnect to the server";
    device
      .register()
      .then(() => {
        status.innerHTML =
          "Device connected and Ready to make and receive calls";
      })
      .catch(() => {
        status.innerHTML =
          "Sorry, service is not available right now. Try again later";
      });
  }

  // Function to set client name in UI
  function setClientNameUI(clientName) {
    status.innerHTML = `Your client ID: <strong>${clientName}</strong>`;
    setTimeout(() => {
      status.innerHTML = "";
    }, 25000);
  }

  // Function to retrieve access token and initialize the Twilio Device with retry logic
  async function startupClient() {
    const maxRetries = 3;
    let retries = 0;

    function initialize() {
      status.innerHTML = "Requesting Access Token...";
      $.getJSON("/token")
        .then(({ token, identity: clientName }) => {
          console.log("Got a token");
          accessToken = token;
          identity = clientName;
          initializeDevice();
          setClientNameUI(identity);
          console.log("Your client ID:" + identity);
          updateAudioDevices();
        })
        .catch((error) => {
          console.error("An error occurred requesting access token:", error);
          retries++;
          if (retries < maxRetries) {
            console.log("Retrying access token request...");
            setTimeout(initialize, 1000);
          } else {
            console.error("Exceeded maximum number of access token retries.");
            status.innerHTML = "Failed to retrieve access token.";
          }
        });
    }

    initialize();
  }

  // Function to initialize the Twilio Device
  function initializeDevice() {
    status.innerHTML = "Starting the device";
    try {
      device = new Twilio.Device(accessToken, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"],
      });

      addDeviceListeners(device);
      device.register();
    } catch (error) {
      handleStartupError(error);
    }
  }

  // Function to add device listeners for Twilio Device
  function addDeviceListeners(device) {
    device.on("registered", function () {
      setClientNameUI(identity);
    });

    device.on("error", function (error) {
      console.log("Device Error: " + error.message);
    });

    device.on("incoming", handleIncomingCall);

    device.audio.on("deviceChange", updateAudioDevices.bind(device));
  }

  $(document).ready(function () {
    startupClient();
  });
});

$(function () {
  let device;
  let accessToken;
  let startTime;
  let callTimerInterval;
  let ongoingCall = false;
  let endCallButtonEnabled = false;
  let identity;
  let ClientphoneNumber;

  const inputVolume = document.getElementById("input-volume");
  const outputVolume = document.getElementById("output-volume");
  const callButton = document.getElementById("call");
  const endCallButton = document.getElementById("end-call");
  const phoneInput = document.getElementById("input");
  const statusArea = document.getElementById("status");
  const statusParagraph = document.getElementById("timer");
  const getAudioDevicesButton = document.getElementById("get-devices");
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    separateDialCode: true,
    utilsScript: "/utils.js",
  });

  iti.promise.then(function () {
    phoneInput.on("countrychange", function () {
      var selectedCountry = iti.getSelectedCountryData();
      var countryCode = selectedCountry.dialCode;
      phoneInput.val("+" + countryCode);
    });
  });

  callButton.addEventListener("click", function (e) {
    e.preventDefault();

    const selectedCountry = iti.getSelectedCountryData();
    const dialCode = selectedCountry ? selectedCountry.dialCode : "";
    const phoneNumber = phoneInput.value.trim();

    if (selectedCountry) {
      ClientphoneNumber = "+" + dialCode + phoneNumber;
    } else {
      ClientphoneNumber = phoneNumber;
    }
    makeOutgoingCall(iti, ClientphoneNumber);
  });

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

  async function getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    updateAudioDevices.bind(device);
  }

  // Function to start the call timer
  async function startCallTimer(call, status) {
    if (status === "accepted") {
      ongoingCall = true;
      startTime = new Date().getTime();
      callTimerInterval = setInterval(updateCallDuration, 1000);
    } else if (status === "disconnected") {
      console.log("Call is not in connected state. Timer will not start.");
    }
  }

  // Function to update the UI with call duration
  function updateCallDuration() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000);

    const formattedTime = new Date(seconds * 1000)
      .toISOString()
      .substring(11, 19);

    statusParagraph.innerHTML = `<h4>${formattedTime}</h4>`;
  }
  // Function to stop the call timer
  function stopCallTimer() {
    clearInterval(callTimerInterval);
    const callDuration = statusParagraph.innerHTML;
    statusParagraph.innerHTML = callDuration;
    setTimeout(() => {
      statusParagraph.innerHTML = "";
      statusArea.innerHTML = "";
    }, 5000);
  }

  // Make an outgoing call
  async function makeOutgoingCall() {
    var params = {
      To: phoneInput.value,
    };

    if (device) {
      statusArea.innerHTML = `Calling ${params.To}`;

      try {
        const call = await device.connect({ params });

        call.on("accept", updateUIAcceptedOutgoingCall);
        call.on("disconnect", updateUIDisconnectedOutgoingCall);
        call.on("cancel", updateUIDisconnectedOutgoingCall);

        endCallButton.onclick = () => {
          call.disconnect();
        };
      } catch (error) {
        console.log("Error making outgoing call: " + error.message);
      }
    } else {
      statusArea.innerHTML = "An error occurred";
    }
  }

  // Update UI when handling outgoing calls
  function updateUIAcceptedOutgoingCall(call) {
    statusArea.innerHTML = "Call in progress...";
    setTimeout(() => {
      statusArea.innerHTML = "";
    }, 3000);
    startCallTimer(call);
    callButton.disabled = true;
    bindVolumeIndicators(call);
  }

  function updateUIDisconnectedOutgoingCall() {
    callButton.disabled = false;
    statusArea.innerHTML = "Call disconnected.";
    setTimeout(() => {
      statusArea.innerHTML = "";
    }, 3000);
  }

  // Handle incoming calls

  function handleIncomingCall(call) {
    console.log(`Incoming call from ${call.parameters.From}`);
    statusArea.innerHTML = `Incoming call from ${call.parameters.From}.`;

    endCallButtonEnabled = true;

    document.getElementById("call").addEventListener("click", () => {
      call.accept();
      console.log("Accepted incoming call.");
      statusArea.innerHTML = "Call Accepted";
      updateUIIncomingCall(call, "accepted");
    });

    document.getElementById("end-call").addEventListener("click", () => {
      if (ongoingCall) {
        call.reject();
        console.log("Rejected incoming call.");
        updateUIIncomingCall(call, "rejected");
      } else {
        statusArea.innerHTML = "";
      }
    });
  }

  // Update UI when handling incoming calls
  function updateUIIncomingCall(call, status) {
    if (status === "accepted") {
      updateButtonStates(true);
      endCallButton.disabled = false;
      bindVolumeIndicators(true);
      startCallTimer(call);
      endCallButton.onclick = () => {
        call.disconnect();
        stopCallTimer();
      };
    } else if (status === "rejected") {
      statusArea.innerHTML = "Call rejected.";
      setTimeout(() => {
        statusArea.innerHTML = "";
      }, 3000);
    } else if (status === "incoming") {
      incomingCallHangupButton.onclick = () => {
        hangupIncomingCall(call);
      };
    }
  }

  function hangupIncomingCall(call) {
    if (ongoingCall) {
      call.reject();
      statusArea.innerHTML = "Call rejected";
      setTimeout(() => {
        statusArea.innerHTML = "";
      }, 3000);
    } else {
      statusArea.innerHTML = "No incoming call to reject";
    }
  }

  // End an ongoing call
  function endCall() {
    if (ongoingCall) {
      updateButtonStates(false);
      endCallButton.disabled = true;
      stopCallTimer();
    } else {
      statusArea.innerHTML = "No ongoing call to end.";
      setTimeout(() => {
        statusArea.innerHTML = "";
      }, 5000);
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
    statusArea.innerHTML = "Trying To reconnect to the server";
    device
      .register()
      .then(() => {
        statusArea.innerHTML =
          "Device connected and Ready to make and receive calls";
      })
      .catch(() => {
        statusArea.innerHTML =
          "Sorry, service is not available right now. Try again later";
      });
  }

  // Function to set client name in UI
  function setClientNameUI(clientName) {
    const div = document.getElementById("status");
    div.innerHTML = `Your client ID: <strong>${clientName}</strong>`;
    setTimeout(() => {
      div.innerHTML = "";
    }, 25000);
  }

  // Function to retrieve access token and initialize the Twilio Device
  async function startupClient() {
    statusArea.innerHTML = "Requesting Access Token...";

    try {
      const { token, identity: clientName } = await $.getJSON("/token");
      console.log("Got a token");
      accessToken = token;
      identity = clientName;
      initializeDevice();
      setClientNameUI(identity);
      console.log("Your client ID:" + identity);

      updateAudioDevices();
    } catch (err) {
      console.log(err);
      statusArea.innerHTML = "An error occurred starting the device.";
    }
  }

  // Function to initialize the Twilio Device
  function initializeDevice() {
    statusArea.innerHTML = "Starting the device";
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

  callButton.addEventListener("click", makeOutgoingCall);
  endCallButton.addEventListener("click", endCall);
  getAudioDevicesButton.onclick = getAudioDevices;
});

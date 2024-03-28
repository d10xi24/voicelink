$(function () {
  const callButton = document.getElementById("call");
  const endCallButton = document.getElementById("end-call");
  const phoneInput = document.getElementById("input");
  const statusArea = document.getElementById("status");
  const statusParagraph = document.getElementById("timer");
  const params = {
    To: phoneInput.value
  };

  let device;
  let accessToken;
  let startTime;
  let callTimerInterval;
  let ongoingCall = false;
  let endCallButtonEnabled = false;
  let identity;

  function updateAudioDevices() {
    if (!device || !device.audio) {
      console.error("Device or audio not supported.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        console.log('Microphone and speaker access granted.');
      })
      .catch(function (err) {
        console.error('Error accessing microphone and speaker:', err);
      });
  }

  // Function to start the call timer
  async function startCallTimer(call, status) {
    if (status === "accepted") {
      ongoingCall = true;
      startTime = new Date().getTime();
      callTimerInterval = setInterval(updateCallDuration, 1000);
    } else if (status === "disconnected") {
      console.log('Call is not in connected state. Timer will not start.');
    }
  }

  // Function to update the UI with call duration
  function updateCallDuration() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const seconds = Math.floor(elapsedTime / 1000);

    const formattedTime = new Date(seconds * 1000).toISOString().substring(11, 19);

    statusParagraph.innerHTML = `<h4>${formattedTime}</h4>`;
  }

  // Make an outgoing call
  async function makeOutgoingCall() {
    const input = phoneInput.value.trim();

    if (!input) {
      statusArea.innerHTML = "Please enter a phone number or client name.";
      return;
    }
    params.To = input;

    const selectedCountryData = iti.getSelectedCountryData();
    if (selectedCountryData && selectedCountryData.dialCode) {
      // Append country code to the phone number
      params.To = `+${selectedCountryData.dialCode}${params.To}`;
    }

    if (device) {
      ongoingCall = true;

      try {
        const call = await device.connect(params);
        updateButtonStates(true);
        endCallButton.disabled = false;

        call.on("accept", () => updateUIOutgoingCall(call, "accepted"));
        call.on("disconnect", () => updateUIOutgoingCall(call, "disconnected"));
        call.on("cancel", () => updateUIOutgoingCall(call, "disconnected"));
        call.on("reject", () => updateUIOutgoingCall(call, "disconnected"));

        endCallButton.onclick = () => {
          call.disconnect();
        };
      } catch (error) {
        console.log("Error making outgoing call: " + error.message);
        statusArea.innerHTML = "An error occurred while starting the Call";
      }
    } else {
      statusArea.innerHTML = "Reload this page: An error occurred while starting the device";
    }
  }

  // Update UI when handling outgoing calls
  function updateUIOutgoingCall(call, status) {
    if (status === "accepted") {
      updateButtonStates(true);
      statusArea.innerHTML = `Calling ${params.To}`;
      startCallTimer(call);
    } else if (status === "disconnected") {
      updateButtonStates(false);
      stopCallTimer();
    }
  }

  // Handle incoming calls
  function handleIncomingCall(call) {
    console.log(`Incoming call from ${call.parameters.From}`);
    statusArea.innerHTML = `Incoming call from ${call.parameters.From}.`;

    endCallButtonEnabled = true;
    updateButtonStates(true);

    document.getElementById("call").addEventListener("click", () => {
      call.accept();
      console.log("Accepted incoming call.");
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
      startCallTimer(call);
      endCallButton.onclick = () => {
        call.disconnect();
        stopCallTimer();
      };
    } else if (status === "rejected") {
      statusArea.innerHTML = "Call rejected.";
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
    }
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

  // Initialize the script when the document is loaded
  window.addEventListener("load", function () {
    // Retrieve the access token and initialize the Twilio Device
    startupClient();
  });

  phoneInput.value = '';

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    separateDialCode: true,
    utilsScript: "/utils.js"
  });

  iti.promise.then(function () {
    phoneInput.addEventListener("countrychange", function () {
      var selectedCountry = iti.getSelectedCountryData();
      var countryCode = selectedCountry.dialCode;
      phoneInput.value = '+' + countryCode;
    });
  });

  callButton.addEventListener("click", function (e) {
    e.preventDefault();

    const selectedCountry = iti.getSelectedCountryData();
    const dialCode = selectedCountry ? selectedCountry.dialCode : '';
    const phoneNumber = phoneInput.value.trim();

    if (phoneNumber === '') {
      console.error('Please enter a phone number');
      return;
    }
    let ClientphoneNumber;
    if (selectedCountry) {
      ClientphoneNumber = '+' + dialCode + phoneNumber;
    } else {
      ClientphoneNumber = phoneNumber;
    }
    makeOutgoingCall(iti, ClientphoneNumber);
  });


  // Event listener for the end call button click
  endCallButton.addEventListener("click", endCall);

  // Function to add device listeners for Twilio Device
  function addDeviceListeners(device) {
    device.on("registered", function () {
      setClientNameUI(identity);
    });
    setTimeout(() => {
      statusArea.innerHTML = '';
    }, 25000);

    device.on("error", function (error) {
      console.log("Device Error: " + error.message);
    });

    device.on("incoming", handleIncomingCall);

    device.audio.on("deviceChange", updateAudioDevices.bind(device));
  }

  // Function to initialize the Twilio Device
  function initializeDevice() {
    statusArea.innerHTML = "Starting the device";
    device = new Twilio.Device(accessToken, {
      logLevel: 1,
      codecPreferences: ["opus", "pcmu"],
    });

    addDeviceListeners(device);

    device.register();
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
      console.log('Your client ID:' + identity);
      
      updateAudioDevices();
    } catch (err) {
      console.log(err);
      statusArea.innerHTML = "An error occurred.";
    }
  }

  // Function to set client name in UI
  function setClientNameUI(clientName) {
    const div = document.getElementById('status');
    div.innerHTML = `Your client ID: <strong>${clientName}</strong>`;
  }

});

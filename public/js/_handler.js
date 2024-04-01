/*
 *      ____   ____      _                 __  _           __
 *     |_  _| |_  _|    (_)               [  |(_)         [  | _
 *       \\ \\   / /.--. __  .---.  .---.  | | __  _ .--.  |  / ]
 *        \\ \\ / / .'\\[  |/ /'\\ ] /__\\ | |[  |[  .-. | | ''<
 *         \\ ' /| \\__.|  || \\__.| \\__. | | | | | | | | | |'\ \
 *          \\_/  '.__.'[__]'.___.''.__.' [___|___|___||__|__|  \_] v1.0.1
 *
 *
 * MIT License
 *
 * Copyright (c) 2024 dion@levatine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

let condition = !endCallButton.disabled;

do {
  
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
    const inputVolume = document.getElementById("input-volume");
    const outputVolume = document.getElementById("output-volume");
  
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
  
    /**
     * The makeOutgoingCall function is called when the user clicks on the &quot;Call&quot; button.
     * It creates a new call object and connects it to the number specified in the input field.
     * The function also sets up event handlers for when an incoming call is accepted, disconnected, 
     * or canceled.
     *
     *
     * @return A call object
     */
    async function makeOutgoingCall() {
      var params = {
        To: iti.getNumber(),
      };
  
      if (device) {
        status.innerHTML = `Calling ${encodeForHTML(params.To)}`;
  
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
  
    /**
     * The encodeForHTML function takes a string and replaces all characters that have special meaning 
     * in HTML with their
     * corresponding HTML entities. For example, the less-than sign (&lt;) is replaced with &amp;lt;.
     * This prevents malicious users
     * from injecting JavaScript into your application by entering &lt;script&gt; tags in form fields,
     * for example.
     
     *
     * @param input Create a text content
     *
     * @return The inputted string with any special characters converted to html entities
     */
    function encodeForHTML(input) {
      const temp = document.createElement("div");
      temp.textContent = input;
      return temp.innerHTML;
    }
  
    /**
     * The startCallTimer function starts a timer that updates the call duration every second.
     * 
     */
    async function startCallTimer(call) {
      startTime = new Date().getTime();
      callTimerInterval = setInterval(updateCallDuration, 1000);
    }
  
    /**
     * The updateCallDuration function updates the call duration element with the current time.
     *
     * @return A formatted time
     */
    function updateCallDuration() {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - startTime;
      const seconds = Math.floor(elapsedTime / 1000);
  
      const formattedTime = new Date(seconds * 1000)
        .toISOString()
        .substring(11, 19);
  
      Callduration.innerHTML = `<h4>${formattedTime}</h4>`;
    }
  
    /**
     * The stopCallTimer function stops the call timer interval and sets the duration of the call to a variable.
     * It then displays that variable in an HTML element, and after 5 seconds it clears that element.
     
     *
     *
     * @return A call duration
     *
     */
    function stopCallTimer() {
      clearInterval(callTimerInterval);
      const callDuration = Callduration.innerHTML;
      Callduration.innerHTML = callDuration;
      setTimeout(() => {
        Callduration.innerHTML = "";
      }, 5000);
    }
  
    /**
     * The updateUIAcceptedOutgoingCall function updates the UI to reflect an outgoing call that has
     *  been accepted.
     * 
     *
     * @param call Get the call duration
     *
     * @return The status of the call,
     *
     */
    function updateUIAcceptedOutgoingCall(call) {
      status.innerHTML = "Call in progress...";
      startCallTimer(call);
      callButton.disabled = true;
      bindVolumeIndicators();
    }
  
    /**
     * The updateUIDisconnectedOutgoingCall function updates the UI when an outgoing call is 
     * disconnected.
     * It enables the call button, sets status to &quot;Call disconnected.&quot;, 
     * and stops the volume animation.
     *
     *
     * @return The callbutton
     *
     */
    function updateUIDisconnectedOutgoingCall() {
      callButton.disabled = false;
      status.innerHTML = "Call disconnected.";
      setTimeout(() => {
        status.innerHTML = "";
      }, 3000);
      stopCallTimer();
      stopVolumeAnimation();
    }
  
    /**
     * The handleIncomingCall function is called when a call comes in.
     * 
     * @param call Pass the call object to the function
     */
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
  
    /**
     * The updateUIIncomingCall function updates the UI when an incoming call is received.
     * 
     *
     * @param call Disconnect the call
     * @param status Determine what the ui should display
     *
     * @return The status of the call
     *
     */
    function updateUIIncomingCall(call, status) {
      if (status === "accepted") {
        callButton.disabled = true;
        endCallButton.disabled = false;
        bindVolumeIndicators();
        startCallTimer();
        endCallButton.onclick = () => {
          call.disconnect();
          stopCallTimer();
          stopVolumeAnimation();
        };
      } else if (status === "rejected") {
        status.innerHTML = "Call rejected.";
      } else if (status === "incoming") {
        endCallButton.onclick = () => {
          hangupIncomingCall(call);
        };
      }
    }
  
    /**
     * The hangupIncomingCall function hangs up an incoming call.
     * 
     *
     * @param call Identify the call that is being rejected
     *
     * @return Call
     *
     */
    function hangupIncomingCall(call) {
      call.reject();
      status.innerHTML = "Call rejected";
      setTimeout(() => {}, 3000);
    }
  
    function endCall() {
      /**
       * The endCall function ends an ongoing call.
       *
       * @return A promise that resolves to a call object
       */
      if (ongoingCall) {
        stopCallTimer();
        updateButtonStates(false);
        endCallButton.disabled = true;
        stopVolumeAnimation();
      } else {
        status.innerHTML = "No ongoing call to end.";
        setTimeout(() => {}, 3000);
      }
    }
  
    /**
     * The updateButtonStates function enables or disables the call and endCall buttons
     * depending on whether a call is ongoing.
     * 
     *
     * @param callOngoing Determine whether the call is ongoing or not
     *
     * @return A boolean value
     *
     */
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
  
  
    /**
     * The updateAudioDevices function is used to update the audio devices.
     *
     * @return A promise
     *
     */
    function updateAudioDevices() {
      if (!device || !device.audio) {
        console.error("Device or audio not supported.");
        return;
      } else {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(function () {
            console.log("Microphone and speaker access granted.");
          })
          .catch(function (err) {
            console.error("Error accessing microphone and speaker:", err);
          });
      }
    }
  
    /**
     * The bindVolumeIndicators function binds the volume indicators to the input and output volumes.
     * 
     * @return The inputvolume and outputvolume variables
     *
     */
    function bindVolumeIndicators() {
      inputVolume.style.clipPath = "inset(0% 0 0 0)";
      inputVolume.style.webkitClipPath = "inset(0% 0 0 0)";
      inputVolume.style.animation = "level-animation 400ms alternate infinite";
  
      outputVolume.style.clipPath = "inset(0% 0 0 0)";
      outputVolume.style.webkitClipPath = "inset(0% 0 0 0)";
      outputVolume.style.animation = "level-animation 400ms alternate infinite";
    }
  
    // Function to stop the volume animation
    function stopVolumeAnimation() {
      inputVolume.style.animation = "none";
      outputVolume.style.animation = "none";
    }
  
    /**
     * The setClientNameUI function sets the client name in the UI.
     * 
     *
     * @param clientName Set the text of the status element to &quot;your client id: &lt;strong&gt;${clientname}&lt;/strong&gt;&quot;
    
    /* 
        the settimeout function is used to call a function or evaluate an expression after a specified number of milliseconds
     *
     * @return A string with the client name
     *
     * @docauthor Trelent
     */
    function setClientNameUI(clientName) {
      status.innerHTML = `Your client ID: <strong>${clientName}</strong>`;
      setTimeout(() => {
        status.innerHTML = "";
      }, 25000);
    }
  
    /**
     * The startupClient function is called when the page loads.
     * It requests an access token from the server,
     * and then initializes Twilio's Device SDK with that token.
     *
     */
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
  
    /**
     * The initializeDevice function is called when the page loads. It creates a new Twilio Device object,
     * registers event listeners for that device, and then calls the register method on the device to
     * initiate registration with Twilio. The access token used to create this Device object is retrieved from
     * your server using an AJAX request in index.html (see lines 28-35). If there's an error creating or registering 
     * this Device instance, it will be handled by handleStartupError(). Otherwise, if successful we'll see log messages 
     * indicating that registration has succeeded and we're ready to make/re
     *
     *
     * @return A device object
     *
     * @docauthor Trelent
     */
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
  
    /**
     * The addDeviceListeners function adds event listeners to the device object.
     * 
     *
     * @param device Update the audio devices
     *
     * @return The device object
     *
     */
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
  
    /**
     * The cleanupAndUnregisterDevice function disconnects all clients from the device and unregisters it.
     * 
     *
     *
     * @return A promise
     *
     */
    function cleanupAndUnregisterDevice() {
      if (device) {
        device.disconnectAll();
        device.unregister();
      }
    }
  
    /**
     * The handleStartupError function is called when the device encounters an error during startup.
     * It cleans up and unregisters the device, then tries to register again.
     * If it fails, it displays a message to the user indicating that there was an error
     * connecting to Twilio's servers.
     *
     */
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
  
    $(document).ready(function () {
      startupClient();
    });
  });

} while (condition);
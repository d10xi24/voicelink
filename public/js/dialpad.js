$(document).ready(function() {
  var phoneInput = $("#input");
  
  phoneInput.val('');

  var iti = window.intlTelInput(phoneInput[0], {
    initialCountry: "auto",
    separateDialCode: true,
    utilsScript: "/utils.js" 
  });

  iti.promise.then(function() {
    phoneInput.on("countrychange", function() {
      var selectedCountry = iti.getSelectedCountryData();
      var countryCode = selectedCountry.dialCode;
      phoneInput.val('+' + countryCode);
    });
  });
  
  $('.digit').on('click', function() {
    var number = $(this).text().trim();
    var primaryDigit = number.charAt(0);
    phoneInput.val(phoneInput.val() + primaryDigit);
  });
});

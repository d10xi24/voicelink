$(function () {
  $(document).ready(function () {
    $(".digit").on("click", function () {
      var number = $(this).text().trim();
      var primaryDigit = number.charAt(0);
      $("#input").val($("#input").val() + primaryDigit);
    });
  });
});
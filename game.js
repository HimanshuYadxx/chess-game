let selectedPiece = null;

$(document).ready(function () {
  $(".gamecell").on("click", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      selectedPiece = null;
    } else if ($(this).html() !== "") {
      $(".gamecell").removeClass("selected");
      $(this).addClass("selected");
      selectedPiece = $(this);
    } else if (selectedPiece) {
      // Move the piece
      $(this).html(selectedPiece.html());
      selectedPiece.html("");
      $(".gamecell").removeClass("selected");
      selectedPiece = null;
    }
  });
});

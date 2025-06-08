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

$(document).ready(function () {
  const pieces = {
    1: '♖', 2: '♘', 3: '♗', 4: '♕', 5: '♔', 6: '♗', 7: '♘', 8: '♖',
  };

  // Place Black pieces (row 8 & 7)
  for (let i = 1; i <= 8; i++) {
    $(`#${i}_8`).html(`<span class="black">${pieces[i]}</span>`);
    $(`#${i}_7`).html(`<span class="black">♟</span>`);
  }

  // Place White pieces (row 1 & 2)
  for (let i = 1; i <= 8; i++) {
    $(`#${i}_1`).html(`<span class="white">${pieces[i]}</span>`);
    $(`#${i}_2`).html(`<span class="white">♙</span>`);
  }
});

var speed = 250;

function getScrollbarWidth() {
  var outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
  document.body.appendChild(outer);
  var widthNoScroll = outer.offsetWidth;
  outer.style.overflow = "scroll";
  var inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);        
  var widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  return widthNoScroll - widthWithScroll;
}


function openmodal(artic) {
  $("body").addClass("modal_active").css({"margin-right": getScrollbarWidth()});
  $(".modal_padding").css({"padding-right": getScrollbarWidth()});


  if ($(".modal.modal_active").length > 0) {
    
    $(".modal.modal_active").stop().animate({
      opacity: 0
    }, speed, function () {
      $(".modal.modal_active").removeClass("modal_active modal_absolute");
      $(artic).addClass("modal_active");

      $(artic).animate({
        opacity: 1
      }, speed);
    });


  } else {
    $(artic).addClass("modal_active");
    $(artic).animate({
      opacity: 1
    }, speed);
  }
}

function closemodal() {
  $(".modal").stop().animate({
    opacity: 0
  }, speed, function () {
    $(".modal, body").removeClass("modal_active");
    $("body").css({"margin-right" : "0px"});
    $(".modal_padding").removeAttr("style");
  });
}

$(document).ready(function () {

  $("body").on("click", "[data-modal-open]", function(e) {
    var getAttr = $(this).attr("data-modal-open");
    openmodal(getAttr);
    e.preventDefault();
  });
  
  $(".modal").each(function () {
    var getattr = $(this).attr("data-width");
    $(this).wrapInner("<div class='modal__wrap' style='max-width: "+getattr+";'></div>");
    $(this).find(".modal__wrap").prepend("<button class='modal__close'></button>");
  });

  $("body").on("click", ".modal__close", function (e) {
    closemodal();
    e.preventDefault();
  });

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      closemodal();
    }
  });
  
});


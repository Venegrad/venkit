import $ from "jquery";

class optResize {
  constructor() {
    this.throttle("resize", "optimizedResize");
    (function () {
      console.log(222);
      $("body").addClass("valera");
    });
  }

  throttle(type, name, obj) {
    obj = obj || window;
    let running = false;
    let func = function () {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function () {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  }
}

export { optResize };

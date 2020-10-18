import { header } from "./modules/header";
import { optResize } from "./modules/optimizedResize";
// import jquery from "jquery";
// window.jQuery = jquery;
// window.$ = jquery;

let rv = new optResize();

// handle event
window.addEventListener("optimizedResize", function () {
  console.log("Resource conscious resize callback!");
});

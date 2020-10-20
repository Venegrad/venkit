import { header } from "./modules/header";
import { optResize } from "./modules/optimizedResize";
import { tos } from "./modules/tos";

// import jquery from "jquery";
// window.jQuery = jquery;
// window.$ = jquery;

let rv = new optResize();
let v = new header();
let s = new tos();

// handle event
window.addEventListener("optimizedResize", function () {
  console.log("Resource conscious resize callback!");
});

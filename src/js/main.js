import { header } from "./modules/header";
import { optResize } from "./modules/optimizedResize";
import { tos } from "./modules/tos";
import $ from "jquery";

let rv = new optResize();
let v = new header();
let s = new tos();

// handle event
let c = window.addEventListener("optimizedResize", function () {
  console.log("Resource conscious resize callback!");
});

$(document).ready(function () {
  alert(1);
});

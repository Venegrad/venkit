import Vue from 'vue/dist/vue.js'
Vue.config.productionTip = false;
Vue.config.devtools = false;

import test from '../vue/test.vue'
Vue.component('test', test);

new Vue({
    el: "#mainapp",
    data() {
        return {
            
        }
    }
});

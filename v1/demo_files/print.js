// JavaScript Document

$(document).ready(function() {        
$("#PrintinPopup").click(function() {
    	printElem({ leaveOpen: true, printMode: 'popup', overrideElementCSS: ['include/css/print_style.css'] });
     });        
});

function printElem(options){$('.wrapper_wrap').printElement(options);}
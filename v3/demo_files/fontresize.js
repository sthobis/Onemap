//     JQuery Text resize + Cookie recall
//     Ben Hayes, January 2010 | info@jackfruitdesign.com
//     Based initially on a script from http://www.shopdev.co.uk/blog/text-resizing-with-jquery/
//     This script gives a simplified binary option: normal or large text

$(document).ready(function() {
		
	     // declare a few constants:
	     var SMALL = 12; //small font size in pixels
	     var LARGE = 16; //larger size in pixels
	     var COOKIE_NAME = "National Environment Agency9"; //Maybe give this the name of your site.

	     //make it small by default
	     var fontsize = SMALL; 

	     // Only show text resizing links if JS is enabled
	     $(".fontresize").show();

	     // if cookie exists set font size to saved value, otherwise create cookie
	     if($.cookie(COOKIE_NAME)) {
		     fontsize = $.cookie(COOKIE_NAME);
		     //set initial font size for this page view:
		     $(".r_bottom p").css("font-size", fontsize + "px");
		     //set up appropriate class on font resize link:
		     if(fontsize == SMALL) { $("#small").addClass("current"); }
		     else { $("#large").addClass("current"); }
	     } else {
		     $("#small").addClass("current");
		     $.cookie(COOKIE_NAME, fontsize);
	     }

	     // large font-size link:
	     $("#large").bind("click", function() {
			     if(fontsize == SMALL) {
			     fontsize = LARGE;
			     $(".r_bottom p").css("font-size", "14px");
				 $(".r_bottom p.text").css("font-size", "20px");
			     $("#large").toggleClass("current");
			     $("#small").toggleClass("current");
			     $.cookie(COOKIE_NAME, fontsize);
			     }
			     return false;	
			     });
	     
	     // small font-size link:
	     $("#small").bind("click", function() {
			     if(fontsize == LARGE) {
			     fontsize = SMALL;
			     $(".r_bottom p").css("font-size", "12px");
				 $(".r_bottom p.text").css("font-size", "18px");
			     $("#large").toggleClass("current");
			     $("#small").toggleClass("current");
			     $.cookie(COOKIE_NAME, fontsize);
			     }
			     return false;	
			     });
});

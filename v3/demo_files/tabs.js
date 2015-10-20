// JavaScript Document
$(document).ready(function(){
 $(".tab").hide();
            $("#colNav01 li:first a").addClass("active").show();
            $(".tab:first").show();
            $("#colNav01 a").click(function () {
                $("#colNav01 a").removeClass("active");
                $(this).addClass("active");
                $(".tab").hide();
                var activeTab = $(this).attr("href");
                $(activeTab).fadeIn();
                return false;
            });
			
 $(".tab2").hide();
            $("#colNav02 li:first a").addClass("active").show();
            $(".tab2:first").show();
            $("#colNav02 a").click(function () {
                $("#colNav02 a").removeClass("active");
                $(this).addClass("active");
                $(".tab2").hide();
                var activeTab = $(this).attr("href");
                $(activeTab).fadeIn();
                return false;
            });
 })
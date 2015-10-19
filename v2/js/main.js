// ready
$( document ).ready(function() {

	// UI Interaction
	var myUI = new XtrOnemap.UIComponents();

	// initialize ui component
	myUI.init();
});

function switchTab(target) {

	if (target == 1) {
		$('#breakdown-info').css('display','none');
		$('#basic-info').css('display','block');
	}
	else {
		$('#breakdown-info').css('display','block');
		$('#basic-info').css('display','none');
	}
}
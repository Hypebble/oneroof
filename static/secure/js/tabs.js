$(function(){
	console.log('!clicked!');
	$(".sidebar-btn").click(function(){
		var value = this.classList[1];
		$(".tabs>div").hide();
		$("#" + value).show();
	});
});
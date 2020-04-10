document.createElement('header');
document.createElement('footer');
document.createElement('section');
document.createElement('aside');
document.createElement('nav');
document.createElement('article');

var ipad=$.jPlayer.platform.ipad;
var android=$.jPlayer.platform.android;
var tablet=$.jPlayer.platform.tablet;
var mobile=$.jPlayer.platform.mobile;
var ie=$.browser.msie;

$(document).ready(function() {
	if (tablet || mobile)
	{
		$("#drag_menu").hide()
		$("#fsbutton").hide()
		fullscreenInterno()
	}
	else
	{
		if (ie)
		{
			$("#fsbutton").hide()
		}
		$("#menu_laterale").resizable({
			minWidth: 262,
			maxWidth: 1000,
			handles: "e, w",
			start: function (event, ui) {
				resizeIframe(1);
			},
			stop: function(event, ui) {
				resizeIframe(0);
				resizeCompleto();
			}
		});
		
	}
	resizeCompleto()
})

$(window).resize(function () {
	resizeCompleto()
});

function resizeCompleto()
{
	resizetitle();
	resizeh1()
	resizeContent()
	scrollbar();
	spostaHandle();
	hidemenu_button();
	fullscreen_button();
	if (asset!== null && asset.dd!==undefined)
	{
		asset.dd.resize();
	}
	if ($("#asset_consegna").length>0)
	{
		ct=$("#asset_consegna").outerHeight(true);
		$("#container").css("top", ct+"px")
	}
}

function spostaHandle()
{
	os=$("#menu_attivita").outerWidth(true)
	$("#drag_menu").css("left", os+"px");
}

function scrollbar()
{
	//$('#player_contenuto').jScrollPane();
	$('#menu_attivita').jScrollPane();
}

function resizetitle()
{
	$("#titolo_asset").css("top", parseInt( (70-$("#titolo_asset").height())/2 )+"px")
}
function resizeh1()
{
	$("#testata_player").css("padding-top", parseInt( (60-$("h1").height())/2 )+"px");
}

function resizeContent()
{
	os=$("#menu_laterale").offset()

	if (os.left<0)
	{
		$("#content_asset").css("left", "0px");
	}
	else
	{
		$("#content_asset").css("left", $("#menu_laterale").outerWidth()+"px");
	}
	$(".iframeplayer").css("top", $("#asset_consegna").outerHeight(true)+"px");
	$(".iframeplayer").css("height", $("#player_contenuto").outerHeight(true)-$("#asset_consegna").outerHeight(true)+"px")
}

function fullscreenInterno()
{
	var optu={"direction":"up", "distance": 10};
	var optl={"direction":"left"};
	durani=400;
	if ($('body').hasClass('player-full'))
	{
		$('body').removeClass('player-full');
		cl=$("#menu_laterale").outerWidth();
		ct=$("#filetto_top").outerHeight(true)+$("#testata_player").height();
		$("#menu_laterale").animate( { left:0 }, durani);
		$("#testata_player").show("slide",{"direction":"up"}, durani);
		$("#filetto_top").animate( { top: $("#testata_player").height() }, { duration:durani});
		$("#content_player").animate( { top: ct }, durani);
		$("#fsbutton").animate( { top: 20 }, durani);
		$("#help").animate( {right: 17}, durani);
		$("#content_asset").animate( { left: cl }, durani, function() { resizeCompleto() });
	}
	else
	{
		$('body').addClass('player-full');
		
		cl=$("#menu_laterale").outerWidth()*-1;
		$("#menu_laterale").animate( { left: cl }, durani);
		//$("#testata_player").hide("slide",{"direction":"up"}, durani);
		//$("#filetto_top").animate( { top: 0 }, durani);
		
		$("#filetto_top").animate( { top: $("#testata_player").height() }, { duration:durani});
		ct=$("#filetto_top").outerHeight(true);
		
		$("#content_player").animate( { top: 72 },durani);
		$("#fsbutton").animate( { top: 35 }, durani);
		$("#help").animate( {right: 57}, durani);
		$("#content_asset").animate( { left: 0 }, durani, function() { resizeCompleto() });
	}

}

function hidemenu_button()
{
	if ($('body').hasClass('player-full'))
	{
		$("#bottone_full").removeClass('aperto');
		$("#bottone_full").addClass('chiuso');
	}
	else
	{
		$("#bottone_full").removeClass('chiuso');
		$("#bottone_full").addClass('aperto');
	}
}



function openFullScreen() {
	var fsElement = document.getElementById('player');
	
	if(checkfs())
	{
		window.fullScreenApi.cancelFullScreen(fsElement);
		//fsElement.mozCancelFullScreen();
	}
	else
	{
		window.fullScreenApi.requestFullScreen(fsElement);
		fsElement.webkitRequestFullScreen(fsElement.ALLOW_KEYBOARD_INPUT);
		//fsElement.mozRequestFullScreen();
	}
	setTimeout("resizeCompleto();", 1500);
}

function fullscreen_button()
{
	if (checkfs())
	{
		$("#fsbutton").removeClass('openScreen');
		$("#fsbutton").addClass('closeScreen');
	}
	else
	{
		$("#fsbutton").removeClass('closeScreen');
		$("#fsbutton").addClass('openScreen');
	}
}

function checkfs()
{
	if ( (document.fullScreenElement!=undefined) || document.mozFullScreenElement || document.webkitIsFullScreen)
	{
		return true;
	}
	else
	{
		return false;
	}
}


function resizeIframe(v)
{
	if (v)
	{
		$("#player_contenuto").animate( { width: "69%", marginLeft: "29%" },200);
	}
	else
	{
		$("#player_contenuto").animate( { width: "100%", marginLeft: "0" },200);
		$("#menu_laterale").css("height", "100%");
	}
}
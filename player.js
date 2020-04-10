/*
 * COPYRIGHT 2016 - Francesco Leonetti - www.espertoweb.it
 * e' vietato l'utilizzo non autorizzato di questo codice
 * tutti i diritti riservati
 */
var asset=null;
var punteggio_lezione=0;
var punteggio_max_lezione=0;
var indice_asset=0;
var asset_fatti=0;
var asset_totale=0;
var lezioneid=0;
var percentuale=0;
var ie=$.browser.msie;
var ie8=false;

var dd;

var risp_utente='';

var overlay;

var pagine_viste=new Array();

var pConferma='';
var pRiprova='';
var pSoluzioni='';
var pRiepilogo='';
	

		
if (typeof tema == "undefined") var tema='';
if (typeof max_tentativi == "undefined") var max_tentativi=1000;
if (typeof min_tentativi == "undefined") var min_tentativi=2;
if (typeof show_score == "undefined") var show_score=1;
if (typeof global_tracking == "undefined") var global_tracking=1;
if (typeof riepilogo == "undefined") var riepilogo=1;
if (typeof scorm=="undefined") var scorm=0;


if (ie)
{
	if ($.browser.version.match(/^8\./) || $.browser.version.match(/^7\./) || $.browser.version.match(/^6\./) )
	{
		ie8=true;
	}
}

$(document).ready(function()
{
	if (lang=='it') {
	pConferma='Conferma';
	pRiprova='Riprova';
	pSoluzioni='Soluzioni';
	pRiepilogo='Riepilogo';
	
	} else {
	pConferma='Submit';
	pRiprova='Retry';
	pSoluzioni='Solutions';	
	pRiepilogo='Summary';		
	};

	prev_wHeight = $(window).height();
	prev_wWidth = $(window).width();
    
	$('#soluzioni').after('<div id="pagina_riepilogo"></div>');
	
	jQuery('#soluzioni').dialog({
		autoOpen: false,
		width: 700,
		height:450,
		position:'center',
		open: function(event, ui) { $('.ui-widget-overlay').bind('click', function(){ $("#soluzioni").dialog('close'); }); },
		show:'drop'
	});
	
	jQuery('#pagina_riepilogo').dialog({
		autoOpen: false,
		width: 700,
		height:450,
		position:'center',
		open: function(event, ui) { $('.ui-widget-overlay').bind('click', function(){ $("#pagina_riepilogo").dialog('close'); }); },
		show:'drop'
	});
	
	if (titolo_lezione!='') {
		jQuery('#titolo_lezione').html(titolo_lezione);
		jQuery('#testata_player h1').html(titolo_lezione);
		
	} 
	
	punteggio_max_lezione=calcolaMax();
	
	if (1*punteggio_max_lezione>0 && global_tracking) {
		jQuery('#cont_punteggio').show();
	} else {
		jQuery('#cont_punteggio').hide();
	}
	
	if (1*punteggio_max_lezione>0 && riepilogo) {
		$('#menu_attivita li:last').after('<li id="riepilogo"><a href="javascript:void(0);" onclick="paginaRiepilogo();"><i class="icon-file"></i><span>'+pRiepilogo+'</span></a></li>');
	}

	asset_totale=assets.length;
	
	
	
	if (scorm) loadPage();
	
	caricaStatoIniziale();
	
	playAsset();

});

$(window).unload(function() {	
	
	if (scorm) unloadPage();
					
});

function caricaStatoIniziale() {
	
 	for (var i=0,ilen=assets.length;i<ilen;i++) {
		assets[i].tentativi=0;
		assets[i].fatto=0;
		assets[i].punteggio=0;
		assets[i].testo0=assets[i].testo;
		assets[i].rispostautente='';
	}
 	
 	if (scorm) {
 		var suspend_data=unescape(doLMSGetValue( "cmi.suspend_data" ));
 		var s=suspend_data.split('^');
 		punteggio_lezione=1*doLMSGetValue("cmi.core.score.raw");
 		if (!1*punteggio_lezione) punteggio_lezione=0;
 		
 		for (var i=0,ilen=s.length;i<ilen;i++) {
 			var p=s[i].split('|||');
 			assets[i].fatto=p[0];
 			assets[i].rispostautente=p[1];
 			assets[i].punteggio=p[2];
 			assets[i].rispostagiusta=p[3];
 			
 			if (assets[i].fatto=='1') {
 				assets[i].tentativi=1;
 				asset_fatti++;
 				jQuery('#sco_'+assets[i].id).addClass('checked');
 				if (assets[i].tipo==4||assets[i].tipo==5) {
 					asset=assets[i];
 					assets[i].testo=replaceFields(assets[i].testo,0);
 				}
 			}
 		}
 		console.log(assets);
 		asset=assets[0];
 		progressioneLezione();
 	}
	
}

function sottoMenuPlayer(n){
	
	if ($(".sezione"+n).hasClass("etiaperta")) 
	{
		$(".sezione"+n).hide('slow', function() { scrollbar() }); 
		$(".sezione"+n).removeClass("etiaperta");
		$(".sezione"+n).addClass("etichiusa"); 
		
		$(".lista"+n).addClass("img_off"); 
		$(".lista"+n).removeClass("img_on");
		
	}
	else 
	{
		$(".sezione"+n).show('slow', function() { scrollbar() });
		$(".sezione"+n).removeClass("etichiusa");
		$(".sezione"+n).addClass("etiaperta");
		
		$(".lista"+n).removeClass("img_off"); 
		$(".lista"+n).addClass("img_on");
		
	}
	//setTimeout("$('#player .menu-left .list-menu').jScrollPane()",1000);
}

function progressioneLezione() {
	
	if (asset.fatto=='1') {
		jQuery('#sco_'+asset.id).addClass('checked');
	} else {
		jQuery('#sco_'+asset.id).removeClass('checked');
	}
	
	if (1*punteggio_max_lezione > 0 && global_tracking) {
		jQuery('#tot_punteggio').html(punteggio_lezione+' / '+punteggio_max_lezione);
		if (1*punteggio_max_lezione>0) {
			var p=Math.floor(100*((1*punteggio_lezione)/(1*punteggio_max_lezione)));
			jQuery('#filetto_barra_punteggio').width( p+'%' );
			jQuery('#tot_punteggio').append(' - '+p+'%' );
			percentuale = p;
		}
	} 
	
	if (1*asset_totale>0 && global_tracking) {
		var p=Math.floor(100*((1*asset_fatti)/(1*asset_totale)));
		jQuery('#filetto_punteggio').width( p+'%' );
	}
	
	
}


function calcolaMax() {
	var pmax=0;
	for (var i=0,ilen=assets.length;i<ilen;i++) {
		
		if (!isNaN(1*assets[i].punteggio_max))
			pmax+=1*assets[i].punteggio_max;
		
		
	}
	return pmax;
}

function goPreviousAsset() {
	
	var salta=true;
	while (salta && indice_asset>0 ) {
		indice_asset--;
		if (!assets[indice_asset].hasOwnProperty('indice')||assets[indice_asset].indice==1) salta=false; 	
	}
	scoid=assets[indice_asset].id;
	playSCO(lezioneid,scoid);
	
}

function goNextAsset() {
	var salta=true;
	while (salta && indice_asset<(1*asset_totale-1) ) {
		indice_asset++;
		if (!assets[indice_asset].hasOwnProperty('indice')||assets[indice_asset].indice==1) salta=false; 		
	}
	scoid=assets[indice_asset].id;
	playSCO(lezioneid,scoid);
}
function goBackAsset() {
	if (pagine_viste.length>1) {
		pagine_viste.pop();
		indice_asset=pagine_viste.pop();
		scoid=assets[indice_asset].id;
		playSCO(lezioneid,scoid);
	}
	
}

function playAsset(ripetizione) {
	
	for (var i=0,ilen=assets.length;i<ilen;i++) {
		if (assets[i].id==assetid) {
			indice_asset=i;
		}
	}
	$('.punteggio').hide();
	
	var html=renderAsset(indice_asset);
	
	pagine_viste.push(indice_asset);
	
	
	jQuery('#titolo_asset').html(asset.titolo);
	
	jQuery('#progr_lezione').html((1*indice_asset+1)+' / '+asset_totale);
	
	jQuery('#player_contenuto').html(html);
	
	if (show_score) {
		$('.punteggio').show();
	} else {
		$('.punteggio').hide();
	}
	
	if(window.MathJax) MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	
	if (asset.tipo==80) elaboraSintesi();
	
	if (asset.tipo==3 && asset.fatto==0) initDDMatch();
	jQuery('#player_contenuto').css('float','none');	
	
	jQuery('#asset_testo').css('position','relative');
	
	if (asset.tipo==3 && tema=='') {jQuery('#asset_testo').css('margin-bottom','1em');	jQuery('#area_interazione').css('min-height','1500px');}		
	
	if (asset.tipo==80) {         
		if (tema=='') jQuery('#asset_testo').css('position','absolute');	
		if (asset.testo.indexOf('sidebar_page')>0||asset.testo.indexOf('box_sx')>0||asset.testo.indexOf('box_dx')>0||asset.testo.indexOf('box_center')>0) {
			jQuery('#player_contenuto').css('float','left');
		}
		if (asset.consegna!=undefined && asset.consegna!='') {
			var audioid=uniqId();
			$('#asset_consegna').html('<audio class="audio_overlay" src="'+asset.consegna+'" controls="controls"/>');
			
			jQuery('#asset_consegna .audio_overlay').attr('id','audio_overlay'+audioid);
			
			overlay = new mediaOverlay('audio_overlay'+audioid,'testo_libero');
			overlay.init();
			overlay.play();
		}
	}
	
	if ((asset.tipo=="4" || asset.tipo=="5") && (asset.fatto==1||asset.tentativi>0)) {
		
		
		var checked=asset.rispostautente.split('|');
		
		for (var j=0,jlen=asset.opzioni.length;j<jlen;j++) {
			
			var id=asset.opzioni[j].id;
				
			risposta=checked[j];
			
			if (risposta=="....................") risposta="";
			
			var r0=risposta.replace('&lt;','<');
			r0=r0.replace('&gt;','>');
			
			
			jQuery('#'+id).val(r0);
			
			var risposta0=risposta;
			
			if (risposta0=="") risposta0="...";
			
			var classe="sbagliato";
			
			
			
			var giusta=asset.opzioni[j].giusta;
			var giusta0=asset.opzioni[j].giusta;
			
			if (asset.opzioni[j].cs=='0') {
				risposta0=risposta.toUpperCase();
				giusta0=giusta.toUpperCase();
			}
			
			var corrette=giusta.split('|');
			var corrette0=giusta0.split('|');
			
			
			if (jQuery.inArray(risposta0,corrette0)!=-1) {
				classe="giusto";
			} else {
				var corretta=corrette[0];
			}
				
			jQuery('#'+id).addClass(classe);
			if (classe=="sbagliato") {
				//jQuery('#'+id).attr("title",corretta);
				
			}
			
			if (asset.fatto==0 && classe=="giusto")
				jQuery('#'+id).attr("disabled","disabled");
			
			if (asset.fatto==0 && classe=="sbagliato") {
				jQuery('#'+id).removeClass("sbagliato");
			}
		}
		
		
	}
	
	if (asset.tipo==6) {
		jQuery( "#player_tabella_item" ).sortable();
		jQuery( "#player_tabella_item" ).disableSelection();
	}
	
	if (asset.tipo==9 && asset.fatto==0) {
		renderMappa9();	
	}
	
	if (asset.tipo==9 && asset.fatto==1) {
		
		var imgid='#img'+asset.id;
		
		 $(imgid).load(function(){
		
			 	renderMappa9();	
			 
			 	var el=asset.rispostautente;
				var score=asset.punteggio;
				
				
				if (score=='1') {
					$(imgid).mapster('set_options',{
						render_select: {
		        		fillColor: '00ff00'}
					});
						
			    } else {
			    	$(imgid).mapster('set_options',{
						render_select: {
			       		fillColor: 'ff0000'}
					});
						
				}
					
				$('area').each(function() {
					$(imgid).mapster('set',false,$(this).attr('alt'));			
				});
					
				$(imgid).mapster('set',true,el);
		});
			
		
	}
	
	
	if (asset.tipo==7) {

		tinyMCE.init({
			// General options
			mode : "exact",
		    elements : "textintruso",
			theme : "advanced",
			language : "it",
			plugins : "",
			entity_encoding : "numeric",
			media_strict: "false",
			extended_valid_elements : "iframe[src|class|width|height|name|align],object[width|height|classid|codebase],param[name|value],embed[src|type|width|height|flashvars|wmode]",

			// Theme options
			theme_advanced_buttons1 : "undo,redo,",
			theme_advanced_buttons2 : "",
			theme_advanced_buttons3 : "",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "",
			//theme_advanced_resizing : true,
			width:"550",
			height:"250",
			
			setup : function(ed) {
			      ed.onKeyPress.add(function(ed, e) {
			    	  e.preventDefault();
			    	  return false;
			      });
			      
			      ed.onKeyDown.add(function(ed, e) {
			    	  	
			    	   e.preventDefault();
					   return false;
			    	    
			    	});
			},
			
			// Example content CSS (should be your site CSS)
			content_css : "css/editor.css",

			// Drop lists for link/image/media/template dialogs
			template_external_list_url : "lists/template_list.js",
			external_link_list_url : "lists/link_list.js",
			external_image_list_url : "lists/image_list.js",
			media_external_list_url : "lists/media_list.js"

			
		});
		
		$('html').keyup(function(e){
		    //if(e.keyCode == 46 || e.keyCode==8 ) alert('Delete Key Pressed')
		}); 
		
		if (asset.fatto==1) {
			jQuery('#btn_creaintruso').attr("disabled", "disabled"); 
			jQuery('#btn_delintruso').attr("disabled", "disabled"); 
		} 
	}
	
	if (asset.tipo==8) {
		$('#asset_consegna').show();
		$('.asset_consegna').show();
		
		var seq="";
		if (asset.tentativi>0) {
			seq=asset.rispostautente;
		}
		if (ripetizione=="riprova")
		{
			asset.dd=new dragdrop(asset.settings, asset.set_hotspot, asset.set_label,seq,asset.fatto, "riprova");
		}
		else
		{
			asset.dd=new dragdrop(asset.settings, asset.set_hotspot, asset.set_label,seq,asset.fatto);
		}
		$(window).resize( function () {
			asset.dd.resize();
		});
		
		$(window).scroll(function () {
			asset.dd.fixScroll();
		});
		
		setTimeout("dd_initialize()", 200);
	} else {
		$(window).off("resize");
		$(window).off("scroll");
		$('#player_contenuto').css('height','100%');
		$('#asset_consegna').hide();
		$('.asset_consegna').hide();
	}
	$('#asset_consegna').show();
	$('.asset_consegna').show();
	
	
	if ((asset.tipo==19 || asset.tipo==21) && (asset.fatto==0)) initDD();
	
	if (asset.tipo==19 && asset.fatto==0 && asset.tentativi>0) {
		
		var item=asset.item;
		var rispostautente=asset.rispostautente.split("|");
		
		for (var i=0,ilen=item.length;i<ilen;i++) {
			
			jQuery('#drop_'+asset.id+'_'+i).val(rispostautente[i]);
			
			var el=item_id(item,i);
			var testo = jQuery("<div/>").html(el.testo).text();
			
			if (jQuery('#drop_'+asset.id+'_'+i).val()==testo) {
				jQuery('#drop_'+asset.id+'_'+i).addClass('giusto');
				jQuery('#box_'+el.id).hide();
			} else {
				jQuery('#drop_'+asset.id+'_'+i).val('');
			}
			
		}
	
	}
	
	if (asset.tipo==19 && asset.fatto==1) {
		var item=asset.item;
		var rispostautente=asset.rispostautente.split("|");
		
		for (var i=0,ilen=item.length;i<ilen;i++) {
			
			jQuery('#drop_'+asset.id+'_'+i).val(rispostautente[i]);
			
			var el=item_id(item,i);
			var testo = jQuery("<div/>").html(el.testo).text();
			
			if (jQuery('#drop_'+asset.id+'_'+i).val()==testo) {
				jQuery('#drop_'+asset.id+'_'+i).addClass('giusto');
			} else {
				jQuery('#drop_'+asset.id+'_'+i).addClass('sbagliato');
			}
			
		}
	}
	
	if (asset.tipo==21 && asset.fatto==0 && asset.tentativi>0) {
		
	
		var rispostautente=asset.rispostautente.split("|");
		var k=0;
		
		for (var j=0,jlen=asset.domande.length;j<jlen;j++) {
			var item=asset.domande[j].item;
		
			for (var i=0,ilen=item.length;i<ilen;i++) {
			
				jQuery('#drop_'+asset.domande[j].id+'_'+i).val(rispostautente[k]);
				k++;
		
				var el=item_id(item,i);
				var testo = jQuery("<div/>").html(el.testo).text();
			
				if (jQuery('#drop_'+asset.domande[j].id+'_'+i).val()==testo) {
					jQuery('#drop_'+asset.domande[j].id+'_'+i).addClass('giusto');
					jQuery('#box_'+asset.domande[j].id+'_'+el.id).hide();
				} else {
					jQuery('#drop_'+asset.domande[j].id+'_'+i).val('');
				}
			
			}
		}
		
	}

	if (asset.tipo==21 && asset.fatto==1) {
		var rispostautente=asset.rispostautente.split("|");
		var k=0;
		
		for (var j=0,jlen=asset.domande.length;j<jlen;j++) {
			var item=asset.domande[j].item;
		
			for (var i=0,ilen=item.length;i<ilen;i++) {
			
				jQuery('#drop_'+asset.domande[j].id+'_'+i).val(rispostautente[k]);
				k++;
		
				var el=item_id(item,i);
				var testo = jQuery("<div/>").html(el.testo).text();
			
				if (jQuery('#drop_'+asset.domande[j].id+'_'+i).val()==testo) {
					jQuery('#drop_'+asset.domande[j].id+'_'+i).addClass('giusto');
				} else {
					jQuery('#drop_'+asset.domande[j].id+'_'+i).addClass('sbagliato');
				}
			
			}
		}
	}
	var pulsanti='';
	
	if (asset.tipo!=79 && asset.tipo!=80 && asset.tipo!=11 && asset.tipo!=10 && asset.tipo!=13 && asset.tipo!=14) {
		
		if (asset.fatto==0) {
			pulsanti='<li class="active" onclick="inviaConferma();return false">'+pConferma+'</li>';
		}
		
		if (asset.punteggio!=asset.punteggio_max) {
		if ((asset.fatto!=0 && max_tentativi>1 && asset.tentativi<=(max_tentativi-1)) && (asset.tipo!=18)) {
			pulsanti='<li class="active" onclick="riprova();return false">'+pRiprova+'</li>';
		} else {
			if (asset.fatto!=0) {
				//pulsanti='<li class="inactive">'+pRiprova+'</li>';
			}
		}
		
		if ((asset.fatto!=0 && min_tentativi>0 && (asset.punteggio!=asset.punteggio_max) && (asset.tentativi>=min_tentativi || (max_tentativi=='1' && asset.tentativi>0))) || (asset.tipo==18 && asset.tentativi>=1)) {
			pulsanti+='<li class="active" onclick="soluzioni();return false">'+pSoluzioni+'</li>';
		} else {
			//pulsanti+='<li class="inactive">'+pSoluzioni+'</li>';
		}
		}
		
		
		
	} else {
		//jQuery('#player_pulsanti').html('<li class="active" onclick="stampa();return false">Stampa</li>');
		if (asset.fatto!=1) {
			asset.fatto=1;
			asset_fatti++;
			progressioneLezione();
		}
		
		//jQuery('#sco_'+asset.id).addClass('checked');
	}
	
	if (scorm) {
		var completato=true;
		for (var i=0,ilen=assets.length;i<ilen;i++) {
			if (assets[i].fatto!=1) completato=false;
		}
		
		if (completato) {
			doLMSSetValue( "cmi.core.lesson_status", "completed" );
			registraDati();  
		}
	}
	
	jQuery('#player_pulsanti').html(pulsanti);
	
	
	
	pannello('player');
	
	//resizeCompleto();
	//setTimeout('resizeCompleto()',100);
	
	$("#player_contenuto").animate({ scrollTop: 0 }, "fast");
	setTimeout('tornoSu()',100);
	
}


function tornoSu() {
	$('html, body').animate({ scrollTop: 0 }, "fast");
}



function registraDati() {
	 doLMSSetValue( "cmi.core.exit", "suspend" );
	 doLMSSetValue( "cmi.core.score.raw", punteggio_lezione+"" );
	 doLMSSetValue( "cmi.core.score.max", punteggio_max_lezione+"" );
	 var suspend_data='';
	 for (var i=0,ilen=assets.length;i<ilen;i++) {
		 if (suspend_data) suspend_data+='^';
		 suspend_data+=assets[i].fatto+"|||"+assets[i].rispostautente+"|||"+assets[i].punteggio+"|||"+assets[i].rispostagiusta;
	}

	doLMSSetValue("cmi.suspend_data",escape(suspend_data));	
	 
}
function elaboraSintesi() {
	jQuery('#player_contenuto .sintesi').each(function(index) {
		var id_sintesi=$(this).attr('id');
		var etichetta=$(this).attr('data-etichetta');
		$('#'+id_sintesi).hide();
		$( '#'+id_sintesi ).before( '<p><a href="javascript:void(0);" style="text-decoration:none" onclick="toggleSintesi(\''+id_sintesi+'\');">'+etichetta+'</a>&nbsp; <a id="link_'+id_sintesi+'" href="javascript:void(0);" style="text-decoration:none;font-size:1em;font-weight:bold;" onclick="toggleSintesi(\''+id_sintesi+'\');"><i class="icon-caret-right"></i></a></p>');
	});
}

function toggleSintesi(id_sintesi) {
	$('#'+id_sintesi).toggle();
	if ( $('#'+id_sintesi).is(':visible') ) {
		jQuery('#link_'+id_sintesi).html('<i class="icon-caret-down"></i>');
	} else {
		jQuery('#link_'+id_sintesi).html('<i class="icon-caret-right"></i>');
	}

}

function renderAsset(i) {
	
	var tipoasset=assets[i].tipo;
	
	var renderSavedAsset= "renderSavedAsset_"+tipoasset;
	var renderAsset= "renderAsset_"+tipoasset;
	
	asset=assets[i];
	
	if (asset.fatto=='1') {
		var html=eval(renderSavedAsset+'(0)');
	} else {
		var html=eval(renderAsset+'()');
	}
	
	return html;
}


function renderAssetSoluzioni(i) {
	
	var tipoasset=assets[i].tipo;
	
	
	var renderSavedAsset= "renderSavedAsset_"+tipoasset;
	
	asset=assets[i];
	var html='';
	if (asset.tipo!=79 && asset.tipo!=80 && asset.tipo!=11  && asset.tipo!=9 && asset.tipo!=10 && asset.tipo!=13 && asset.tipo!=14) {
		if (asset.tipo=='4' || asset.tipo=='5') {asset.testo_soluzioni=replaceFields(asset.testo0,1);};
		html=eval(renderSavedAsset+'(1)');
	}
	
	return html;
}

function inviaConferma() {
	
	var tipoasset=1*asset.tipo;
	
	if (tipoasset==8) {
		
		asset.dd.check();
		
		if (asset.dd.hsList.complete()) {
			
		
			salvaAsset_8();
			
			asset.fatto=1;
			asset_fatti++;
			asset.tentativi++;
			punteggio_lezione+=1*asset.punteggio;
			
			progressioneLezione();
			pulsanti='';
			
			if (asset.fatto==0) {
				pulsanti='<li class="active" onclick="inviaConferma();return false">'+pConferma+'</li>';
			}
			
			if (asset.fatto!=0 && parseInt(asset.punteggio)!=parseInt(asset.punteggio_max)) {
			if (asset.tentativi<=(max_tentativi-1)) {
				pulsanti='<li class="active" onclick="riprova();return false">'+pRiprova+'</li>';
			} else {
				if (asset.fatto!=0) {
					pulsanti='';
				}
			}
			
			
			if (min_tentativi>0 && (asset.tentativi>=min_tentativi || (max_tentativi=='1' && asset.tentativi>0))) {
				pulsanti+='<li class="active" onclick="soluzioni();return false">'+pSoluzioni+'</li>';
			} else {
				pulsanti+='';
			}	
			}
			
			jQuery('#player_pulsanti').html(pulsanti);
			
			//playAsset();
			
		}
	} else {
		
		var salva="salvaAsset_"+tipoasset;
	
		eval(salva+'()');
	
		if (tipoasset!=9||(tipoasset==9 && asset.rispostautente)) {
		asset.fatto=1;
		asset_fatti++;
		asset.tentativi++;
		punteggio_lezione+=1*asset.punteggio;
		
		progressioneLezione();
		
		playAsset();
		}
	}
	
}

function aggiornaProgressione() {
	
	
}

function renderAsset_9() {
	var html="";
	
		
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni">';
	html+=asset.map;
	html+='</div>';
	return html;
	
	
}

function renderSavedAsset_9() {
	return renderAsset_9()+'<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	
}

function salvaAsset_9() {
	var imgid="#img"+asset.id;
	
	var rispostautente=$(imgid).mapster("get");
	asset.rispostautente=rispostautente;
	
	if (rispostautente) {
		
		var punteggio_esercizio=$('area[alt='+rispostautente).attr('href');
		var punteggio_max=1;
		var rispostagiusta='';
		$('area').each(function() {
			if ($(this).attr('href')==1) rispostagiusta=$(this).attr('alt');
		});
	
		asset.rispostautente=rispostautente;
		asset.punteggio=punteggio_esercizio;
		asset.rispostagiusta=rispostagiusta;
		punteggio=punteggio_esercizio;
		punteggio_max=asset.punteggio_max;
	}	
	
}

function renderAsset_1() {
	
	var html="";
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni">';
	
	if (asset.tentativi==0)
		if (asset.shuffleanswers=='1') jQuery.shuffle(asset.opzioni);
	
	if (asset.tentativi>0) {
		var checkutente=asset.rispostautente.split(',');
	}
	
	html+='<table>';
	
	if (asset.orientamento_opzioni==1) html+='<tr>';
	
	var elenco_opzioni='';
	for (var i=0,ilen=asset.opzioni.length;i<ilen;i++) {
		var checked="";
		var disabled="";
		var classe="";
		
		switch (asset.answernumbering) {
			case "abc":
				var label=String.fromCharCode(97+i);
				break;
			
			case "ABC":
				var label=String.fromCharCode(65+i);
				break;
				
			case "123":
				var label=i+1;
				break;
			
			case "none":
			default:
				var label="";
				break;
		}
		if (elenco_opzioni) elenco_opzioni+=',';
		elenco_opzioni+=asset.opzioni[i].id;
		
		if (asset.tentativi>0) {
			var check=checkutente[i].split("*");
			if (check[1]=='1' && 1*asset.opzioni[i].fraction>0) {
				disabled='disabled="disabled"';
				checked='checked="checked"';
				classe="giusto";
			};
			
			if (check[1]=='1' && 1*asset.opzioni[i].fraction<=0) {
				//disabled='disabled="disabled"';
				checked='checked="checked"';
				classe="sbagliato";
			};
		}
		
		if (label!="") label=label+".";
		if (asset.orientamento_opzioni!=1) html+='<tr>';
		
		if (asset.single=="1") {
			html+='<td><div class="player_input '+classe+'">'+label+' <input '+disabled+' '+checked+' type="checkbox" class="rispostautente" name="d'+asset.opzioni[i].id+'" id="d'+asset.opzioni[i].id+'" /></div></td><td><div class="player_opzione '+classe+'" style="cursor:pointer;" onclick="hiliteRisposta(\''+asset.opzioni[i].id+'\');">'+asset.opzioni[i].answer+"</div></td>";
		} else {
			html+='<td><div class="player_input '+classe+'">'+label+' <input '+disabled+' '+checked+' type="radio" class="rispostautente"  value="'+asset.opzioni[i].id+'" name="d"  id="d'+asset.opzioni[i].id+'" /></div></td><td><div class="player_opzione '+classe+'" style="cursor:pointer;" onclick="hiliteRisposta(\''+asset.opzioni[i].id+'\');">'+asset.opzioni[i].answer+"</div></td>";
		}
		if (asset.orientamento_opzioni!=0) {
			html+='</tr>';
			//html+='<tr><td colspan="2"><div class="player_opzione_separatore"></div></td></tr>';
		}
	}
	if (asset.orientamento_opzioni==1) html+='</tr>';
	html+='</table>';
	html+='</div>';
	
	asset.elenco_opzioni=elenco_opzioni;
	
	return html;
	
}

function hiliteRisposta(idrisp) {
	jQuery('#d'+idrisp).trigger('click');
}

function renderSavedAsset_1(soluzioni) {
	var html="";
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni">';
	
	html+='<table>';
	
	if (asset.orientamento_opzioni==1) html+='<tr>';
	
	var checkutente=asset.rispostautente.split(',');
	var opzioni=asset.rispostagiusta.split(',');
	
	for (var i=0,ilen=opzioni.length;i<ilen;i++) {
		
		var op=opzioni[i].split('*');
		
		var opzione=item_id(asset.opzioni,op[0]);
		
		switch (asset.answernumbering) {
			case "abc":
				var label=String.fromCharCode(97+i);
				break;
			
			case "ABC":
				var label=String.fromCharCode(65+i);
				break;
				
			case "123":
				var label=i+1;
				break;
			
			case "none":
			default:
				var label="";
				break;
		}
		
		var feedback="";
		var checked="";
		
		var classe="giusto";
		if (1*opzione.fraction<=0) classe="sbagliato";
		
		var risposta=false;
		
		var check=checkutente[i].split("*");
		
		if (check[1]=='1') {
			risposta=true;
			checked='checked="checked"';
		};
		
		if (risposta && !soluzioni) {
			if ((opzione.feedback)) {
				feedback="<div class=\"feedback\">"+opzione.feedback+"</div>";
			}
		}
		
		if (!soluzioni && asset.tentativi==0) classe="";
		
		var disabled='disabled="disabled"';
		
		if (!soluzioni && !risposta) classe="";
		
		if (soluzioni) {
			checked="";
		}
		
		if (label!="") label=label+".";
		if (asset.orientamento_opzioni!=1) html+='<tr>';
		
		if (asset.single=="1") {
			html+='<td><div class="player_input '+classe+'">'+label+' <input '+disabled+' type="checkbox" class="rispostautente" '+checked+' name="d'+opzione.id+'" id="d'+opzione.id+'" /></div></td><td><div class="player_opzione '+classe+'">'+opzione.answer+'</div><div class="icona_'+classe+'"></div>';
			if(feedback!=""){
					//html+='<div class="lampadina" id="lampadina_'+classe+'"></div>';
				}
			html+=feedback;
			html+='</td>';
		} else {
			html+='<td><div class="player_input '+classe+'">'+label+' <input '+disabled+'  type="radio" class="rispostautente" '+checked+'   value="'+opzione.id+'" name="d"  id="d'+opzione.id+'" /></div></td><td><div class="player_opzione '+classe+'">'+opzione.answer+'</div><div class="icona_'+classe+'"></div>';
			if(feedback!=""){
					//html+='<div class="lampadina" id="lampadina_'+classe+'"></div>';
				}
			html+=feedback;
			html+='</td>';
		}
		
		if (asset.orientamento_opzioni!=1) {
			html+='</tr>';
			//html+='<tr><td><div class="player_opzione_separatore"></div></td><td></td></tr>';
		}
		
		
	}
	/*
	setTimeout(function(){
		var classe_feedback="giusto";
		if($('.player_opzione.sbagliato').length>0){
			classe_feedback="sbagliato";
		}
	
		$('#lampadina_'+classe_feedback).qtip({
			content: {
				text: $('.feedback')
			},
			position: {
				my: 'left center',  // Position my top left...
				at: 'right center', // at the bottom right of...
				target: $('#lampadina_'+classe_feedback), // my target
				viewport: $(window)
			},
			show: {
				event: 'click mouseenter'
			},
			hide: {
				event: 'click mouseleave',
				leave: true,
				target: $('#player_contenuto, #lampadina_'+classe_feedback)
			},
			style: {
				classes: 'ui-tooltip-blue ui-tooltip-shadow'
			}
	});
	},200);	
	*/
	if (asset.orientamento_opzioni==1) html+='</tr>';
	html+='</table>';
	html+='</div>';
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	
	return html;
	
}

function salvaAsset_1() {
	var rispostautente='';
	var punteggio_esercizio=0;
	var rispostautente='';
	var pattern='';
	for (var i=0,ilen=asset.opzioni.length;i<ilen;i++) {
		if (rispostautente) rispostautente+=',';
		if (pattern) pattern+=',';
		
		var risposta = $('#d'+asset.opzioni[i].id).is(':checked');
		if (1*asset.opzioni[i].fraction>0) {
			pattern+=asset.opzioni[i].id+"*1";
		} else {
			pattern+=asset.opzioni[i].id+"*0";
		}
		if (risposta) {
			punteggio_esercizio+=1*asset.opzioni[i].fraction;
			rispostautente+=asset.opzioni[i].id+'*1';
			
		} else {
			rispostautente+=asset.opzioni[i].id+'*0';
		}
	}
	
	asset.rispostautente=rispostautente;
	asset.punteggio=punteggio_esercizio;
	asset.rispostagiusta=pattern;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	
	
    
     
	
}

function renderAsset_2() {
	
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni">';
	html+="<table id=\"table_options\" cellspacing=\"10\">";
	html+="<thead>";
	html+="<th></th>";
	html+="<th></th>";
	
	for (var l=1;l<5;l++) {
		if (eval('asset.label'+l)!='')
			html+="<th>"+eval('asset.label'+l)+"</th>";
	}
	html+="</thead><tbody>";
	
	if (asset.tentativi==0)
		if (asset.shufflequestions=='1') $.shuffle(asset.affermazioni);
	
	var elenco_affermazioni='';
	
	if (asset.tentativi>0) {
		var checkutente=asset.rispostautente.split(',');
	}
	
	for (var i=0,ilen=asset.affermazioni.length;i<ilen;i++) {
		
		if (elenco_affermazioni) elenco_affermazioni+=",";
		elenco_affermazioni+=asset.affermazioni[i].id1;
		
		html+="<tr>";
		
		switch (asset.questionnumbering) {
		case "abc":
			var label=String.fromCharCode(97+i);
			break;
		
		case "ABC":
			var label=String.fromCharCode(65+i);
			break;
			
		case "123":
			var label=i+1;
			break;
			
		default:
			var label="";
			break;
		}
		
		html+="<td class=\"label\">"+label+".</td>";
		
		html+="<td class=\"question\">"+asset.affermazioni[i].questiontext+"</td>";
		
		var disabled="";
		
		if (asset.tentativi>0) 
		{
			for (l=1;l<5;l++) {
				var j=l-1;
				var check=checkutente[i].split('*');
				if (l==check[1] && asset.affermazioni[i].opzioni[j].fraction>0) 
				{
					disabled='disabled="disabled"';
				}	
			}
		}
		
		for (l=1;l<5;l++) {
			
			var checked="";
			var classe="";
			
			
			if (asset.tentativi>0) {
				var j=l-1;
				var check=checkutente[i].split('*');
				if (l==check[1] && asset.affermazioni[i].opzioni[j].fraction>0) {
					checked='checked="checked"';
					classe='giusto';
					//disabled='disabled="disabled"';
				}
				
				if (l==check[1] && asset.affermazioni[i].opzioni[j].fraction<=0) {
					checked='';
					classe='';
					//disabled='disabled="disabled"';
				}
				
			}
				
			if (eval('asset.label'+l)!='') {
				html+='<td valign="top" align="center" class="'+classe+'"><input '+checked+' '+disabled+' class="rispostautente" type="radio" id="o'+i+'_'+l+'"  name="a'+i+'" value="'+l+'"/><div class="icona_'+classe+'"></div></td>';
			}
		}
		
		html+="</tr>";
	}
	
	html+="</tbody></table>";
	
	html+='</div>';
	
	asset.elenco_affermazioni=elenco_affermazioni;
	
	return html;
	
}

function renderSavedAsset_2(soluzioni) {
	
	var checkutente=asset.rispostautente.split(',');
	
	var html="";
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni">';
	html+="<table id=\"table_options\" cellspacing=\"10\">";
	html+="<tr>";
	html+="<th></th>";
	html+="<th></th>";
	
	for (var l=1;l<5;l++) {
		if (eval('asset.label'+l)!='')
			html+="<th>"+eval('asset.label'+l)+"</th>";
	}
	html+="</thead><tbody>";
	
	
	var affermazioni=asset.rispostagiusta.split(',');
	
	for (var i=0,ilen=affermazioni.length;i<ilen;i++) {
		
		var aff=affermazioni[i].split('*');
		var affermazione=item_id(asset.affermazioni,aff[0]);
		
		html+="<tr>";
		
		switch (asset.questionnumbering) {
		case "abc":
			var label=String.fromCharCode(97+i);
			break;
		
		case "ABC":
			var label=String.fromCharCode(65+i);
			break;
			
		case "123":
			var label=i+1;
			break;
			
		default:
			var label="";
			break;
		}
		
		html+="<td class=\"label\">"+label+".</td>";
		
		html+="<td class=\"question\">"+affermazione.questiontext+"</td>";
		
		var checked="";
		var classe="";
		var disabled='disabled="disabled"';
		
		for (l=1;l<5;l++) {
			checked="";
			classe='giusto';
			var j=l-1;
			if (affermazione.opzioni[j].fraction<=0) {
				classe='sbagliato';
			}
			
			var check=checkutente[i].split('*');
			if (l==check[1] && !soluzioni) {
				checked='checked="checked"';
			}
			
			
			if (!soluzioni && classe=='giusto' && checked=='checked="checked"') {
				disabled='disabled="disabled"';
			}
			
			if (!soluzioni && checked!='checked="checked"') {
				classe="";
			}
			
			
			if (soluzioni && classe=='sbagliato') {
				classe="";
			}
			
			if (soluzioni) {
				checked="";
			}
			
			if (eval('asset.label'+l)!='') {
				html+='<td valign="top" align="center" class="'+classe+'"><input '+disabled+' '+checked+' class="rispostautente" type="radio" id="o'+i+'_'+l+'"  name="a'+i+'" value="'+l+'"/><div class="icona_'+classe+'"></div></td>';
			}
		}
		
		html+="</tr>";
	}
	
	html+="</tbody></table>";
	
	html+='</div>';
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	
	return html;
}

function salvaAsset_2() {
	var rispostautente='';
	var punteggio_esercizio=0;
	
	var rispostautente='';
	for (var i=0,ilen=asset.affermazioni.length;i<ilen;i++) {
		if (rispostautente) rispostautente+=',';
		var risposta = $('input:radio[name=a'+i+']:checked').val();
		if (risposta != undefined) {
			rispostautente+=asset.affermazioni[i].id+'*'+risposta;
			var j=1*risposta-1;
			punteggio_esercizio+=1*asset.affermazioni[i].opzioni[j].fraction;
		} else {
			rispostautente+=asset.affermazioni[i].id+'*x';
		}
	}
	
	var pattern='';
	for (var i=0,ilen=asset.affermazioni.length;i<ilen;i++) {
		if (pattern) pattern+=',';
		
		for (var j=0,jlen=asset.affermazioni[i].opzioni.length;j<jlen;j++) {
			if (1*asset.affermazioni[i].opzioni[j].fraction>0) {
				var l=j+1;
				pattern+=asset.affermazioni[i].id+'*'+l;
			}
		}
		 
	}
	
	asset.rispostautente=rispostautente;
	asset.rispostagiusta=pattern;
	asset.punteggio=punteggio_esercizio;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	

   
	
}

function renderAsset_3() {
	var coppia_sx=new Array();
	var coppia_dx=new Array();
	
	if (asset.tentativi==0) {	
		for (var i=0,ilen=asset.coppie.length;i<ilen;i++) {
			
			coppia_sx[i]=new Object();
			coppia_sx[i].id=asset.coppie[i].id;
			coppia_sx[i].testo=asset.coppie[i].domanda;
			
			coppia_dx[i]=new Object();
			coppia_dx[i].id=asset.coppie[i].id;
			coppia_dx[i].testo=asset.coppie[i].risposta;
				
		}
			
	
		$.shuffle(coppia_dx);
		$.shuffle(coppia_sx);
	} else {
		var el_dx=asset.elenco_dx.split(',');
		var el_sx=asset.elenco_sx.split(',');
		
		for (var i=0,ilen=asset.coppie.length;i<ilen;i++) {
			
			coppia_sx[i]=new Object();
			coppia_sx[i].id=el_sx[i];
			coppia_sx[i].testo=item_coppia('sx',el_sx[i]);
			
			coppia_dx[i]=new Object();
			coppia_dx[i].id=el_dx[i];
			coppia_dx[i].testo=item_coppia('dx',el_dx[i]);
				
		}
		
	}
	
	var elenco_dx='';
	var elenco_sx='';
	
	
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_opzioni">';
	
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	
	html+='<div id="area_interazione"><table cellspacing="5" style="text-align: center;width:100%">';
	
	html+='<tr>';
	html+='<td valign="top">';
	html+= "<table class=\"tabella_dd associazione\" cellspacing=\"0\" cellpadding=\"2\">\n";
	
	for (i=0,ilen=coppia_sx.length;i<ilen;i++) {
		html+= "<tr>";
		html+= "<td id=\"elemento_"+coppia_sx[i].id+"\"  class=\"titolo_riga\">"+coppia_sx[i].testo+"<input type=\"hidden\" id=\"coppia_"+coppia_sx[i].id+"\" name=\"coppia_"+coppia_sx[i].id+"\" value=\"\" /></td>";
		html+= "<td class=\"dropmatch\" id=\"drop_"+coppia_sx[i].id+"\" ></td>";
		html+= "</tr>\n";
		
		if (elenco_sx) elenco_sx+=',';
		elenco_sx+=coppia_sx[i].id;
		
	}
	html+= "</table>\n";
	html+='</td>';
			
	html+='<td valign="top">';
	html+= "<table class=\"tabella_dd associazione2\" cellspacing=\"0\" cellpadding=\"2\">\n";
	for (i=0,ilen=coppia_dx.length;i<ilen;i++) {
		html+= "<tr>";
		html+= "<td class=\"drag_td\"><div id=\"drag_"+coppia_dx[i].id+"\" pos=\"\" class=\"dragmatch\">"+coppia_dx[i].testo+"</div></td>";
		html+= "</tr>\n";
		
		if (elenco_dx) elenco_dx+=',';
		elenco_dx+=coppia_dx[i].id;
	}
	html+= "</table>\n";
	html+='</td>';
	
	html+='</tr>';
	html+='</table></div>';
		
		
	html+='</div>';
	
	
	asset.elenco_dx=elenco_dx;
	asset.elenco_sx=elenco_sx;
		
	return html;
}

function initDDMatch() {
	 var max_w=0;
	 var max_h=0;
	 $('.dragmatch').each(
			 function (index) {
				 var w=$(this).width();
				 var h=$(this).height();
				 
				 if (w>max_w) max_w=w;
				 if (h>max_h) max_h=h;
				 
			 }
	 );
	 
	 
	 
	 $('.dropmatch').each(
			function (index) {
				$(this).width(max_w+100);
				$(this).height(max_h+10);
				var idName=$(this).attr("id");
				var id=idName.substr(5,idName.length);
				var tdid='dragtd_'+id;
				var drag='drag_'+id;
				$('#'+tdid).width(max_w);
				$('#'+tdid).height(max_h);
				$('#'+drag).width(max_w);
				$('#'+drag).height(max_h);
				
			}
	 
	 );
	 
	 $('.titolo_riga').each(
				function (index) {
					$(this).width(max_w);
					$(this).height(max_h);
					
					
				}
		 
		 );
	 
	 $('.dragmatch').each(
			 function (index) {
				 var pos=$(this).offset();
				 var idName=$(this).attr("id");
				 var id=idName.substr(5,idName.length);
				 var pos0=$('#elemento_'+id).offset();
				 var distanza=pos.left-pos0.left;
				 $(this).attr('pos',pos.top+','+pos.left);
				 
				 
				
			 }
	 ); 
	 
	
	 
	  $('.dragmatch').draggable( {
		containment: 'document',
		cursor: 'move',
		scroll: true,		
	    revert: 'invalid',
		refreshPositions: true
	  } );
	  
	  
	  $('.dropmatch').droppable( {
		    drop: handleDrop,
		    out: handleReset
		  } );

	  function handleDrop( event, ui ) {
		  boxName = document.getElementById($(this).attr("id"));
		  
		  if (boxName.id != 'undefined') {
			  var idName=boxName.id;
			  var id=idName.substr(5,idName.length);
			  var coppiaid='coppia_'+id;
		  
			  var value=jQuery(ui.draggable).attr("id");
			  var valueid=value.substr(5,idName.length);
			  
			  if (jQuery('#'+coppiaid).val()!=undefined && jQuery('#'+coppiaid).val()!='' && jQuery('#'+coppiaid).val()!='0') {
				  var elemento_precedente=jQuery('#'+coppiaid).val();
				  var el='drag_'+elemento_precedente;
				  var l=$('#'+el).attr("pos");
				  var lp=l.split(',');
				  var scroll=$('#player_contenuto').scrollTop();
				  
				  $('#'+el).offset({ top: lp[0]-scroll, left: lp[1] });
				  
				
					 
				  
			  }
			  
			  jQuery('#'+coppiaid).val(valueid);
			  
			  var w=jQuery('#'+value).width();
			  var h=jQuery('#'+value).height();
			  
			  
			  //jQuery('#'+idName).width(w);
			  //jQuery('#'+idName).height(h);
			  
			  
			  ui.draggable.position( { of: $(this), my: 'left top', at: 'left top' } );
			  ui.draggable.draggable( 'option', 'revert', false );
			  
			 
				 
				 
		  }
		 
		}
	  
	  function handleReset(event, ui) {
		  	boxName = document.getElementById($(this).attr("id"));
		  	
		  	var idName=boxName.id;
		  	var id=idName.substr(5,idName.length);
			var coppiaid='coppia_'+id;
			
			var value=jQuery(ui.draggable).attr("id");
			var valueid=value.substr(5,idName.length);
			  	
			
			if(valueid == jQuery('#'+coppiaid).val()) {
				jQuery('#'+coppiaid).val('');
				
			}
			
			
			  	
			  
		}					
	  
	  
	  
	  if (asset.tentativi>0) {
		  var risposte=asset.rispostautente.split(',');
		  
		  for (var i=0,ilen=risposte.length;i<ilen;i++) {
				
				var coppia=risposte[i].split('*');
				
				var classe="";
				if (coppia[0]==coppia[1]) {
					
					var id=coppia[0];
					
					var coppiaid='coppia_'+id;
					var elementoid='elemento_'+id;
					jQuery('#'+elementoid).addClass('giusto');
					jQuery('#'+coppiaid).val(id);
					var dragID='drag_'+id;
					var dropID='drop_'+id;
					
					var w=jQuery('#'+dragID).width();
					var h=jQuery('#'+dragID).height();
					
					var offset=jQuery('#'+dropID).offset();
					
					
					jQuery('#'+dropID).width(w);
					jQuery('#'+dropID).height(h);
					  
					jQuery('#'+dragID).offset({ top: offset.top, left: offset.left});
					
					
					
					 
					  
				} 
				
				
				

			}
		  
	  }
}

function renderSavedAsset_3(soluzioni) {

	var html="";
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	
	html+='<div id="asset_opzioni" class="elenco_opzioni">';
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	
	
	html+='<div id="area_interazione"><table cellspacing="5" cellpadding="20" style="width: 100%; text-align: center;">';
	
	html+='<tr>';
	html+='<td valign="top">';
	html+= "<table class=\"tabella_dd associazione\" id=\"player_tabella_item_sx\" cellspacing=\"0\" cellpadding=\"2\">\n";
	
	
	var risposte=asset.rispostautente.split(',');
	
	for (var i=0,ilen=risposte.length;i<ilen;i++) {
		
		var coppia=risposte[i].split('*');
		
		var classe="sbagliato";
		var progr_giusto='';
		if (coppia[0]==coppia[1]) {
			classe="giusto";
		} 
		
		if (!soluzioni) {
			html += "<tr>";
			html += "<td class=\"titolo_riga\"  >"+item_coppia("sx",coppia[0])+"</td>";
			html += "<td class=\"titolo_riga "+classe+"\" >"+item_coppia("dx",coppia[1])+"</td>";
			html += "<td class=\"icona_"+classe+"\" ></td>";
			html += "</tr>\n";
		} else {
			html += "<tr>";
			html += "<td class=\"titolo_riga\"  >"+item_coppia("sx",coppia[0])+"</td>";
			html += "<td class=\"titolo_riga\" >"+item_coppia("dx",coppia[0])+"</td>";
			html += "</tr>\n";
		}

	}
	
	html += "</table>\n";
	html+='</td>';
	
	html+='</tr>';
	html+='</table></div>';

	html+='</div>';
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	return html;

}
	
function salvaAsset_3() {
	
	var punteggio_esercizio=0;

	var rispostautente="";
	
	var pattern="";
	
	var elenco_sx=asset.elenco_sx.split(',');
	var elenco_dx=asset.elenco_dx.split(',');
	
	for (var i=0,ilen=elenco_sx.length;i<ilen;i++) {
		
		var r=jQuery('#coppia_'+elenco_sx[i]).val();
		
		if (r==elenco_sx[i]) {
			var cop=item_id(asset.coppie,r);
			
			punteggio_esercizio+=1*cop.fraction;
		}
		if (rispostautente) rispostautente+=',';
		rispostautente+=elenco_sx[i]+'*'+r;
		
		if (pattern) pattern+=',';
		pattern+=elenco_sx[i]+'*'+elenco_sx[i];
		
		
	}
	
	
	
	asset.rispostautente=rispostautente;
	asset.rispostagiusta=pattern;
	asset.punteggio=punteggio_esercizio;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	
	
	
}


function renderAsset_4() {
	return renderAsset_fillin();
}

function renderSavedAsset_4(soluzioni) {

	return renderSavedAsset_fillin(soluzioni);
}

function salvaAsset_4() {
	return salvaAsset_fillin();
}	

function renderAsset_5() {
	return renderAsset_fillin();
}

function renderSavedAsset_5(soluzioni) {

	return renderSavedAsset_fillin(soluzioni);
}

function salvaAsset_5() {
	return salvaAsset_fillin();
}	
	

function renderAsset_fillin() {
	var html="";
	var testo=asset.testo;
	
	testo=replaceFields(testo,0);
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	
	html+='<div id="player_testo_domanda">'+testo+'</div>';
	
	html+='<div id="player_opzioni_domanda">';
	html+='</div>';
	
	asset.testo_originale=asset.testo;
	
	asset.testo=testo;
	
	return html;
}

function replaceFields(testo,soluzioni) {
	
	var max_size=0;
	var size=0;
	for (var i=0,ilen=asset.opzioni.length;i<ilen;i++) {
		size=calcolaSizeCampo(asset.opzioni[i].valori+"|"+asset.opzioni[i].giusta);
		if (size>max_size) max_size=size;
	}
	
	for (var i=0,ilen=asset.opzioni.length;i<ilen;i++) {
		var id="i"+indice_asset+"_"+i;
		asset.opzioni[i].id=id;
		var campo=asset.opzioni[i].campo;
		var valori=asset.opzioni[i].valori.split('|');
		
		var tipo='input';
		if (asset.opzioni[i].valori!='') tipo='select';
		
		var c='';
		switch (tipo) {
		case 'input':
			c='<input type="text" name="'+id+'" id="'+id+'" size="'+max_size+'" value="" />';
			break;
			
		case 'select':
			if (asset.opzioni[i].shuffleanswers=="1")
			{
				jQuery.shuffle(valori);
			}
			c='<select  name="'+id+'" id="'+id+'" size="1"><option value="" selected="selected"></option>';
			for (var j=0,jlen=valori.length;j<jlen;j++) { 
				c+='<option value="'+valori[j]+'">'+valori[j]+'</option>'
			}
			c+='</select>';
			break;
			
			
		}
		
		if (soluzioni) {
			var c0=asset.opzioni[i].giusta.split('|');
			var c0_s=c0.join(" - ");
			c='<span class="soluzione giusto">'+c0+'</span>';
		}
		testo=testo.replace('<#'+campo+'#>',c);
		
	}
	
	return testo;
}

function renderSavedAsset_fillin(soluzioni) {
	
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	if (soluzioni) {
		html+='<div id="asset_testo">'+asset.testo_soluzioni+'</div>';
	} else {
		
		html+='<div id="asset_testo">'+asset.testo+'</div>';
	}
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	return html;
}

function salvaAsset_fillin() {
	var punteggio_esercizio=0;

	var rispostautente="";
	var pattern="";
	
	for (var i=0,ilen=asset.opzioni.length;i<ilen;i++) {
		var id=asset.opzioni[i].id;
		var risposta=$('#'+id).val();
		
		
		risposta=$.trim(risposta);
		if (risposta=="") risposta="....................";
		

		risposta=risposta.replace('<','&lt;');
		risposta=risposta.replace('>','&gt;');
		
		var risposta0=risposta;
		
		var giusta=asset.opzioni[i].giusta;
		var giusta0=asset.opzioni[i].giusta;
		
		if (asset.opzioni[i].cs=='0') {
			risposta0=risposta.toUpperCase();
			giusta0=giusta.toUpperCase();
		}
		
		var corrette=giusta.split('|');
		var corrette0=giusta0.split('|');
		
		if (jQuery.inArray(risposta0,corrette0)!=-1) {
			punteggio_esercizio+=1*asset.opzioni[i].punteggio;
		}	
		
		if (rispostautente) rispostautente+='|';
		rispostautente+=risposta;
		
		if (pattern) pattern+='|';
		pattern+=corrette[0];
		
		
	}
	
	asset.rispostautente=rispostautente;
	asset.rispostagiusta=pattern;
	asset.punteggio=punteggio_esercizio;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	
	
	
}

function renderAsset_6() {
	
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni" class="elenco_opzioni">';
	
	
	var voci=asset.voci;
	
	if (voci.length>0) {
		
		if (asset.tentativi==0) {
			$.shuffle(voci);
		} else {
			var checked=asset.rispostautente.split(',');
		}
		
		html+='<ul id="player_tabella_item">';
		if (asset.tentativi==0) {
			for (var i=0,ilen=voci.length;i<ilen;i++) {		
				html+='<li id="r'+voci[i].ord+'" class="rispostautente"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'+voci[i].answer+'</li>';
			}
		} else {
			for (var i=0,ilen=checked.length;i<ilen;i++) {		
				var classe="";
				
				if (i==checked[i]) classe="giusto";	
				
	   			 html+='<li id="r'+checked[i]+'" class="rispostautente '+classe+'"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'+item(checked[i])+'</li>';
			}
		}
 		html+='</ul>';
 		
	}
	
	
	html+='</div>';
	
	
	return html;
}

function salvaAsset_6() {
	var rispostautente='';
	var punteggio_esercizio=0;
	var rispostautente='';
	
	var pattern="";
	
	
	var risposte='';
	
	jQuery('#player_tabella_item li').each(function(index) {
		var id_r=jQuery(this).attr('id');
		if (risposte!='') risposte=risposte+'&';
		risposte=risposte+'player_tabella_item[]='+id_r;	
	});
	
	var voci0=risposte.split('&');
	
	for (var i=0,ilen=voci0.length;i<ilen;i++) {
		
		var el=voci0[i].split('=');
		if (el[1]=='r'+i) {
			punteggio_esercizio+=1*asset.voci[i].fraction;
		}
		if (rispostautente) rispostautente+=',';
		rispostautente+=el[1].substr(1,el[1].length);
		
		if (pattern) pattern+=',';
		pattern+=i;
		
	}
	
	

	asset.rispostautente=rispostautente;
	asset.rispostagiusta=pattern;
	asset.punteggio=punteggio_esercizio;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	
}

function renderSavedAsset_6(soluzioni) {

	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_testo">'+asset.testo+'</div>';
	
	html+='<div id="asset_opzioni" class="elenco_opzioni">';
	
	html+= "<table class=\"tabella_dd\" id=\"player_tabella_item\" cellspacing=\"0\" cellpadding=\"2\">\n";
	
	
	var checked=asset.rispostautente.split(',');
	
	if (soluzioni) {
		
		for (var i=0,ilen=asset.voci.length;i<ilen;i++) {
			html += "<tr>";
			html += "<td class=\"titolo_riga\" >"+item(i)+"</td>";
			html += "</tr>\n";
		}
	} else {
		for (var i=0,ilen=checked.length;i<ilen;i++) {
			
			var ord=checked[i];
		
			var classe="sbagliato";
			if (i==checked[i]) classe="giusto";
	
		
			html += "<tr>";
			html += "<td class=\"titolo_riga "+classe+"\" >"+item(ord)+"</td>";
			html += "</tr>\n";

		}
	}
	html += "</table>\n";
	
	html+='</div>';
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	return html;

}


function renderAsset_19() {
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_opzioni">';
	
	var item=asset.item;
	
	jQuery.shuffle(item);
	 
	
	
	html+='<div id="area_interazione"><ul class="boxy">';
	
	for (var i=0,ilen=item.length;i<ilen;i++) {
		html+='<li id="box_'+item[i].id+'" pos="">'+item[i].testo+'</li>';
	}
	
	html+='</ul>';
	

	html+='<div id="testoDD">'+asset.testo+'</div>';
	
	html+='</div></div>';
	
	
	return html;
}

function initDD() {
	
	  $('ul.boxy li').draggable( {
		containment: 'document',
		cursor: 'move',
		scroll: true,		
	    revert: 'invalid'
	  } );
	  
	  $('ul.boxy li').each(
				 function (index) {
					 var pos=$(this).offset();
					 $(this).attr('pos',pos.top+','+pos.left);
				 }
		 );
	  
	  $('input.inputBoxDD').droppable( {
		    drop: handleDrop,
		    out: handleReset
		  } );

	  function handleDrop( event, ui ) {
		  boxName = document.getElementById($(this).attr("id"));

		  if(0 && boxName.value.length > 0)
		  {			  
			  ui.draggable.draggable( 'option', 'revert', true );
		  }
		  else
		  {
			 
			  	if (boxName.alt!='') {
			  		var el=boxName.alt;
				
				 
			  		var l=$('#'+el).attr("pos");
			  		var lp=l.split(',');
			  		
			  		var x=lp[1];
			  		var y=lp[0];
			  		
			  		if ($('body').hasClass('player-full')) {
			  			x=1*x-272;
			  			y=1*y-60;		
			  		}
			  		
			  		$('#'+el).offset({ top: y, left: x});
				 }	 	
			
			  
		  	boxName.value = ui.draggable.text();
		  	boxName.alt = ui.draggable.attr('id');
		  	
		   	ui.draggable.position( { of: $(this), my: 'center middle', at: 'center middle' } );
		   	ui.draggable.draggable( 'option', 'revert', false );
		  }
		}
	  
	  function handleReset(event, ui) {
		  	boxName = document.getElementById($(this).attr("id"));

			if(ui.draggable.attr('id') == $(this).attr("alt"))
			{
				boxName.value = "";
				boxName.alt = "";
			}
		}				
}

function renderAsset_8() {
	var html="";
	
	html+='<div id="asset_consegna">';
	
	if (asset.consegna!='') html+='<span>'+asset.consegna+'</span>';
	html+='</div>';	
	

	
	html+='<div id="container">';
	html+='<div id="tools">';
	html+='<ul id="label_list"></ul>';
	html+='</div>';
	html+='<div id="image"></div>';
	html+='</div>';
	
	//html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	return html;
}

function salvaAsset_8() {
	var drap=asset.dd.hsList.report();
	var punteggio_esercizio=parseInt(drap['correct']);
	var punteggio_max=parseInt(drap['total']);
	
	asset.rispostautente=asset.dd.getPosizioni();
	asset.punteggio=punteggio_esercizio;
	asset.punteggio_max=punteggio_max;
	
	
}

function renderSavedAsset_8(soluzioni) {
	if (!soluzioni) {
		return renderAsset_8();
		//alert('check');
		//asset.dd.check();
		//asset.dd.setPosizioni(asset.rispostautente);
	} else {
		asset.dd.solution();
	}
}

function salvaAsset_19() {
	var punteggio_esercizio=0;
	var rispostautente="";
	var rispostagiusta="";
	var item=asset.item;
	
	for (var i=0,ilen=item.length;i<ilen;i++) {
		
		if (rispostautente) rispostautente+="|";
		if (rispostagiusta) rispostagiusta+="|";
		
		rispostautente+=jQuery('#drop_'+asset.id+'_'+i).val();
		
		var el=item_id(item,i);
		var testo = jQuery("<div/>").html(el.testo).text();
		
		rispostagiusta+=testo;
		
		if (jQuery('#drop_'+asset.id+'_'+i).val()==testo) {
			punteggio_esercizio+=1*asset.punteggio_spaziodd;
		}
		
	}
	
	
	asset.rispostautente=rispostautente;
	asset.punteggio=punteggio_esercizio;
	punteggio=punteggio_esercizio;
	punteggio_max=asset.punteggio_max;
	

    
}

function renderSavedAsset_19(soluzioni) {
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_opzioni">';
	html+='<ul class="boxy"></ul>';

	
	if (!soluzioni) {
		html+='<div id="testoDD">'+asset.testo+'</div>';
	} else {
		html+='<div id="testoDD">'+replaceFieldsDD(asset)+'</div>';
	}	
	html+='</div>';
	
	html+='<div class="punteggio">Punteggio: '+(1*asset.punteggio).toFixed(2)+'/'+(1*asset.punteggio_max).toFixed(2)+'</div>';
	
	return html;
}


function replaceFieldsDD(a) {
	var testo=(a.testo0);
	
	
	for (var i=0,ilen=a.item.length;i<ilen;i++) {
		
		var campo='drop_'+a.id+'_'+a.item[i].id;
		var valore=a.item[i].testo;
		var c='<span><input type="text" class="inputBoxDD" id="'+campo+'" value="" style="width:'+(a.max_len)*7+'px;" readonly="readonly" /></span>';
		//var c1='<span><input type="text" class="inputBoxDD" id="'+campo+'"\nvalue="" style="width:'+(a.max_len)*7+'px;" readonly="readonly"></span>';
		
		var c0='<span class="giusto">'+valore+'</span>';
	
		testo=testo.replace(c,c0);
		//testo=testo.replace(c1,c0);
		
	}
	
	return testo;
}



function renderAsset_80() {
	var html="";
	
	if (asset.consegna!=undefined && asset.consegna!='') {
		html+='<div id="asset_consegna">';
		html+='<span>'+asset.consegna+'</span>';
		html+='</div>';
	} else {
		html+='<div id="asset_consegna">';
		html+='</div>';
	}
	
	html+='<div id="asset_testo"><div id="testo_libero">'+asset.testo+'</div></div>';

	return html;
}


function renderSavedAsset_80() {
	return renderAsset_80();
}


function item(ord) {
	for (var i=0,ilen=asset.voci.length;i<ilen;i++) {
		if (asset.voci[i].ord==ord) {
			return asset.voci[i].answer;
		}
	}
	return "";
	
}


function aiutiTip(n)
{
	setTimeout(function(){
		$('#hints'+n).qtip({
			content: {
				text: $('.content_aiuto'+n)
			},
			position: {
				my: 'left center',  // Position my top left...
				at: 'right center', // at the bottom right of...
				target: $('#hints'+n), // my target
				viewport: $(window)
			},
			show: {
				event: 'click'
			},
			hide: {
				event: 'click',
				leave: true,
				target: $('#player_contenuto, #hints'+n)
			},
			style: {
				classes: 'ui-tooltip-blue ui-tooltip-shadow'
			}
		});
	},100);	
}

function fback(n) {
	setTimeout(function(){
		var classe_feedback="sbagliato";
		if($('.player_opzione_'+n+'.giusto').length>0){classe_feedback="giusto";}
		$('#lampadina_'+classe_feedback+"_"+n).qtip({
			content: {
				text: $('.feedback'+n)
			},
			position: {
				my: 'left center',  // Position my top left...
				at: 'right center', // at the bottom right of...
				target: $('#lampadina_'+classe_feedback+"_"+n), // my target
				viewport: $(window)
			},
			show: {
				event: 'click mouseenter'
			},
			hide: {
				event: 'click mouseleave',
				leave: true,
				target: $('#player_contenuto, #lampadina_'+classe_feedback+"_"+n)
			},
			style: {
				classes: 'ui-tooltip-blue ui-tooltip-shadow'
			}
		});
	},50);
}

function item_coppia(pos,id) {
	for (var i=0,ilen=asset.coppie.length;i<ilen;i++) {
		if (asset.coppie[i].id==id) {
			if (pos=='sx') {
				return asset.coppie[i].domanda;
			} else {
				return asset.coppie[i].risposta;
			}
		}
	}
	return "";
	
}

function cercaProgGiusto(ord,risposte) {
	var prog=0;
	for (var i=0,ilen=risposte.length;i<ilen;i++) {
		
		var coppia=risposte[i].split("*");
		if (coppia[1]==ord) {
			prog=i+1;
		}
	}	
	return prog;
	
}

function item_id(arr,id) {
	var el;
	for (var i=0,ilen=arr.length;i<ilen;i++) {
		if (arr[i].id==id) {
			el=arr[i];
		}
	}
	return el;
}

function calcolaSizeCampo(valori) {
	
	var a=valori.split("|");
	var max_l=0;
	for (var i=0,ilen=a.length;i<ilen;i++) {
		if (a[i].length>max_l) max_l=a[i].length;
	}
	return max_l+12;
}

function riprova() {
	asset.fatto=0;
	asset_fatti--;
	punteggio_lezione-=1*asset.punteggio;
	asset.punteggio=0;
	progressioneLezione();
	playAsset('riprova');
	$('.punteggio').remove();
}

function soluzioni() {
	if (asset.tipo!=8 && asset.tipo!=9) {
	var html=renderAssetSoluzioni(indice_asset);
	jQuery('#soluzioni').html(html);
	jQuery('#soluzioni').dialog('option','title',pSoluzioni);
	jQuery('#soluzioni').dialog('option','show','fade');
	jQuery('#soluzioni').dialog('option','modal',true);
	jQuery('#soluzioni').dialog('option','width',550);
	jQuery('#soluzioni').dialog('option','height',350);
	jQuery('#soluzioni').dialog('open');
	jQuery('#soluzioni').dialog( "moveToTop" );
	} else {
		if (asset.tipo==8) renderSavedAsset_8(true);
		if (asset.tipo==9) {
			var imgid='#img'+asset.id;
			var giusto="";
			$(imgid).mapster('set_options',{
				render_select: {
        		fillColor: '00ff00'}
			});
			
			$('area').each(function() {
				$(imgid).mapster('set',false,$(this).attr('alt'));	
				if ($(this).attr('href')==1) giusto=$(this).attr('alt');
			});
			
			$(imgid).mapster('set',true,giusto);
			
		}
		
	}
	
	$('.punteggio').hide();

}

function stampa() {
		
}

function popupToggle(qid) {
	var toggle_popup=true;
	
	if (jQuery('#popup_'+qid).is(":visible")) {
		toggle_popup=false;
	}
	
	jQuery('.popup').hide();
	
	if (toggle_popup) {
		jQuery('#popup_'+qid).show();
	
		
		$('#popup_'+qid).position({
		    my:        "left top",
		    at:        "left bottom",
		    of:        '#popuplink_'+qid, 
		    collision: "fit"
		});
		
	}
	
}

function popupNotaToggle(qid) {
	var toggle_popup=true;
	
	if (jQuery('#popupnota_'+qid).is(":visible")) {
		toggle_popup=false;
		jQuery('#popupnota_'+qid).hide();
	}
	
	//jQuery('.popup').hide();
	
	if (toggle_popup) {
		jQuery('#popupnota_'+qid).show();
	
		
		$('#popupnota_'+qid).position({
		    my:        "left top",
		    at:        "left bottom",
		    of:        '#popuplinknota_'+qid, 
		    collision: "fit"
		});
		
	}
	
}
function paginaRiepilogo() {
	
	
	var html='';
	html+='<table style="margin:1em;width:90%;border:none">';
	for (var i=0,ilen=assets.length;i<ilen;i++) {
	
		if (assets[i].tipo!=80) {
			html+='<tr>'; 
			var colore='#000';
			if (!assets[i].fatto) colore='#ccc';
			html+='<td><a href="javascript:void(0);" onclick="playSCO(\'\',\''+assets[i].id+'\');" style="color:'+colore+'">'+assets[i].titolo+'</a></td>';
			
			html+='<td><span style="color:'+colore+'">'+assets[i].punteggio+'/'+assets[i].punteggio_max+'</span></td>';
			html+='</tr>'; 
		}
		
	}
	
	jQuery('#pagina_riepilogo').html(html);
	jQuery('#pagina_riepilogo').dialog('option','title',pRiepilogo);
	jQuery('#pagina_riepilogo').dialog('option','show','fade');
	jQuery('#pagina_riepilogo').dialog('option','modal',true);
	
	jQuery('#pagina_riepilogo').dialog('open');
	jQuery('#pagina_riepilogo').dialog( "moveToTop" );
	
	

}
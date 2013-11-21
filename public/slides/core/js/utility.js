

$(function () {
  var select = $("#minbeds");
  var slider = $("<div id='slider'></div>").insertAfter(select).slider({
    min:1,
    max:6,
    range:"min",
    value:select[ 0 ].selectedIndex + 1,
    slide:function (event, ui) {
      select[ 0 ].selectedIndex = ui.value - 1;
    }
  });
  $("#minbeds").change(function () {
    slider.slider("value", this.selectedIndex + 1);
  });
});

$(function () {
  var select = $("#minbedstwo");
  var slider = $("<div id='slider'></div>").insertAfter(select).slider({
    min:1,
    max:6,
    range:"min",
    value:select[ 0 ].selectedIndex + 1,
    slide:function (event, ui) {
      select[ 0 ].selectedIndex = ui.value - 1;
    }
  });
  $("#minbedstwo").change(function () {
    slider.slider("value", this.selectedIndex + 1);
  });
});

$(function () {
  var select = $("#minbedsthree");
  var slider = $("<div id='slider'></div>").insertAfter(select).slider({
    min:1,
    max:6,
    range:"min",
    value:select[ 0 ].selectedIndex + 1,
    slide:function (event, ui) {
      select[ 0 ].selectedIndex = ui.value - 1;
    }
  });
  $("#minbedsthree").change(function () {
    slider.slider("value", this.selectedIndex + 1);
  });
});

$(function () {
  $("#mainmenu #lidiv").mouseover(function () {
    $("#masking").show();
  })
  $("#mainmenu #lidiv").mouseleave(function () {
    $("#masking").hide();
  })
  $("#mainmenu .ss").click(function () {
    $("#masking").hide();
    $("#menuinner").hide('slide', {direction:'left'}, 150);
    $("#menuss").show();
  })
});

$(document).ready(function () {
							
	
	$('#accordion-1').easyAccordion({ 
			autoStart: true, 
			slideInterval: 3000
	});
	
	$('#accordion-2').easyAccordion({ 
			autoStart: false	
	});
	
	$('#accordion-3').easyAccordion({ 
			autoStart: true,
			slideInterval: 5000,
			slideNum:false	
	}); 
	
	$('#accordion-4').easyAccordion({ 
			autoStart: false,
			slideInterval: 5000
	}); 

  $("div#systempop").click(function () {
    $("#popupmask , #popupp").slideDown('show');
  });
  $("div#closebutton").click(function () {
    $("#popupmask , #popupp").slideUp('hide');
    alert('here');
  });

});

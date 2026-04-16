/**
* Tùy chỉnh javascript
**/
// Hide Header on on scroll down DatLv
$( document ).ready(function() {
$('select.form-control').each(function(){
    
    var $this = $(this), selectOptions = $(this).children('option').length;
    $this.addClass('hide-select'); 
    $this.wrap('<div class="select"></div>');
    $this.after('<div class="custom-select"></div>');

    var $customSelect = $this.next('div.custom-select');
    $customSelect.text($this.children('option').eq(0).text());
  
    var $optionlist = $('<ul />', {
        'class': 'select-options'
    }).insertAfter($customSelect);
  
    for (var i = 0; i < selectOptions; i++) {
        $('<li />', {
            text: $this.children('option').eq(i).text(),
            rel: $this.children('option').eq(i).val()
        }).appendTo($optionlist);
    }
  
    var $optionlistItems = $optionlist.children('li');
  
    $customSelect.click(function(e) {
        e.stopPropagation();
        $('div.custom-select.active').not(this).each(function(){
            $(this).removeClass('active').next('ul.select-options').hide();
        });
        $(this).toggleClass('active').next('ul.select-options').slideToggle();
    });
  
    $optionlistItems.click(function(e) {
        e.stopPropagation();
        $customSelect.text($(this).text()).removeClass('active');
        $this.val($(this).attr('rel'));
        $optionlist.hide();
    });
  
    $(document).click(function() {
        $customSelect.removeClass('active');
        $optionlist.hide();
    });

});
});

$( document ).ready(function() {
    $('body').on('click', '.btn-danhgia-nxet', function (e) {
        $("#comment_reply_wrapper").toggle();
    });
    
    // jquery.cookie plugin không được load trong project này — guard tránh throw
    // block subsequent ready callbacks (hamburger toggle ở dưới).
    if (typeof $.cookie === 'function') {
        var openModalNewYear = $.cookie('modalNewYear');
        if (openModalNewYear == undefined) {
            setTimeout(function () {
                $('#pc_lienhe').css('display', 'block');
                $('#pc_lienhe').animate({ right: '50px' });
            }, 2000);
            $.cookie('modalNewYear', 1, { expires: 1 });
            $.cookie('openPCLienhe', 1, { expires: 1 });
        }
    }
    
    //toggle social lien he
    var d=false;
	$(".close_pc_lienhe").click(function() {	
		$("#pc_lienhe").animate({right:"-400px"});	
		d=false;
	});

	$(".show_pc_lienhe").click(function(){
		if(d==false){
			$("#pc_lienhe").css('display','block');		
			$("#pc_lienhe").animate({right:"50px"});						
			d=true;
		}else{
			$("#pc_lienhe").animate({right:"-400px"});		
			d=false;
		}				
	}); 
    
});

$(document).ready(function(){
    setTimeout(function() { 
        $.ajax({
            type: "POST",
            url: "/app/webroot/html-custom/vie/module_html_custom_116.html",
            dataType : 'html',
            cache: false,
            success : function(html){
                $('head').append(html);
            }
        });
    }, 7000);
});


$(document).ready(function(){
    $(window).scroll(function() {    
       var scroll = $(window).scrollTop();
       if (scroll > 100) {
            $("#header").addClass("fix");
            $(".header-main").addClass("fix");
       } else {
            $("#header").removeClass("fix");
        	$(".header-main").removeClass("fix");
       }
    });
});
    

var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('.header-main').outerHeight();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();
    
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.

    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('.nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('.nav-down').removeClass('nav-up');
        } 
    }
    
    lastScrollTop = st;
}

$(document).on('click', '[nh-active-tab]', function(e) {
     var id_read_more = $(this).attr('nh-active-tab');
     $('[nh-tab-read-more]').hide();
     $('[nh-tab-read-more="' + id_read_more + '"]').show();
});

$(document).on('click', '[nh-active-tab-left]', function(e) {
     var id_read_more = $(this).attr('nh-active-tab');
     $('[nh-tab-read-more-left]').hide();
     $('[nh-tab-read-more-left="' + id_read_more + '"]').show();
});


$(document).on('click', '[nh-submit-tracuu]', function(e) {
    var form = $(this).closest('[form-phongthuy]')
    $.ajax({
            type: "POST",
            url: "/tra-cuu-phong-thuy",
            data: form.serialize() + '&type=' + form.attr('form-phongthuy'),
            dataType : 'html',
            success : function(html){
                $('#display_tracuu_phongthuy [ketqua-tracuu-phongthuy]').html(html);
                $('#display_tracuu_phongthuy').modal('show');
            }
    });
    return false;
});

$(document).on('click','[nh-toggle]', function(e){
    $('.scoll-right-bottom').toggleClass('none-scoll');
});
$(document).ready(function () {
    var this_url = document.location.href;
    $( ".wsmenu-list > li > .navtext" ).each(function() {
        var url_manu_this = $(this).attr('href');
        if(url_manu_this == this_url){
            $( this ).addClass( "active" );
        }
    });
    $('.content-house').find('iframe').wrap( "<div class='wrap-iframe'></div>" );
});

$(document).on('click','[nh-share-icon]', function(e){
    $('.share-product').toggleClass('show');
});

function loadModal() {
    var elementButton = $('[data-show-modal]');
    var wrapModal = $('#nhModalCustom');

    if (wrapModal.length == 0 && elementButton.length == 0) return false;

    elementButton.click(function() {
        var _idBlock = $(this).attr('href');
        
        if (typeof(_idBlock) == 'undefined' || _idBlock == null || _idBlock == '') return false;
        
        $.ajax({
            type: "POST",
            url: "contact/ContactBlock/contactBlock/" + _idBlock,
            dataType : 'html',
            cache: false,
            success : function(html){
                wrapModal.find('.modal-body').html(html);
                wrapModal.modal('show');
            }
        });
        
        return false;
    });

    
}

$(document).ready(function(){
    loadModal();
});
// WS Menu off-canvas drawer toggle — event delegation trên document
// để hoạt động bất kể thời điểm DOM hydrate hay JS chạy trước/sau.
$(document).on('click', '#wsnavtoggle', function (e) {
    e.preventDefault();
    $('.wsmenucontainer.menu-fix-mobile').toggleClass('wsoffcanvasopener');
});
$(document).on('click', '.menu-fix-mobile .overlapblackbg', function () {
    $('.wsmenucontainer.menu-fix-mobile').removeClass('wsoffcanvasopener');
});
$(document).on('click', '.menu-fix-mobile .wsmenu-list > li > a', function () {
    // Chỉ đóng khi link KHÔNG dẫn tới submenu (không có angle-down icon)
    if ($(this).find('.fa-angle-down').length === 0) {
        $('.wsmenucontainer.menu-fix-mobile').removeClass('wsoffcanvasopener');
    }
});

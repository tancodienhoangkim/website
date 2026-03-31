$(document).ready(function () {
  AOS.init({ duration: 800, once: true });

  $('.hero-carousel').owlCarousel({
    items: 1, loop: true, autoplay: true, autoplayTimeout: 5000,
    animateOut: 'fadeOut', animateIn: 'fadeIn',
    nav: true, navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'], dots: true,
  });

  $('.construction-carousel').owlCarousel({
    loop: true, autoplay: true, autoplayTimeout: 4000, margin: 20,
    nav: true, navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: { 0: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } },
  });

  $('.testimonial-carousel').owlCarousel({
    items: 1, loop: true, autoplay: true, autoplayTimeout: 6000,
    nav: false, dots: true, margin: 30,
    responsive: { 0: { items: 1 }, 768: { items: 2 } },
  });

  $('.press-carousel, .partners-carousel').owlCarousel({
    loop: true, autoplay: true, autoplayTimeout: 3000, margin: 30,
    nav: false, dots: false,
    responsive: { 0: { items: 2 }, 576: { items: 3 }, 768: { items: 4 }, 992: { items: 5 } },
  });

  if ($.fancybox) $.fancybox.defaults.hash = false;

  var counted = false;
  function animateCounters() {
    if (counted) return;
    var s = $('.section-stats');
    if (!s.length) return;
    if ($(window).scrollTop() + $(window).height() > s.offset().top + 100) {
      counted = true;
      $('.stat-number').each(function () {
        var $t = $(this), target = parseInt($t.data('count'), 10);
        $({ c: 0 }).animate({ c: target }, {
          duration: 2000, easing: 'swing',
          step: function () { $t.text(Math.floor(this.c) + '+'); },
          complete: function () { $t.text(target + '+'); },
        });
      });
    }
  }
  $(window).on('scroll', animateCounters);
  animateCounters();

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 300) $('#backToTop').fadeIn().css('display', 'flex');
    else $('#backToTop').fadeOut();
  });
  $('#backToTop').on('click', function (e) { e.preventDefault(); $('html, body').animate({ scrollTop: 0 }, 600); });

  function handleContactForm(sel, resultSel) {
    $(sel).on('submit', function (e) {
      e.preventDefault();
      var $f = $(this), $btn = $f.find('[type="submit"]'), $r = $f.find(resultSel);
      $btn.prop('disabled', true).text('Đang gửi...');
      $.ajax({
        url: '/api/contact', method: 'POST', data: $f.serialize(), dataType: 'json',
        success: function (res) { $r.html('<div class="alert alert-success">' + res.message + '</div>'); $f[0].reset(); },
        error: function (xhr) { var m = xhr.responseJSON ? xhr.responseJSON.error : 'Có lỗi xảy ra'; $r.html('<div class="alert alert-danger">' + m + '</div>'); },
        complete: function () { $btn.prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Gửi'); },
      });
    });
  }
  handleContactForm('#contactForm', '#contactResult');
  handleContactForm('#footerContactForm', '#footerContactResult');
});

$(document).ready(function () {
  // Highlight active sidebar link
  const path = window.location.pathname;
  $('.admin-sidebar .nav-link').each(function () {
    if (path === $(this).attr('href') || (path.startsWith($(this).attr('href')) && $(this).attr('href') !== '/admin')) {
      $(this).addClass('active');
    }
  });

  // TinyMCE rich text editor
  if (typeof tinymce !== 'undefined' && document.querySelector('.tinymce')) {
    tinymce.init({
      selector: '.tinymce',
      height: 400,
      plugins: 'lists link image code table',
      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
      menubar: false,
    });
  }
});

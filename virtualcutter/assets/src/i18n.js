(function(){

var i18n = i18n || {};

$(document).ready(function() {
  
  // First, determine the language.
  var lang = i18n.detectLanguage();
  
  // Next replace all element innerHTML.
  $('.i18n').each(function() {
    
  });
});

i18n.detectLanguage = function() {
  var langs = [];
  var lang = (navigator.userLanguage || navigator.systemLanguage || navigator.browserLanguage || navigator.language);
  var parts = lang.split('-');
  langs.push(lang);
  langs.push(parts[0]);
  return langs;
};
  
})(jQuery);

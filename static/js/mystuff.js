jQuery(document).ready(function($) {

  for (var currlist of ['white','black','gray']) {
    loadlist(currlist);
  };

  $('#manualcheckbutton').on('click', function(){
    newwindow=window.open($(this).attr('href'),'','height=700,width=900,scrollbars=yes,resizable=yes,location=yes,status=yes,toolbar=yes');
    if (window.focus) {newwindow.focus()}
    $('#btnWhiteList').prop('disabled', false);
    $('#btnGrayList').prop('disabled', false);
    $('#btnBlackList').prop('disabled', false);
    return false;
  });

  $('#pruefModal').on('shown.bs.modal', function () {
    $('#pruefModalDecideBtn').prop('disabled', true);
    $('#pruefModalAlert').toggleClass('alert', false);
    $('#pruefModalAlert').toggleClass('alert-success', false);
    $('#pruefModalAlert').toggleClass('alert-danger', false);
    $('#pruefModalAlert').toggleClass('alert-warning', false);
    $('#pruefModalDecideBtn').text('Decide');
    var input = $('#InputEmail').val();
    var queryDomain = '';
    var result = '';
    var atsymb = input.indexOf("@");
    if (input == '') { $('#pruefModalAlert').text('Keine Eingabe.')}
    else { 
      if (atsymb < 0) { $('#pruefModalAlert').text('Kein @ enthalten.')}
      else {
        queryDomain = input.substring(atsymb);
        $.ajax({
          dataType: 'json',
          url: 'api/',
          type: 'GET',
          data: 'list='+queryDomain,
          success: function(data) { 
            $('#pruefModalDecideBtn').prop('disabled', false);
            $('#pruefModalDecideBtn').attr("data-domain", queryDomain);
            $('#pruefModalAlert').toggleClass('alert', true);
            $('#pruefModalAlert').toggleClass('alert-success', false);
            $('#pruefModalAlert').toggleClass('alert-danger', false);
            $('#pruefModalAlert').toggleClass('alert-warning', true);
            result = 'Domain ' + queryDomain + ' unbekannt!';
            if (data.white) {
              $('#pruefModalAlert').toggleClass('alert', true);
              $('#pruefModalAlert').toggleClass('alert-success', true);
              $('#pruefModalAlert').toggleClass('alert-danger', false);
              $('#pruefModalAlert').toggleClass('alert-warning', false);
              $('#pruefModalDecideBtn').text('Ändern');
              result = 'Domain ' + queryDomain + ' ist auf Whitelist!';
            }
            if (data.gray) {
              $('#pruefModalAlert').toggleClass('alert', true);
              $('#pruefModalAlert').toggleClass('alert-success', false);
              $('#pruefModalAlert').toggleClass('alert-danger', false);
              $('#pruefModalAlert').toggleClass('alert-warning', true);
              $('#pruefModalDecideBtn').text('Ändern');
              result = 'Domain ' + queryDomain + ' ist auf Graylist!';
            }
            if (data.black) {
              $('#pruefModalAlert').toggleClass('alert', true);
              $('#pruefModalAlert').toggleClass('alert-success', false);
              $('#pruefModalAlert').toggleClass('alert-danger', true);
              $('#pruefModalAlert').toggleClass('alert-warning', false);
              $('#pruefModalDecideBtn').text('Ändern');
              result = 'Domain ' + queryDomain + ' ist auf Blacklist!';
            }
            $('#pruefModalAlert').text(result);
          }
        });
      }
    }
  });

  $('#decideModal').on('show.bs.modal', function(e) {
    var queryDomain = $(e.relatedTarget).attr('data-domain')
    $('#btnWhiteList').prop('disabled', true);
    $.ajax({
        dataType: 'json',
        url: 'api',
        type: 'GET',
        data: 'edugain='+queryDomain,
        success: function(data) { 
          if (data.edugain || data.federation) {
            $('#checkEduresultAlert').toggleClass('alert-success', true);
            $('#checkEduresultAlert').html('<b>Domain '+queryDomain+' hat den eduGain-Test bestanden!</b>');
            $('#btnWhiteList').prop('disabled', false);
          } else {
            $('#checkEduresultAlert').html('Domain '+queryDomain+' hat den eduGain-Test <b>nicht</b> bestanden!');
          }
        }
      });

    $('#btnWhiteList').prop('disabled', true);
    $('#btnGrayList').prop('disabled', true);
    $('#btnBlackList').prop('disabled', true);
    $('#decideModalTitle').text(queryDomain);
    $('input.domainname').val(queryDomain);
    $('#manualcheckbutton').attr("href", 'http://'+queryDomain.replace('@',''));
  });

  $('#decideModal').on('hidden.bs.modal', function(e) {
    $('#checkEduresultAlert').toggleClass('alert-success', false);
    $('#checkEduresultAlert').html('Teste eduGain ... <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>');
  });

  $('#refreshmailsModal').on('show.bs.modal', function(e) {
    $('#refreshmailsModalText').html('Wirklich alle Mailadressen im LDAP suchen und gegen Listen mappen? <button type="button" class="btn btn-warning" id="refreshmailsModalButton">Ja!</button>');

    $('#refreshmailsModalButton').on('click', function(){
      $('#refreshmailsModalText').html('Working ... <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>');

      $.ajax({
        dataType: 'json',
        url: 'api/refresh',
        type: 'GET',
        success: function(data) { 
          console.log(data);
          $('#refreshmailsModalText').html('Adressen auf der Whitelist: '+data['mails_on_whitelist']+' <br/>Adressen auf der Blacklist: '+data['mails_on_blacklist']+' <br/>Adressen noch in der Graylist: '+data['mails_on_graylist']+' <br/>E-Mail-Adressen von bislang unbekannten Domains: '+data['mails_from_new_domains']);
        }
      });



    });

  });


});

function loadlist(currlist) {
  $.getJSON( 'api/list/'+currlist, function( data ) {
    var items = [];
    $.each( data, function( key, val ) {
      items.push('<a data-domain="'+val+'" data-toggle="modal" href="#decideModal" class="list-group-item">'+val+'</a>')
    });
    $('#'+currlist+'list').append(items);
    $('#'+currlist+'number').text(items.length);
  });
};


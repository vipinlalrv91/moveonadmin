document.write('<script type="text/javascript" src="/assets/toaster.js" ></script>');
function infoToast(message){
    Swal.fire(
        '',
        message,
        'info');
  }
  function waringToast(message){
    Swal.fire(
        '',
        message,
        'waring');
  }
  function successToast(message){
    Swal.fire(
        '',
        message,
        'success');
  }
  function errorToast(message){
    Swal.fire(
        '',
        message,
        'error');
  }
  var segment_str = window.location.pathname; // return segment1/segment2/segment3/segment4
  var segment_array = segment_str.split( '/' );
  var last_segment = segment_array.pop();
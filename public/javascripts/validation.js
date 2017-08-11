$('#addReview').submit(function(e){
    //listen for submit event of review form
    $('.alert.alert-danger').hide();
    if (!$('input#Name').val() || !$('select#Rating').val() || !$('textarea#review').val()) {
        //show or inject error if any value is missing
        if($('.alert.alert-danger').length){
            $('alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, complete required fields and try again</div>');
        }
        //prevent form from submitting
        return false
    }
})
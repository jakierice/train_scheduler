$(document).foundation();

var db = firebase.database();

$('#addTrainButton').click(function () {
    // $('#addTrainForm').show('slow');
    $('#addTrainForm').toggle('slow');
})

$('#addTrainSubmit').click(function (e) {
    e.preventDefault();
    var train = {
        name: $('#trainName').val().trim(),
        destination: $('#trainDestination').val().trim(),
        time: $('#trainTime').val().trim(),
        frequency: $('#trainFrequency').val().trim()
    }

    if (train.name !== '' && train.destination !== '' && train.time !== '' && train.frequency !== '') {
        db.ref('/trains').push(train);

        $('#trainName').val('');
        $('#trainDestination').val('');
        $('#trainTime').val('');
        $('#trainFrequency').val('');

        $('#addTrainForm').hide('slow');
    } else {
        alert("Please input train information.");
    }
})

db.ref('/trains').orderByChild('name').on('child_added', function (train) {
    var trainInfo = train.toJSON();
    // console.log(trainInfo);

    var trainCard = $('<div id="' + train.key + '" ontouchstart="this.classList.toggle("hover");">');
    var trainCardInner = $('<div>');
    var trainCardFront = $('<div>');
    var trainCardBack = $('<div>');
    var trainStatus = $('<h5>').attr('id', train.key + 'Status');
    var trainNext = $('<h5>').attr('id', train.key + 'Next');

    trainCard.addClass('small-12 medium-4 large-3 cell trainCard flip-card')

    trainCardFront.addClass('flip-card-inner-front')
        .append('<span><h3>' + trainInfo.name + '</h3> <h6>to</h6> <h4>' + trainInfo.destination + '</h4></span>')
        .attr('data-key', train.key);

    trainCardBack.addClass('flip-card-inner-back')
        .append('<h4>' + trainInfo.destination + '</h4>')
        .append('<h6>Runs every ' + trainInfo.frequency + ' minutes</h6>')
        .append(trainStatus)
        .append(trainNext)
        .append('<button type="button" class="button">Remove</button>')

    trainCardInner.addClass('flip-card-inner')
        .append(trainCardFront)
        .append(trainCardBack)

    trainCard
        .append(trainCardInner);

    $('#trains').append(trainCard);
    $('#trains').animate({
        opacity: 1.0
    }, 800);
})

function trainTime() {
    db.ref('/trains').on('child_added', function (train) {
        var key = train.key;
        var trainInfo = train.toJSON();
        // Store everything into a variable.

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(trainInfo.time, "hh:mm").subtract(1, "years");
        // Current Time
        var currentTime = moment();
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % trainInfo.frequency;
        // Minute Until Train
        var nextTrain = trainInfo.frequency - tRemainder;
        // Next Train
        var updateNextTrain = moment().add(nextTrain, "minutes").format("hh:mm A");

        // Update train status based on remaining time till next train
        var status = "On Time";

        if (nextTrain > 2 && nextTrain < 10) {
            status = "Now Boarding";
            $('#' + train.key + 'Status').css('color', '#009FB7');
            $('#' + train.key).css('border', '4px solid #009FB7');
        } else if (nextTrain > 1 && nextTrain < 3) {
            status = "Final Boarding";
            $('#' + train.key + 'Status').css('color', '#FDE95C');
            $('#' + train.key).css('border', '4px solid #FDE95C');
        } else if (nextTrain < 2) {
            status = "Departing";
            $('#' + train.key + 'Status').css('color', '#FB4D3D');
            $('#' + train.key).css('border', '4px solid #FB4D3D');
        } else {
            $('#' + train.key + 'Status').css('color', 'white');
            $('#' + train.key).css('border', '3px solid white');
        };

        $('#' + train.key + 'Status').html(status);
        $('#' + train.key + 'Next').html('Departs in ' + nextTrain + ' minutes');
    });
}

trainTime();

function refreshTrainInfo() {
    clockInterval = setInterval(function () {
        trainTime();
    }, 1000 * 60);
}

refreshTrainInfo();

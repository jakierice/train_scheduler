$(document).foundation();

var db = firebase.database();

$('#addTrainButton').click(function () {
    $('#addTrainForm').show('slow');
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

db.ref('/trains').on('child_added', function (train) {
    var trainInfo = train.toJSON();
    // console.log(trainInfo);

    var trainCard = $('<div>');
    var trainStatus = $('<h5>').attr('id', train.key + 'Status');
    var trainNext = $('<h5>').attr('id', train.key + 'Next');

    trainCard.addClass('small-12 medium-4 large-3 cell trainCard')
        .attr('data-key', train.key);

    trainCard.append('<h3>' + trainInfo.name + '</h3>')
        .append('<h4>' + trainInfo.destination + '</h4>')
        .append('<h6>Runs every ' + trainInfo.frequency + ' minutes</h6>')
        .append(trainStatus)
        .append(trainNext)

    $('#trains').append(trainCard);
})

function trainTime() {
    db.ref('/trains').on('child_added', function (train) {
        var key = train.key;
        var trainInfo = train.toJSON();
        // Store everything into a variable.

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(trainInfo.time, "hh:mm").subtract(1, "years");
        // console.log(firstTimeConverted);
        // Current Time
        var currentTime = moment();
        // console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // console.log("DIFFERENCE IN TIME: " + diffTime);
        // Time apart (remainder)
        var tRemainder = diffTime % trainInfo.frequency;
        // console.log(tRemainder);
        // Minute Until Train
        var updatetMinutesTillTrain = trainInfo.frequency - tRemainder;
        // console.log("MINUTES TILL TRAIN: " + updatetMinutesTillTrain);
        // Next Train
        var updatenextTrain = moment().add(updatetMinutesTillTrain, "minutes").format("hh:mm A");
        // console.log("ARRIVAL TIME: " + updatenextTrain);

        // Update train status based on remaining time till next train
        var status = "On Time";

        if (updatetMinutesTillTrain > 2 && updatetMinutesTillTrain < 10) {
            status = "All Aboard";
        } else if (updatetMinutesTillTrain > 1 && updatetMinutesTillTrain < 3) {
            status = "Final Boarding";
        } else if (updatetMinutesTillTrain < 2) {
            status = "Departing";
        };

        $('#' + train.key + 'Status').html(status);
        $('#' + train.key + 'Next').html('Next Train in: ' + updatetMinutesTillTrain + ' minutes');
    });
}

trainTime();

function refreshTrainInfo() {
    clockInterval = setInterval(function () {
        trainTime();
    }, 1000 * 60);
}

refreshTrainInfo();

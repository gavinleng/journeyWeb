/*
 * Created by my on 11/12/15.
 */


$(function() {
    var dialog, form,

        gtype = $("#gtype"),
        gformation = $("#gformation"),
        btime = $("#btime"),
        etime = $("#etime"),
        allFields = $([]).add(gtype).add(gformation).add(btime).add(etime),
        tips = $(".validateTips");

    btime.datepicker({
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dateFormat: 'dd/mm/yy'
    });

    etime.datepicker({
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dateFormat: 'dd/mm/yy'
    });

    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    var yesterday = (currentDate.getDate() < 10 ? "0" : "") + currentDate.getDate() + "/" +  ((currentDate.getMonth() + 1) < 10 ? "0" : "") + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();

    etime.prop('value', yesterday);

    $("#gpstable").prop('disabled', true);

    var journeyAPI = setAPI.GPSData.sort(function(a, b) {
        return a.Id - b.Id;
    });

    for (var i = 0; i < journeyAPI.length; i++) {
        gtype.append($('<option>', {
            value: i + 1,
            text: "GPS" + journeyAPI[i].Id
        }));
    }

    function updateTips(t) {
        tips.text(t).addClass("ui-state-highlight");
        setTimeout(function() {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, num) {
        var otext = o.val().trim();

        if (otext.length != num) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be " + num + ", iuput by click the calendar.");

            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, n) {
        var otext = o.val().trim();
        otext = otext.split('/');

        if (otext.length != 3) {
            o.addClass("ui-state-error");
            updateTips(n);

            return false;
        }

        if ((/^\d{2}$/.test(otext[0])) && (/^\d{2}$/.test(otext[1])) && (/^\d{4}$/.test(otext[2]))) {

            return true;
        } else {
            o.addClass("ui-state-error");
            updateTips(n);

            return false;
        }
    }

    function validCheck() {
        var valid = true;

        allFields.removeClass("ui-state-error");

        if (gtype.val() == "0") {
            gtype.addClass("ui-state-error");
            updateTips("Please choose the GPS Data.");

            return false;
        }

        if (gformation.val() == "0") {
            gformation.addClass("ui-state-error");
            updateTips("Please choose the GPS Data formation.");

            return false;
        }

        valid = valid && checkLength(btime, "Begin Time", 10);
        valid = valid && checkLength(etime, "End Time", 10);

        valid = valid && checkRegexp(btime, "Please iuput by click the calendar.");
        valid = valid && checkRegexp(etime, "Please iuput by click the calendar.");

        return valid;
    }

    function reqsent() {
        var flagFormation;

        $("#gpstable").val("1");
        $("#gpstable").removeClass('darken-2');

        var text1 = '<h5>&nbsp;&nbsp;GPS Data Table OFF</h5>';
        d3.select("#gtable").html(text1);

        if (typeof tt2 != "undefined") tt2.remove();
        if (typeof myGrid2 != "undefined") myGrid2.remove();
        if (typeof tt3 != "undefined") tt3.remove();
        if (typeof myGrid3 != "undefined") myGrid3.remove();

        d3.select(".myhtml1").html("");
        if (typeof myGrid1 != "undefined") myGrid1.remove();

        var reqlist = btime.val().trim();
        reqlist = reqlist.split('/');

        var startTime = (new Date(reqlist[2], +reqlist[1] - 1, reqlist[0], 00, 00, 00)).getTime();

        reqlist = etime.val().trim();
        reqlist = reqlist.split('/');

        var endTime = (new Date(reqlist[2], +reqlist[1] - 1, reqlist[0], 23, 59, 59)).getTime();

        var currentTime = (new Date()).getTime();

        if (startTime > currentTime) {
            alert("Cannot set the start time after today. Please check the time setting.");

            gpsreload();

            return false;
        }

        if (endTime > currentTime) {
            alert("The end time cannot after the current time. Setting the end time as the current time.");

            endTime = currentTime;
        }

        // Setting base url.
        for (var i = 0; i < journeyAPI.length; i++) {
            if (gtype.find('option:selected').text() == "GPS" + journeyAPI[i].Id) {
                var counturl = 'http://q.nqminds.com/v1/datasets/' + journeyAPI[i].gpsDataId + '/count';
                var baseurl = 'http://q.nqminds.com/v1/datasets/' + journeyAPI[i].gpsDataId + '/data';

                if (gformation.val() == 1) {
                    var journeyurl = 'http://q.nqminds.com/v1/datasets/' + journeyAPI[i].splitDataId + '/data';
                    flagFormation = false;
                }

                if (gformation.val() == 2) {
                    var journeyurl = 'http://q.nqminds.com/v1/datasets/' + journeyAPI[i].simplifyDataId + '/data';
                    flagFormation = true;
                }
            }
        }

        var textString1 = '  <h5>&nbsp;&nbsp;' + gtype.find('option:selected').text() + ' (' + gformation.find('option:selected').text() + ')</h5>';

        var textString = '  Date from ' + btime.val() + ' to ' + etime.val();

        var loadMsg = '<h5><strong style="color: #FB3802">&nbsp;&nbsp;GPS Data Loading---</strong></h5>';
        $("#gData").html(loadMsg);

        $("#gpsconfig, #gpstable").prop('disabled', true);

        // Get the count.
        d3.json(counturl, function(error, countData) {
            if (error) {
                alert(error);
                console.warn(error);

                gpsreload();

                return false;
            }

            var count = countData.count;

            baseurl += '?opts={"limit":' + count + '}';

            var filterurl = 'filter={"timestamp":{"$gte":' + startTime + ',"$lte":' + endTime + '}}';
            var gpsurl = baseurl + '&' + filterurl;

            //get the GPS data.
            d3.json(gpsurl, function(error, gData) {
                if (error) {
                    alert(error);
                    console.warn(error);

                    gpsreload();

                    return false;
                }

                var gpsData = gData.data;

                gpsData = gpsData.sort(function(a, b) {
                    return a.timestamp - b.timestamp;
                });

                if (gpsData.length == 0) {
                    alert("No gps data in the given time period. Please check the time setting.");

                    gpsreload();

                    return false;
                }

                journeyurl += '?opts={"limit":' + count + '}';

                filterurl = 'filter={"start":{"$gte":' + startTime + '},"end":{"$lte":' + endTime + '}}';
                var journeyurl1 = journeyurl + '&' + filterurl;

                // Get the splitting or simplified data.
                d3.json(journeyurl1, function(error, jData) {
                    if (error) {
                        alert(error);
                        console.warn(error);

                        gpsreload();

                        return false;
                    }

                    var journeyData = jData.data;

                    journeyData = journeyData.sort(function(a, b) {
                        return a.start - b.start;
                    });

                    if (journeyData.length == 0) {
                        alert("No journey data in the given time period. Please check the time setting.");

                        gpsreload();

                        return false;
                    }

                    if ((gpsData[0].timestamp < journeyData[0].start) || (gpsData[gpsData.length - 1].timestamp > journeyData[journeyData.length - 1].end)) {

                        filterurl = 'filter={"$or":[{"end":{"$gte":' + gpsData[0].timestamp + ',"$lt":' + journeyData[0].start + '}},{"start":{"$gt":' + journeyData[journeyData.length - 1].end + ',"$lte":' + gpsData[gpsData.length - 1].timestamp + '}}]}';
                        var journeyurl2 = journeyurl + '&' + filterurl;

                        // Get the splitting or simplified data.
                        d3.json(journeyurl2, function(error, jData1) {
                            if (error) {
                                alert(error);
                                console.warn(error);

                                gpsreload();

                                return false;
                            }

                            var jjData = jData1.data;

                            if (jjData.length > 0) {
                                for (var i = 0; i < jjData.length; i++) {
                                    journeyData.push(jjData[i]);
                                }
                            }

                            sendData(gpsData, journeyData, flagFormation, textString, textString1);
                        });
                    } else {
                        sendData(gpsData, journeyData, flagFormation, textString, textString1);
                    }
                });
            });
        });
    }

    function sendData(gpsData, journeyData, flagFormation, textString, textString1) {
        $("#gData").html(textString1);

        $("#gpsconfig, #gpstable").prop('disabled', false);

        getDataTotal(gpsData, journeyData, flagFormation, textString);
    }

    function gpsreload() {
        var optslength = gtype.find('option').length;

        for (var i = 1; i < optslength; i++) {
            gtype.find('option[value=' + i + ']').attr("selected", false);
        }

        optslength = gformation.find('option').length;

        for (var i = 1; i < optslength; i++) {
            gformation.find('option[value=' + i + ']').attr("selected", false);
        }

        window.location.reload();
    }

    function getAPIData() {
        var valid = validCheck();

        if (valid) {
            clickCount = -1;

            reqsent();

            dialog.dialog("close");
        }

        return valid;
    }

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 400,
        width: 260,
        modal: true,
        buttons: {
            "Submit": getAPIData,
            "Cancel": function() {
                dialog.dialog("close");
            }
        },
        close: function() {
            var optslength = gtype.find('option').length;

            for (var i = 1; i < optslength; i++) {
                if (i != gtype.val()) {
                    gtype.find('option[value=' + i + ']').attr("selected", false);
                }
            }

            optslength = gformation.find('option').length;

            for (var i = 1; i < optslength; i++) {
                if (i != gformation.val()) {
                    gformation.find('option[value=' + i + ']').attr("selected", false);
                }
            }

            gtype.find('option[value=' + gtype.val() + ']').attr("selected", "selected");
            gformation.find('option[value=' + gformation.val() + ']').attr("selected", "selected");
            btime.attr("value", btime.val());
            etime.attr("value", etime.val());
            $("#gpsconfig").prop('disabled', false);

            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function(event) {
        event.preventDefault();
        getAPIData();
    });

    $("#gpsconfig").button().on("click", function() {
        dialog.dialog("open");
    });
});

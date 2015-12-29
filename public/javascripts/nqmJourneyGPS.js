/*
 * Created by my on 11/12/15.
 */


function fLineData(data, simplifiedIndex) {
    var i, ii;
    var len = simplifiedIndex.length;
    var lineData = [];

    for (i = 0; i < len; i++) {
        ii = +simplifiedIndex[i];

        lineData.push([+data[ii - 1].lat, +data[ii - 1].lon]);
    }

    return lineData;
} //end fLineData

function mapShowInit() {
    map = L.map('map').setView([50.96139, -1.42528], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'gleng.c0d22786',
        accessToken: 'pk.eyJ1IjoiZ2xlbmciLCJhIjoiYTczMjU0YTlhZTY2YTQyZjYyN2Q1YTZmNzhiZDlhOWQifQ.DPM1q1yqXNGi1FT-sNA9qQ'
    }).addTo(map);

    L.control.scale().addTo(map);
} //end mapShowInit

function mapShow(lineData, jNumber, components, jType) {
    var polyline = L.polyline(lineData, {
        color: 'red',
        weight: 2,
        opacity: .5
    }).addTo(map).bindPopup("Journey " + jNumber);

    components.push(polyline);

    map.fitBounds(polyline.getBounds(), {
        padding: [60, 60]
    });

    var popup = L.popup();

    var label = L.marker(lineData[0]).addTo(map)
        .bindPopup("Journey " + jNumber + "<br />Start").openPopup();

    components.push(label);

    if (jType === "moving") {
        var j = 0;

        var myIcon = L.icon({
            iconUrl: 'images/car211.png',
            iconSize: [18, 26]
        });

        var marker = L.marker(lineData[0], {
            icon: myIcon,
            opacity: 0.4
        }).addTo(map);

        components.push(marker);


        var timeStep = 5000 / (lineData.length);

        markerMoving();


    }

    function markerMoving() {
        marker.setLatLng(lineData[j]);

        if (++j < lineData.length) {
            setTimeout(markerMoving, timeStep)
        }
    }

    return components;
} //end mapShow

function journeyData(data, indexData, flagFormation) {
    function formatter(row, cell, value, columnDef, dataContext) {
        return "<u>Journey " + (value + 1) + "</u>";
    }

    var columns1 = [{
        id: "no",
        name: "No.",
        field: "no",
        width: 90,
        sortable: true,
        formatter: formatter
    }, {
        id: "type",
        name: "Type",
        field: "type",
        width: 90
    }, {
        id: "start",
        name: "Start",
        field: "start",
        width: 50
    }, {
        id: "end",
        name: "End",
        field: "end",
        width: 50
    }];

    var columns2 = [{
        id: "order",
        name: "Order",
        field: "order",
        width: 108
    }, {
        id: "speed",
        name: "Speed",
        field: "speed",
        width: 108
    }, {
        id: "time",
        name: "Time",
        field: "time",
        width: 180
    }, {
        id: "lat",
        name: "Lat",
        field: "lat",
        width: 103
    }, {
        id: "lon",
        name: "Lon",
        field: "lon",
        width: 103
    }];

    var columns3 = [{
        id: "no",
        name: "No.",
        field: "no",
        width: 95
    }, {
        id: "order",
        name: "Order",
        field: "order"
    }, {
        id: "speed",
        name: "Speed",
        field: "speed"
    }, {
        id: "time",
        name: "Time",
        field: "time",
        width: 160
    }, {
        id: "lat",
        name: "Lat",
        field: "lat",
        width: 88
    }, {
        id: "lon",
        name: "Lon",
        field: "lon",
        width: 88
    }];


    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false
    };

    var options3 = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        autoHeight: true
    };


    var isAsc = true;
    var len = indexData.length;
    var tdata1 = [];
    for (var i = 0; i < len; i++) {
        tdata1[i] = {
            no: i,
            type: indexData[i].type,
            start: indexData[i].start,
            end: indexData[i].end
        };
    }

    len = tdata1.length;
    if (len > 19) {
        d3.select("#myGrid1").style("height", "500px");

        options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };
    } else {
        d3.select("#myGrid1").style("height", "auto");

        options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoHeight: true
        };
    }

    function getItem(index) {
        return isAsc ? tdata1[index] : tdata1[(tdata1.length - 1) - index];
    }

    function getLength() {
        return tdata1.length;
    }

    grid1 = new Slick.Grid("#myGrid1", {
        getLength: getLength,
        getItem: getItem
    }, columns1, options);

    grid1.onSort.subscribe(function(e, args) {
        currentSortCol = args.sortCol;
        isAsc = args.sortAsc;
        grid1.invalidateAllRows();
        grid1.render();
    });

    if (flagFormation[1]) {
        len = data.length;
        var tdata2 = [];
        for (var i = 0; i < len; i++) {
            tdata2[i] = {
                order: data[i].order,
                speed: data[i].speed,
                time: (new Date(+data[i].timestamp)).toISOString(),
                lat: data[i].lat,
                lon: data[i].lon
            };
        }

        len = tdata2.length;
        if (len > 19) {
            d3.select("#myGrid2").style("height", "500px");

            options = {
                enableCellNavigation: true,
                enableColumnReorder: false
            };
        } else {
            d3.select("#myGrid2").style("height", "auto");

            options = {
                enableCellNavigation: true,
                enableColumnReorder: false,
                autoHeight: true
            };
        }


        var grid2 = new Slick.Grid("#myGrid2", tdata2, columns2, options);

        if (flagFormation[0]) {
            var grid3 = new Slick.Grid("#myGrid3", [{}], columns3, options3);
        }
    }

    mapShowInit();

    var components = [];
    var row = 0;

    $('.slick-cell').mouseenter(function() {
        $(this.parentNode.children).addClass('slick-cell-hovered');
    });

    $('.slick-cell').mouseleave(function() {
        $(this.parentNode.children).removeClass('slick-cell-hovered');
    });

    if (clickCount >= 0) {
        row = clickCount;

        grid1.scrollRowToTop(row);

        journeyShow();
    }

    grid1.setSelectionModel(new Slick.CellSelectionModel());

    grid1.onDblClick.subscribe(function() {
        if (grid1.getActiveCell()) {
            row = grid1.getActiveCell().row;
            col = grid1.getActiveCell().cell;

            if (+col == 0) {
                for (i = 0; i < components.length; i++) {
                    map.removeLayer(components[i]);
                }

                var rowValue = grid1.getDataItem(row);
                row = +rowValue.no;

                clickCount = row;

                journeyShow();
            }
        }
    });

    function journeyShow() {
        var journeyNumber = +row + 1;
        if ((journeyNumber < 1) || (journeyNumber > indexData.length)) {
            throw new Error('Invalid journey');
        }

        var simplifiedIndex = [];

        components = [];

        if (flagFormation[1]) {
            grid2.scrollRowToTop(+indexData[row].start - 1);

            if (flagFormation[0]) {
                simplifiedIndex = indexData[journeyNumber - 1].simplify;
                var tdata3 = [];
                var iorder;

                len = simplifiedIndex.length;

                for (i = 0; i < len; i++) {
                    iorder = +simplifiedIndex[i];

                    tdata3[i] = {
                        no: (i + 1),
                        order: iorder,
                        speed: data[iorder - 1].speed,
                        time: (new Date(+data[iorder - 1].timestamp)).toISOString(),
                        lat: data[iorder - 1].lat,
                        lon: data[iorder - 1].lon
                    };
                }

                if (len > 19) {
                    d3.select("#myGrid3").style("height", "500px");

                    options3 = {
                        enableCellNavigation: true,
                        enableColumnReorder: false
                    };
                } else {
                    d3.select("#myGrid3").style("height", "auto");

                    options3 = {
                        enableCellNavigation: true,
                        enableColumnReorder: false,
                        autoHeight: true
                    };
                }

                grid3 = new Slick.Grid("#myGrid3", tdata3, columns3, options3);
            } else {
                for (i = indexData[journeyNumber - 1].start; i < (indexData[journeyNumber - 1].end + 1); i++) {
                    simplifiedIndex.push(i);
                }
            }
        } else {
            if (flagFormation[0]) {
                simplifiedIndex = indexData[journeyNumber - 1].simplify;
            } else {
                for (i = indexData[journeyNumber - 1].start; i < (indexData[journeyNumber - 1].end + 1); i++) {
                    simplifiedIndex.push(i);
                }
            }
        }

        var lineData = fLineData(data, simplifiedIndex);

        var jType = indexData[journeyNumber - 1].type;
        components = mapShow(lineData, journeyNumber, components, jType);

        $('.slick-cell').mouseenter(function() {
            $(this.parentNode.children).addClass('slick-cell-hovered');
        });

        $('.slick-cell').mouseleave(function() {
            $(this.parentNode.children).removeClass('slick-cell-hovered');
        });

        d3.selectAll(".jNumber").text('  Journey ' + (+row + 1) + ' from ' + (new Date(+data[indexData[journeyNumber - 1].start - 1].timestamp)).toISOString() + ' to ' + (new Date(+data[indexData[journeyNumber - 1].end - 1].timestamp)).toISOString());

    }
} //end journeyData

function draw(data, indexData, flagFormation, textString) {
    if (typeof map != "undefined") map.remove();
    if (typeof myGrid1 != "undefined") myGrid1.remove();
    if (typeof tt2 != "undefined") tt2.remove();
    if (typeof myGrid2 != "undefined") myGrid2.remove();
    if (typeof tt3 != "undefined") tt3.remove();
    if (typeof myGrid3 != "undefined") myGrid3.remove();

    var myhtml1 = '<label>Journey list:<span id="gDate"></span></label><div id="myGrid1" style="width: 300px;"></div>';
    d3.select(".myhtml1").html(myhtml1);

    if (flagFormation[1]) {
        var myhtml2 = '<label id="tt2">All GPS data list:</label><div id="myGrid2" style="width:623px;"></div>';
        d3.select(".myhtml2").html(myhtml2);

        if (flagFormation[0]) {
            var myhtml3 = '<label id="tt3">Simplified journey data list:<span class="jNumber"></span></label><div id="myGrid3" style="width:613px;"></div>';
            d3.select(".myhtml3").html(myhtml3);
        }
    }

    d3.select("#gDate").html(textString);

    journeyData(data, indexData, flagFormation);
} //end draw

function initial() {
    mapShowInit();
} //end initial

function getDataTotal(gpsData, journeyData, flag, text) {
    var data1 = gpsData.sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });

    var jdata = journeyData.sort(function(a, b) {
        return a.start - b.start;
    });

    flagFormation = [];
    flagFormation[0] = flag;
    flagFormation[1] = false;

    textString = text;

    var i;
    var len = data1.length;

    data = [];

    for (i = 0; i < len; i++) {
        data.push({
            order: (i + 1),
            speed: data1[i].speed,
            timestamp: data1[i].timestamp,
            lat: data1[i].lat,
            lon: data1[i].lon
        });
    }

    indexData = journeyDataOrder(data, jdata, flagFormation);

    draw(data, indexData, flagFormation, textString);
} //end getDataTotal

function journeyDataOrder(data, jdata, flagFormation) {
    var start, end, numStart, numEnd;

    var len = jdata.length;
    var indexData = [];

    for (var i = 0; i < len; i++) {
        start = jdata[i].start;
        end = jdata[i].end;

        numStart = data.filter(function(item) {
            return item.timestamp == start;
        });

        numEnd = data.filter(function(item) {
            return item.timestamp == end;
        });

        indexData.push({
            order: (i + 1),
            type: jdata[i].status,
            start: numStart[0].order,
            end: numEnd[0].order
        });

        if (flagFormation[0]) {
            var numStartS, sData, len1, j;
            var startS = [];

            start = jdata[i].simplify[0].data;

            startS = $.map(start, function(value, index) {
                return [value];
            });

            startS = startS.sort(function(a, b) {
                return a - b
            });

            len1 = startS.length;

            sData = [];

            for (j = 0; j < len1; j++) {
                numStartS = data.filter(function(item) {
                    return item.timestamp == startS[j];
                });

                sData.push(numStartS[0].order);
            }

            indexData[i].simplify = sData;
        }
    }

    return indexData;
} //end journeyDataOrder

function updateData() {
    var tableValue = $("#gpstable").val();

    if (tableValue == 1) {
        flagFormation[1] = true;
        draw(data, indexData, flagFormation, textString);

        $("#gpstable").val("0");
        $("#gpstable").addClass('darken-2');

        var text1 = '<h5>&nbsp;&nbsp;GPS Data Table ON</h5>';
        d3.select("#gtable").html(text1);
    } else {
        flagFormation[1] = false;
        draw(data, indexData, flagFormation, textString);

        $("#gpstable").val("1");
        $("#gpstable").removeClass('darken-2');

        var text1 = '<h5>&nbsp;&nbsp;GPS Data Table OFF</h5>';
        d3.select("#gtable").html(text1);
    }
} //end updateData

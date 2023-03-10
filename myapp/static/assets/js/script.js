// Load jQuery library
$.getScript("{% static 'js/jquery-3.4.1.min.js' %}", function () {
  console.log("jQuery loaded.");
});

// Load Highcharts library
$.getScript("https://code.highcharts.com/highcharts.js", function () {
  console.log("Highcharts loaded.");
});

// Load Highcharts series label module
$.getScript("https://code.highcharts.com/modules/series-label.js", function () {
  console.log("Highcharts series label module loaded.");
});

// Construct URLSearchParams object instance from current URL querystring
let queryParams = new URLSearchParams(window.location.search);
var reportType = "long";
// Set new or modify existing page value
queryParams.set("reportType", reportType);

if (queryParams.get("reportType") == "long") {
  var CareGiverIncentiveId = `<div class="CaregiverIncentiveLong" ><div class="CaregiverIncentiveContainer"> <div class="HeadingSubNew">Caregiver Incentive Categories</div><div class="CaregiverIncentive_content">
              <div class="PieChart  ChartBlock">
                <h2>This period <span>Dec 01, 2021 - Dec 31, 2021</span></h2>
                <div id="container"></div>
              </div>
              <div class="LineChart  ChartBlock">
                <h2>Total trend since start of program</h2>
                <div id="LineChartN"></div>
              </div>
            </div>
          </div>
          <div class="LegendBottom">
          </div></div>`;
  $("#caregiverIncentiveId").html(CareGiverIncentiveId);
} else if (queryParams.get("reportType") == "short") {
  var CareGiverIncentiveId = `<div class="CaregiverIncentiveShort" ><div class="CaregiverIncentiveContainer"><div class="HeadingSubNew">Caregiver Incentive Categories</div><div class="CaregiverIncentive_content"><div class="PieChart  ChartBlock"><h2>This period <span>Dec 01, 2021 - Dec 31, 2021</span></h2><div id="container"></div>
              </div>
              <div class="LineChart  ChartBlock">
                <h2>Total trend since start of program</h2>
                <div id="LineChartN"></div>
              </div>
            </div>
          </div>
          <div class="LegendBottom">
          </div></div>`;
  $("#caregiverIncentiveId").html(CareGiverIncentiveId);
}

// Replace current querystring with the new one
history.replaceState(null, null, "?" + queryParams.toString());

//  line chart First

JSON_NAME = "{% static 'JSON/Arosa-data.json' %}";
INCENTIVE_TO_TEXT = {
  REGISTER: { text: "Register", color: "#5260DA" },
  ADD_CARE_LOG_REPORT: { text: "Check In/Out", color: "#4AD2AD" },
  ADD_RISK_REPORT: { text: "Risk Reporting", color: "#FE7D7A" },
  ADD_INCIDENT_REPORT: { text: "Incident Reporting", color: "#F8BC32" },
  SAVE_REVIEW: { text: "Caregiver Rating", color: "#444A6F" },
  WEEKLY_ATTENDANCE: { text: "Weekly Attendance", color: "#00ADEE" },
  MONTHLY_ATTENDANCE: { text: "Monthly Attendance", color: "#A2F9EE" },
  UPLOAD_COVID_STATUS: { text: "COVID-19 Vaccination", color: "#BA4BD1" },
  ANNUAL_WELLNESS_VISIT: { text: "Annual Wellness Visits", color: "#FF8517" },
  GIFT: { text: "One Time Reward", color: "#FFC5C5" },
  BIRTHDAY_REWARD: { text: "Birthday", color: "#CEEFA8" },
  WORK_ANNIVERSARY_REWARD: { text: "Work Anniversary", color: "#6D6D6D" },
  WEEKEND_SHIFT_REWARD: { text: "Weekend Shifts", color: "#FFEA24" },
  EXTRA_SHIFT_ATTENDANCE: { text: "Extra Shifts", color: "#AAB3FF" },
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$.getJSON(JSON_NAME, function (report) {
  $("#agencyCareCoinBalance").text(
    numberWithCommas(
      report.program_summary.incentive_graph.outstanding_care_coin_balance
    )
  );
  $("#redemptionLiability").text(
    numberWithCommas(
      report.program_summary.incentive_graph.redemption_liability
    )
  );
});

incentiveVsRedemptionGraph = Highcharts.chart("incentiveVsRedemptionGraph", {
  chart: {
    type: "spline",
    height: 250,
    width: 550,
    marginRight: 50,
  },
  title: {
    text: "",
  },
  subtitle: {
    text: "",
  },
  xAxis: {
    labels: {
      rotation: 0,
      style: {
        textOverflow: "none",
        whiteSpace: "nowrap",
      },
      formatter: function () {
        if (this.isLast || this.isFirst) {
          return this.value.replace("_", " ");
        }
      },
    },
  },
  yAxis: {
    title: {
      text: "",
    },
    labels: {
      formatter: function () {
        return this.value + "";
      },
    },
  },
  tooltip: {
    crosshairs: false,
    shared: false,
  },
  plotOptions: {
    spline: {
      marker: {
        radius: 4,
        lineColor: "",
        lineWidth: 1,
      },
    },
  },
  credits: {
    enabled: false,
  },
  series: [
    {
      name: "",
      marker: {
        symbol: "circle",
      },
      data: [],
      lineWidth: 5,
      color: "#3fe4b7",
      showInLegend: false,
    },
    {
      name: "",
      data: [],
      lineWidth: 5,
      color: "#00adee",
      showInLegend: false,
    },
  ],
});
INCENTIVE_GRAPH_CATEGORIES = {
  "Program start": {
    redeem_key: "program_start_redeemed",
    earned_key: "program_start_earned",
  },
  "Last 90 days": {
    redeem_key: "last_90_days_redeemed",
    earned_key: "last_90_days_earned",
  },
  "Last 60 days": {
    redeem_key: "last_60_days_redeemed",
    earned_key: "last_60_days_earned",
  },
  "This period": {
    redeem_key: "last_30_days_redeemed",
    earned_key: "last_30_days_earned",
  },
};
$.getJSON(JSON_NAME, function (jsonData) {
  redeemData = [];
  earnedData = [];
  xseries = [];
  for (key in jsonData.program_summary.incentive_graph_monthly) {
    xseries.push(key);
    redeemData.push(
      jsonData.program_summary.incentive_graph_monthly[key]["redeemed"]
    );
    earnedData.push(
      jsonData.program_summary.incentive_graph_monthly[key]["earned"]
    );
  }
  incentiveVsRedemptionGraph.xAxis[0].setCategories(xseries);
  incentiveVsRedemptionGraph.series[0].setData(earnedData);
  incentiveVsRedemptionGraph.series[1].setData(redeemData);
});

// <!-- end -->

// <!-- Spark line -->

var clientName = "";
$.getJSON(JSON_NAME, function (jsonData) {
  clientName = jsonData.client_name;
});
// sparkline
Highcharts.SparkLine = function (a, b, c) {
  const hasRenderToArg = typeof a === "string" || a.nodeName;
  let options = arguments[hasRenderToArg ? 1 : 0];
  const defaultOptions = {
    chart: {
      renderTo:
        (options.chart && options.chart.renderTo) || (hasRenderToArg && a),
      backgroundColor: "#f7f7f7",
      borderWidth: 0,
      type: "area",
      margin: [2, 0, 2, 0],
      width: 120,
      height: 69,
      style: {
        overflow: "visible",
      },
      // small optimalization, saves 1-2 ms each sparkline
      skipClone: true,
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      startOnTick: false,
      endOnTick: false,
      tickPositions: [],
    },
    yAxis: {
      endOnTick: false,
      startOnTick: false,
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      tickPositions: [0],
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      hideDelay: 0,
      outside: true,
      shared: true,
    },
    plotOptions: {
      series: {
        animation: false,
        lineWidth: 1,
        shadow: false,
        name: "",
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        marker: {
          radius: 0,
          states: {
            hover: {
              radius: 0,
            },
          },
        },
        fillOpacity: 0.25,
      },
      column: {
        negativeColor: "green",
        borderColor: "red",
      },
    },
  };

  options = Highcharts.merge(defaultOptions, options);

  return hasRenderToArg
    ? new Highcharts.Chart(a, options, c)
    : new Highcharts.Chart(options, b);
};

let n = 0;

function doChunk() {
  const start = +new Date(),
    tds = Array.from(document.querySelectorAll("td[data-sparkline]")),
    fullLen = tds.length;
  const time = +new Date(),
    len = tds.length;

  for (let i = 0; i < len; i += 1) {
    const td = tds[i];
    const stringdata = td.dataset.sparkline;
    const arr = stringdata.split("; ");
    const data = arr[0].split(",").map(parseFloat);
    const chart = {};

    if (arr[1]) {
      chart.type = arr[1];
    }

    Highcharts.SparkLine(td, {
      series: [
        {
          data: data,
          pointStart: 1,
        },
      ],
      tooltip: {
        headerFormat: "",
        pointFormat: "",
      },
      chart: chart,
    });

    n += 1;
    var timeoutDuration = 500;

    if (clientName == "CapRock") timeoutDuration = 9000;
    // If the process takes too much time, run a timeout to allow interaction with the browser
    if (new Date() - time > timeoutDuration) {
      tds.splice(0, i + 1);
      setTimeout(doChunk, 0);
      break;
    }
  }
}
// doChunk();
// </script>
// <!-- End -->

// <!-- End -->
// <!-- Line Chart Second -->
// <script>
// line chart

var trendChart = Highcharts.chart("LineChartN", {
  chart: {
    width: 450,
    height: 330,
  },
  title: {
    text: "",
  },

  subtitle: {
    text: "",
  },
  yAxis: {
    title: {
      text: "",
    },
  },

  xAxis: {
    categories: [],
    startOnTick: true,
    endOnTick: true,
    labels: {
      rotation: 0,
      style: {
        textOverflow: "none",
        whiteSpace: "nowrap",
      },
      formatter: function () {
        if (this.isFirst) {
          return "Program Start";
        }
        if (this.isLast) {
          return "Now";
        }
      },
    },
  },

  plotOptions: {
    series: {
      label: {
        connectorAllowed: false,
      },

      colors: ["#3fe4b7", "#6675dd", "#febb3d", "#ff7c7c", "#a6a8ab"],
      showInLegend: false,
      marker: {
        enabled: false,
      },
    },
  },
  credits: {
    enabled: false,
  },

  series: [],

  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 500,
        },
        chartOptions: {
          legend: {
            display: false,
          },
        },
      },
    ],
  },
});
// </script>
// <script>
// Set this to the width of one star.
var starWidth = 25;

$.fn.stars = function () {
  return $(this).each(function () {
    $(this).html(
      $("<span />").width(
        Math.max(0, Math.min(5, parseFloat($(this).html()))) * starWidth
      )
    );
  });
};
$(document).ready(function () {
  $("span.stars").stars();
});
// </script>

// <script>
checkInCheckOutSparkLineData = [];
missedShiftsSparkLineData = [];
avgHoursPerCaregiverSparkLineData = [];
$.getJSON(JSON_NAME, function (report) {
  $.each(report.program_summary.shift_summary, function (index, value) {
    if (
      value.hasOwnProperty("check_in_check_out") &&
      value.hasOwnProperty("missed_shift") &&
      value.hasOwnProperty("avg_hours")
    ) {
      checkInCheckOutSparkLineData.push(value.check_in_check_out);
      missedShiftsSparkLineData.push(value.missed_shift);
      avgHoursPerCaregiverSparkLineData.push(value.avg_hours);
    }
  });
  var agencyTrend =
    '<div class="LeftSideWrapMiddle"><p class="H_txt">This Period</p><ul class="Middle_Listing">' +
    '<li><div class="ListLeft"><h2>' +
    report.program_summary.shift_summary.check_in_check_out +
    "%</h2><span>Successful Check-in/Out</span> </div></li>";

  if (report.missed_shift) {
    agencyTrend +=
      '<li><div class="ListLeft"><h2>' +
      report.program_summary.shift_summary.missed_shift +
      "</h2><span>Missed Shifts</span> </div></li>";
  }

  agencyTrend +=
    '<li><div class="ListLeft"><h2>' +
    report.program_summary.shift_summary.avg_hours +
    "</h2><span>Avg Hours/caregiver</span> </div></li></ul>" +
    '</div><div class="RightSideMiddleWrapList"><p class="H_txt">From Start of Program</p><div class="ListRight"><div class="Chart"><table id="table-sparkline">' +
    '<tbody id="tbody-sparkline">' +
    '<tr><td data-sparkline="' +
    checkInCheckOutSparkLineData +
    '"><td class=' +
    (report.program_summary.shift_summary.check_in_check_out_percentage < 0
      ? '"Per Red"'
      : '"Per Green"') +
    ">" +
    report.program_summary.shift_summary.check_in_check_out_percentage +
    "% " +
    "<i class=" +
    (report.program_summary.shift_summary.check_in_check_out_percentage < 0
      ? '"fas fa-long-arrow-alt-down"'
      : '"fas fa-long-arrow-alt-up"') +
    "></i></td></td></tr>";

  if (report.missed_shift) {
    agencyTrend +=
      '<tr><td data-sparkline="' +
      missedShiftsSparkLineData +
      '"><td class=' +
      (report.program_summary.shift_summary.missed_shift_percentage < 0
        ? '"Per Red"'
        : '"Per Green"') +
      ">" +
      report.program_summary.shift_summary.missed_shift_percentage +
      "% " +
      "<i class=" +
      (report.program_summary.shift_summary.missed_shift_percentage < 0
        ? '"fas fa-long-arrow-alt-down"'
        : '"fas fa-long-arrow-alt-up"') +
      "></i></td></td></tr>";
  }
  agencyTrend +=
    '<tr><td data-sparkline="' +
    avgHoursPerCaregiverSparkLineData +
    '"><td class=' +
    (report.program_summary.shift_summary.avg_hours_percentage < 0
      ? '"Per Red"'
      : '"Per Green"') +
    ">" +
    report.program_summary.shift_summary.avg_hours_percentage +
    "% " +
    "<i class=" +
    (report.program_summary.shift_summary.avg_hours_percentage < 0
      ? '"fas fa-long-arrow-alt-down"'
      : '"fas fa-long-arrow-alt-up"') +
    "></i></td></td></tr>" +
    "</tbody></table></div></div></div>";
  $("#agencyTrend").html(agencyTrend);

  // Redemption Card

  var redemptionCardsHeader =
    '<p class="Heading_rp">Total Redemptions this Period</p><ul>';
  var redemptionCardsFooter = "</ul>";
  var redemptionCardsDiv = redemptionCardsHeader;
  Object.entries(
    report.program_summary.redemption_summary.gift_card_details
  ).map(([key, giftCardDetails]) => {
    const giftCardKeys = Object.keys(giftCardDetails);
    const giftCardValues = Object.values(giftCardDetails);
    var cleanedKey = key.match("(.*)Gift") || key.match("(.*)Card");
    console.log(cleanedKey[1]);
    const arrangedCleanedKey = cleanedKey[1].split(" ");
    var giftCardValueInDollar = arrangedCleanedKey[0];
    var giftCardCompanyName = arrangedCleanedKey.slice(1).join(" ");
    redemptionCardsDiv +=
      "<li><p>" + giftCardCompanyName + " - " + giftCardValueInDollar + "</p>";
    redemptionCardsDiv += '<div class="right-redemption-input">';
    giftCardKeys.forEach((item, index) => {
      if (item.includes("Dollar"))
        redemptionCardsDiv +=
          '<span class="redemption-gift-card-dollar">$' +
          giftCardValues[index] +
          "</span>";
      if (item.includes("Percentage"))
        redemptionCardsDiv +=
          '<span class="redemption-gift-card-percentage">' +
          giftCardValues[index] +
          "%</span>";
    });
    redemptionCardsDiv += "</div></li>";
  });
  redemptionCardsDiv += redemptionCardsFooter;
  $(".Redemptions_Period").html(redemptionCardsDiv);
  doChunk();
});
// </script>
// <script>
window.onload = function () {
  //number reprentation
  function numberWithCommas(x) {
    if (typeof x !== "undefined") {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  // function addLink(caregiver_id, caregiver_name) {
  //   return '<a href="#' + caregiver_id + '">' + caregiver_name + '</a>';
  // }

  function showStarIcons(rating) {
    var starNumber = Math.round(rating);
    var starImages = "";
    for (let i = 0; i < starNumber; i++) {
      starImages +=
        '<img src="assets/images/star_solid.png" alt="" class="img-star">';
    }
    return starImages;
  }

  function showStarIcons2(rating) {
    var starNumber = Math.round(rating);
    var starImages = "";
    var emptyStar = 5 - starNumber;
    for (let i = 0; i < starNumber; i++) {
      starImages +=
        '<img src="assets/images/star_solid.png" alt="" class="img-star">';
    }
    for (let i = 0; i < emptyStar; i++) {
      starImages +=
        '<img src="assets/images/star-o-white.svg" alt="" class="img-star">';
    }

    return starImages;
  }

  function formatDateddmmyyyy(date) {
    if (typeof date !== "undefined") {
      let newDate = new Date(date);
      const yyyy = newDate.getFullYear();
      let mm = newDate.getMonth() + 1; // Months start at 0!
      let dd = newDate.getDate();
      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;
      return dd + "/" + mm + "/" + yyyy;
    }
  }

  function formatDatemmddyyyy(date) {
    if (typeof date !== "undefined") {
      let newDate = new Date(date);
      const yyyy = newDate.getFullYear();
      let mm = newDate.getMonth() + 1; // Months start at 0!
      let dd = newDate.getDate();
      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;
      return mm + "/" + dd + "/" + yyyy;
    }
  }

  function formatDateByMonthddyyyy(date) {
    if (typeof date !== "undefined") {
      let newDate = new Date(date);
      Date.shortMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let month = Date.shortMonths[newDate.getMonth()];
      let yyyy = newDate.getFullYear();
      let dd = newDate.getDate();
      return month + " " + dd + ", " + yyyy;
    }
  }

  //Get JSON
  $.getJSON(JSON_NAME, function (jsonData) {
    //sample JSON
    var report = jsonData;
    $(".Date, .CaregiverIncentive_content .ChartBlock h2 span").html(
      formatDateByMonthddyyyy(report.from_date) +
        " - " +
        formatDateByMonthddyyyy(report.to_date)
    );

    $(".report-date").html(
      "Date: " + report.from_date + " - " + report.to_date
    );

    $(".AgencyName").html(report.client_name);

    $(".CostPeriod").html(
      "$" + numberWithCommas(report.program_summary.fee_summary.total_fee)
    );

    $(".RewardRedeemed").html(
      "$" +
        numberWithCommas(report.program_summary.fee_summary.value_of_rewards)
    );
    $(".ProgramFee").html(
      "$" + numberWithCommas(report.program_summary.fee_summary.program_fee)
    );

    $(".IncidentReport").html(
      numberWithCommas(report.program_summary.caregiver_summary.incident_report)
    );

    $(".RiskReportsData").html(
      numberWithCommas(report.program_summary.caregiver_summary.risk_report)
    );

    $(".percent_rate").html(
      numberWithCommas(report.program_summary.incentive_graph.redemption_rate) +
        "%"
    );

    $(".RegisteredCar").html(
      numberWithCommas(
        report.program_summary.caregiver_summary.registered_caregiver_percentage
      ) + "%"
    );

    $(".TotalEligibleCaregivers").html(
      numberWithCommas(
        report.program_summary.caregiver_summary.eligible_caregiver
      )
    );

    $(".ParticipatingBranches").html(
      numberWithCommas(report.program_summary.caregiver_summary.branch_count)
    );

    $(".VaccinatedBoosted").html(
      numberWithCommas(
        report.program_summary.caregiver_summary.vaccinated_percentage
      ) + "%"
    );

    $(".RatingNumber").html(
      report.program_summary.caregiverRating.avg_caregiver_rating
    );

    $(".emptystarsdraw").html(
      showStarIcons2(
        report.program_summary.caregiverRating.avg_caregiver_rating
      )
    );

    $("#incentives-heading").html(
      "Incentives for " + report.from_date + " - " + report.to_date
    );
    $(".sub-header span").html(report.client_name);

    // pie chart
    incentiveCategoriesChart = Highcharts.chart("container", {
      chart: {
        type: "pie",
        width: 450,
        height: 350,
      },

      title: {
        text: "",
      },
      subtitle: {
        text: "",
      },

      accessibility: {
        announceNewData: {
          enabled: true,
        },
        point: {
          valueSuffix: "%",
        },
      },

      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: "{point.name}<br> {point.y:.1f}%",
          },
          colors: [
            "#3fe4b7",
            "#6675dd",
            "#febb3d",
            "#ff7c7c",
            "#a6a8ab",
            "navy",
          ],
        },
        pie: {
          startAngle: 90,
        },
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        headerFormat: '<span style="font-size:14px">{series.name}</span><br>',
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span> <b>{point.y:.2f}%</b> of total<br/>',
      },

      series: [
        {
          name: "This period",
          colorByPoint: true,

          data: [],
        },
      ],
    });
    var starWidth = 25;
    $.fn.stars = function () {
      return $(this).each(function () {
        $(this).html(
          $("<span />").width(
            Math.max(0, Math.min(5, parseFloat($(this).html()))) * starWidth
          )
        );
      });
    };
    $(document).ready(function () {
      $("span.stars").stars();
    });
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var currentYearDiv = document.getElementById("current-year");
    currentYearDiv.innerHTML = currentYear;

    // LegendBottom
    //incetiveCategoryChart
    var pieSeriesData = [];
    var legend = "<h6>Legend</h6><ul>";
    var first5Elements = 0;
    var other = 0;
    $.getJSON(JSON_NAME, function (report) {
      $.each(
        report.program_detail.incentive_categories,
        function (categoryName, value) {
          if (INCENTIVE_TO_TEXT.hasOwnProperty(categoryName)) {
            legend +=
              '<li style="--category-color: ' +
              INCENTIVE_TO_TEXT[categoryName].color +
              '">' +
              INCENTIVE_TO_TEXT[categoryName].text +
              " <span>" +
              value.percentage +
              "%</span></li>";
          }
          if (first5Elements < 5) {
            pieSeriesData.push({
              name: INCENTIVE_TO_TEXT[categoryName].text,
              y: value.percentage,
              color: INCENTIVE_TO_TEXT[categoryName].color,
            });
          } else {
            other += value.percentage;
          }
          first5Elements++;
        }
      );
      pieSeriesData.push({ name: "Other", y: other, color: "#A6A8AB" });
      legend += "</ul>";
      $(".LegendBottom").html(legend);
      incentiveCategoriesChart.series[0].setData(pieSeriesData);
    });

    $.getJSON(JSON_NAME, function (report) {
      datapoints = {};
      xseries = [];
      $.each(report.program_detail.trend, function (key, values) {
        xseries.push(key);
        $.each(values, function (index, value) {
          if (!datapoints.hasOwnProperty(value.rewardActivityType)) {
            datapoints[value.rewardActivityType] = [];
          }
          datapoints[value.rewardActivityType].push(value.creditedCareCoins);
        });
      });

      trendChart.xAxis[0].setCategories(xseries);
      trendChartSeries = [];
      var i = 0;
      $.each(datapoints, function (categoryName, dataPoint) {
        while (dataPoint.length < xseries.length) {
          dataPoint.unshift(0);
        }
        trendChartSeries.push({
          // "name":  INCENTIVE_TO_TEXT[categoryName].text,
          name: "",
          data: dataPoint,
          color: INCENTIVE_TO_TEXT[categoryName]
            ? INCENTIVE_TO_TEXT[categoryName].color
            : "",
        });
      });
      trendChart.update(
        {
          series: trendChartSeries,
        },
        true,
        true
      );
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////
    //branch table 1
    var branchTable = "";

    Object.entries(report.program_detail.branch_wise).map(
      ([key, brancheDetails]) => {
        branchTable +=
          "<tr><td>" +
          (key, key) +
          "</td><td>" +
          numberWithCommas(brancheDetails.eligible_caregiver) +
          "</td><td>" +
          numberWithCommas(brancheDetails.registered_percentage) +
          "%</td><td>$" +
          numberWithCommas(brancheDetails.reward_redemeed_period) +
          "</td><td>$" +
          numberWithCommas(brancheDetails.reward_redemmed_total) +
          "</td></tr>";
      }
    );
    //replace tbody

    $("#branch-table1 TBODY").html(branchTable);
    if (queryParams.get("reportType") == "long") {
      //branch table 2
      var branchPage = "<div id = 'branch-page'>";

      var branchPageHeaderConst = "";
      branchPageHeaderConst +=
        '<div class="ProGramSummary Padding_Wrap FourthSection page-break mt0"><div class="CADProcess"><div class="Heading_Wrap_Star"><div class="LeftWrapHead">';

      Object.entries(report.agency_branch_details).map(
        ([key, brancheDetails]) => {
          var currentKey = key;
          var branchPageRatingConst =
            '<div class="Rating"><div class="RatingWithHeading"><ul class="StarIco"><li>' +
            showStarIcons(brancheDetails.avg_caregiver_rating) +
            '</li></ul><span class="branch-rating">' +
            brancheDetails.avg_caregiver_rating +
            '</span><h5 class="RatingNumber"></h5></div><p class="RatingTxt">Average Caregiver Rating</p></div></div>';

          branchPage +=
            branchPageHeaderConst +
            '<h2 class="HeadingWrap d-flex" id=' +
            key.replaceAll(/\s/g, "") +
            ">" +
            key.toString() +
            "</h2></div>";
          branchPage += branchPageRatingConst;

          branchPage +=
            '<div class="MiddleHEading d-flex"> Program Summary</div><div class="Flex-Wrap"><div class="Left_Wrap"><div class="LeftMiddle"><ul class="Listing"><li> <img src="assets/images/doll.png"><div class="Txt"><p>Rewards Redeemed this Period</p><h2>';
          branchPage +=
            "$" +
            numberWithCommas(brancheDetails.program_summary.reward_redeemed_$) +
            "</h2></div></li>";

          branchPage +=
            '<li> <img src="assets/images/Registered.png"><div class="Txt"><p>Registered Caregivers</p><h2>';
          branchPage +=
            brancheDetails.program_summary.registered_percentage +
            "%</h2></div></li>";

          branchPage +=
            '<li> <img src="assets/images/not-register.png"><div class="Txt"><p>Total Eligible Caregivers</p><h2>';
          branchPage +=
            numberWithCommas(
              brancheDetails.program_summary.eligible_caregivers_count
            ) + "</h2></div></li></ul></div></div>";

          //RIGHTSIDE-BRANCH-PAGE
          checkInCheckOutSparkLineData = [];
          missedShiftsSparkLineData = [];
          avgHoursPerCaregiverSparkLineData = [];
          $.each(brancheDetails.shift_summary, function (index, value) {
            if (
              value.hasOwnProperty("check_in_check_out") &&
              value.hasOwnProperty("missed_shift") &&
              value.hasOwnProperty("avg_hours")
            ) {
              checkInCheckOutSparkLineData.push(value.check_in_check_out);
              missedShiftsSparkLineData.push(value.missed_shift);
              avgHoursPerCaregiverSparkLineData.push(value.avg_hours);
            }
          });
          branchPage +=
            '<div class="Right_Wrap"> <div class="Middle_Wrap_Right"> <div class="LeftSideWrapMiddle"> <p class="H_txt">This Period</p><ul class="Middle_Listing"> ' +
            '<li> <div class="ListLeft"> <h2>' +
            brancheDetails.shift_summary.check_in_check_out +
            "%</h2> <span>Successful Check-in/Out</span> </div></li>";

          if (report.missed_shift) {
            branchPage +=
              '<li> <div class="ListLeft"> <h2>' +
              brancheDetails.shift_summary.missed_shift +
              "</h2> <span>Missed Shifts</span> </div></li>";
          }

          branchPage +=
            '<li> <div class="ListLeft"> <h2>' +
            brancheDetails.shift_summary.avg_hours +
            "</h2> <span>Avg Hours/caregiver</span> </div></li></ul> </div>" +
            '<div class="RightSideMiddleWrapList"> <p class="H_txt">From Start of Program</p><div class="ListRight"> <div class="Chart"> ' +
            '<table id="table-sparkline"> <tbody id="tbody-sparkline">' +
            '<tr> <td data-sparkline="' +
            checkInCheckOutSparkLineData +
            '"> <td class=' +
            (brancheDetails.shift_summary.check_in_check_out_percentage < 0
              ? '"Per Red"'
              : '"Per Green"') +
            ">" +
            brancheDetails.shift_summary.check_in_check_out_percentage +
            "% " +
            "<i class=" +
            (brancheDetails.shift_summary.check_in_check_out_percentage < 0
              ? '"fas fa-long-arrow-alt-down"'
              : '"fas fa-long-arrow-alt-up"') +
            "></i></td></td></tr>";

          if (report.missed_shift) {
            branchPage +=
              '<tr> <th></th> <td data-sparkline="' +
              missedShiftsSparkLineData +
              ' "> <td class=' +
              (brancheDetails.shift_summary.missed_shift_percentage < 0
                ? '"Per Red"'
                : '"Per Green"') +
              ">" +
              brancheDetails.shift_summary.missed_shift_percentage +
              "% " +
              "<i class=" +
              (brancheDetails.shift_summary.missed_shift_percentage < 0
                ? '"fas fa-long-arrow-alt-down"'
                : '"fas fa-long-arrow-alt-up"') +
              '"fas fa-long-arrow-alt-down"></i></td></td></tr>';
          }

          branchPage +=
            '<tr> <th></th> <td data-sparkline="' +
            avgHoursPerCaregiverSparkLineData +
            '"> <td class=' +
            (brancheDetails.shift_summary.avg_hours_percentage < 0
              ? '"Per Red"'
              : '"Per Green"') +
            ">" +
            brancheDetails.shift_summary.avg_hours_percentage +
            "% " +
            "<i class=" +
            (brancheDetails.shift_summary.avg_hours_percentage < 0
              ? '"fas fa-long-arrow-alt-down"'
              : '"fas fa-long-arrow-alt-up"') +
            "></i></td></td></tr></tbody> </table> </div></div></div></div></div>";

          branchPage += "</div>";
          branchPage += "</div>";

          var branchTable2 = "";
          branchTable2 +=
            "<div class='Caregiver_List'><div class='MiddleHEading'> Caregiver List</div>";
          branchTable2 +=
            "<table cellspacing='0' cellpadding='0' id='branch-table2'><thead><tr><th></th><th></th><th colspan='3'><span class='Head'> This period </span></th><th style='background-color: transparent;'></th><th style='background-color: transparent;'></th><th></th></tr><tr><th scope='col'>CAREGIVER NAME</th><th scope='col'>VACCINATION /BOOSTER</th><th scope='col'> <span class='Span'> <img src='assets/images/generic_coin.png'> CARE COINS EARNED </span> </th><th scope='col'> <span class='Span'> <img src='assets/images/generic_coin.png'> CARE COINS REDEEMED </span> </th><th scope='col'> REWARDS</th><th scope='col'>TOTAL REWARDS</th><th scope='col'># OF REDEMPTIONS</th><th scope='col'>VALUE OF OUTSTANDING</th></tr></thead><tbody>";

          for (i = 0; i < brancheDetails.caregiver_summary.length; i++) {
            if (
              brancheDetails.caregiver_summary[i].branch == key &&
              key == currentKey
            ) {
              branchTable2 += '<tr><td><div class="register-caregiver"><span>';
              if (brancheDetails.caregiver_summary[i].isRegistered) {
                branchTable2 +=
                  '<div class="register-caregiver">' +
                  (brancheDetails.caregiver_summary[i]._id,
                  brancheDetails.caregiver_summary[i].caregiver_name) +
                  ' <i class="fas fa-check"></i></div></td>';
              } else {
                branchTable2 +=
                  brancheDetails.caregiver_summary[i].caregiver_name +
                  "</span></div></td>";
              }
              if (brancheDetails.caregiver_summary[i].covid19Status) {
                branchTable2 +=
                  '<td class="Circle"><i class="fas fa-circle"></i></td>';
              } else {
                branchTable2 += "<td></td>";
              }
              branchTable2 +=
                "</td><td>" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].carecoins_earned_period
                ) +
                "</td><td>" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].carecoins_redeemed_period
                ) +
                "</td><td>$" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].reward_in_$_period
                ) +
                "</td><td>$" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].redeem_reward_value
                ) +
                "</td><td>" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].redemptionCount
                ) +
                "</td><td>$" +
                numberWithCommas(
                  brancheDetails.caregiver_summary[i].outstanding_value_in_$
                ) +
                "</td></tr>";
            }
          }
          branchTable2 += "</tbody></table>";
          branchTable2 += "</div></div>";
          branchPage += branchTable2;

          //Page 5
          var headerConst = "";

          var caregiverSinglePage = "<div id='caregiverSinglePage'>";

          Object.entries(report.caregiver_details).map(
            ([key1, caregiverDetails]) => {
              if (key === key1) {
                for (i = 0; i < caregiverDetails.length; i++) {
                  var caregiverClass = "";
                  if (
                    key1 ==
                      Object.entries(report.agency_branch_details).slice(
                        -1
                      )[0][0] &&
                    i === caregiverDetails.length - 1
                  ) {
                    caregiverClass =
                      "ProGramSummary Padding_Wrap FifthSection mt-0";
                  } else {
                    caregiverClass =
                      "ProGramSummary Padding_Wrap FifthSection page-break mt0";
                  }
                  var caregiverSinglePageConst =
                    '<div class="' +
                    caregiverClass +
                    '"><div class="CADProcess"><div class="Heading_Wrap_Star Last"><div class="LeftWrapHead">';
                  var ratingsConst =
                    '<div class="Rating"><div class="RatingWithHeading"><ul class="StarIco"><li>' +
                    showStarIcons(caregiverDetails[i].average_rating) +
                    '</li></ul><span class="branch-rating">' +
                    caregiverDetails[i].average_rating +
                    '</span><h5 class="RatingNumber"></h5></div><p class="RatingTxt">Average Caregiver Rating</p></div></div>';
                  caregiverSinglePage += headerConst + caregiverSinglePageConst;
                  caregiverSinglePage +=
                    '<h2 class="HeadingWrap d-flex" id=' +
                    caregiverDetails[i]._id +
                    ">" +
                    caregiverDetails[i].fullName +
                    "</h2>";
                  caregiverSinglePage += '<ul class="Vac">';
                  if (caregiverDetails[i].covid19Status == "Accepted") {
                    caregiverSinglePage +=
                      '<li><i class="fas fa-check"></i> Vaccinated</li>';
                  } else {
                    caregiverSinglePage +=
                      '<li><i class="fas fa-times"></i> Not vaccinated</li>';
                  }

                  caregiverSinglePage +=
                    "<li> Branch: " +
                    caregiverDetails[i].branch +
                    " </li></ul>";
                  caregiverSinglePage += '<ul class="InfoLast">';
                  if (caregiverDetails[i].birthday) {
                    caregiverSinglePage +=
                      "<li>Birthdate: " +
                      caregiverDetails[i].birthday +
                      "</li>";
                  }
                  if (caregiverDetails[i].hireDate) {
                    caregiverSinglePage +=
                      "<li>Hire Date: " +
                      caregiverDetails[i].hireDate +
                      "</li>";
                  }
                  if (caregiverDetails[i].registrationDate) {
                    caregiverSinglePage +=
                      "<li>Registration Date: " +
                      caregiverDetails[i].registrationDate +
                      "</li>";
                  }
                  caregiverSinglePage += "</ul></div>";

                  caregiverSinglePage += ratingsConst;
                  // Check how to assign value to span
                  $(".CaregiverRatingStar").html(
                    caregiverDetails[i].average_rating
                  );

                  caregiverSinglePage +=
                    '<div class="MIddleF"><ul><li><h2><img src="assets/images/reward.png"> $';

                  caregiverSinglePage +=
                    numberWithCommas(caregiverDetails[i].redeem_reward_value) +
                    "</h2>";
                  caregiverSinglePage +=
                    '<p class="Par"> Rewards Redeemed <span>(this period)</span></p>';
                  var redeem_reward_value_overall = 0;
                  caregiverSinglePage +=
                    '<p class="Pa">Total Rewards: $' +
                    numberWithCommas(
                      caregiverDetails[i].redeem_reward_value_overall
                    ) +
                    "</p>";
                  var count_of_redemption = 0;
                  caregiverSinglePage +=
                    '<p class="Pa">Total Redemptions: ' +
                    numberWithCommas(caregiverDetails[i].count_of_redemption) +
                    "</p>";
                  var unredeemedValue = 0;
                  caregiverSinglePage +=
                    '<p class="Pa Red">Unredeemed value: $' +
                    numberWithCommas(caregiverDetails[i].unredeemed_value) +
                    "</p>";
                  caregiverSinglePage += "</li>";

                  caregiverSinglePage +=
                    "<li><h2>" +
                    numberWithCommas(caregiverDetails[i].total_hours) +
                    "</h2>";
                  caregiverSinglePage +=
                    '<p class="Par">Total Hours <span>(this period)</span></p>';
                  var avg_hours_per_month = 0;
                  caregiverSinglePage +=
                    '<p class="Pa">Avg Hours per Month: ' +
                    caregiverDetails[i].total_hours_average +
                    "</p>";
                  caregiverSinglePage += "</li>";

                  if (report.extra_shift) {
                    caregiverSinglePage +=
                      "<li><h2>" +
                      numberWithCommas(caregiverDetails[i].extra_shift_count) +
                      "</h2>";
                    caregiverSinglePage +=
                      '<p class="Par">Extra Shifts <span>(this period)</span></p>';
                    var extra_shift_count_overall = 0;
                    caregiverSinglePage +=
                      '<p class="Pa">Total Extra Shifts: ' +
                      numberWithCommas(
                        caregiverDetails[i].extra_shift_count_overall
                      ) +
                      "</p>";
                    caregiverSinglePage += "</li>";
                  }

                  if (report.missed_shift) {
                    caregiverSinglePage +=
                      "<li><h2>" +
                      numberWithCommas(caregiverDetails[i].missed_shift_count) +
                      "</h2>";
                    caregiverSinglePage +=
                      '<p class="Par">Missed Shifts <span>(this period)</span></p>';
                    var missed_shift_count_overall = 0;
                    caregiverSinglePage +=
                      '<p class="Pa">Total Missed Shifts: ' +
                      numberWithCommas(
                        caregiverDetails[i].missed_shift_count_overall
                      ) +
                      "</p>";
                    caregiverSinglePage += "</li>";
                  }

                  if (report.weekend_shift) {
                    caregiverSinglePage +=
                      "<li><h2>" +
                      numberWithCommas(caregiverDetails[i].weekend_shift) +
                      "</h2>";
                    caregiverSinglePage +=
                      '<p class="Par">Weekend Shifts <span>(this period)</span></p>';
                    var weekend_shift_overall = 0;
                    caregiverSinglePage +=
                      '<p class="Pa">Total Weekend Shifts: ' +
                      numberWithCommas(
                        caregiverDetails[i].weekend_shift_overall
                      ) +
                      "</p>";
                    caregiverSinglePage += "</li>";
                  }

                  caregiverSinglePage += "</ul></div>";

                  caregiverSinglePage +=
                    '<div class="RecReviews"><div class="LeftWrap"><h2 class="BgHead">Most Recent Reviews</h2>';
                  for (j = 0; j < caregiverDetails[i].review.length; j++) {
                    caregiverSinglePage +=
                      '<div class="RatBoxTxt"> <span>' +
                      formatDatemmddyyyy(
                        caregiverDetails[i].review[j].submitDate
                      ) +
                      "</span>";

                    if (caregiverDetails[i].review[j].familyMemberName !== "") {
                      caregiverSinglePage +=
                        "<h3>Reviewed by " +
                        caregiverDetails[i].review[j].familyMemberName +
                        "</h3>";
                    }
                    if (caregiverDetails[i].review[j].patientName !== "") {
                      caregiverSinglePage +=
                        '<p class="Par">Caring for ' +
                        caregiverDetails[i].review[j].patientName +
                        "</p>";
                    }
                    caregiverSinglePage +=
                      '<div class="RatStar"><ul class="StarIco"><li>' +
                      showStarIcons(caregiverDetails[i].review[j].rating) +
                      "</li></ul>";
                    caregiverSinglePage +=
                      "<h2>" +
                      caregiverDetails[i].review[j].rating +
                      "</h2></div>";
                    caregiverSinglePage +=
                      '<p class="TxtRev">' +
                      caregiverDetails[i].review[j].comment +
                      "</p></div>";
                  }
                  if (caregiverDetails[i].review.length === 0) {
                    caregiverSinglePage +=
                      '<div class="no-reviews">No reviews available.</div>';
                  }
                  caregiverSinglePage += "</div>";

                  var careCoinIncentive =
                    '<div class="RightWrap"><h2 class="BgHead">Care Coin Incentive Categories</h2><div class="TopCat"><p>Care Coins<sup>TM</sup> <span>Earned this period</span></p></div><ul>';
                  caregiverSinglePage += careCoinIncentive;

                  for (k = 0; k < caregiverDetails[i].incentives.length; k++) {
                    $.each(
                      caregiverDetails[i].incentives[0],
                      function (categoryName, coinValue) {
                        if (INCENTIVE_TO_TEXT.hasOwnProperty(categoryName)) {
                          caregiverSinglePage +=
                            "<li>" +
                            INCENTIVE_TO_TEXT[categoryName].text +
                            "<p> " +
                            numberWithCommas(coinValue) +
                            " <span>(" +
                            caregiverDetails[i].incentives_percentage[
                              categoryName + "_percentage"
                            ] +
                            "%)</span> </p></li>";
                        }
                      }
                    );
                  }

                  caregiverSinglePage +=
                    '<li><p><img src="assets/images/generic_coin.png"> ' +
                    numberWithCommas(
                      caregiverDetails[i].incentives[0].total_incentive_value
                    ) +
                    " <span>(" +
                    caregiverDetails[i].incentives_percentage
                      .total_incentive_value_percentage +
                    "%)</span> </p></li>";
                  caregiverSinglePage += "</ul></div></div></div></div>";
                }
              }
            }
          );
          caregiverSinglePage += "</div>";
          branchPage += caregiverSinglePage;
        }
      );

      branchPage += "</div>";
      let queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("reportType") == "long") {
        $(".branch-pages").html(branchPage);
      }
      doChunk(); //To show sparkline chart

      var branch = JSON.parse(
        JSON.stringify(report.program_detail.branch_wise)
      );

      for (i = 0; i < Object.keys(branch).length; i++) {
        var result = [];
        for (var l in branch) result.push([l, branch[l]]);
        var keyx = Object.keys(report.program_detail.branch_wise);
        const arr = Object.keys(keyx).map((key) => [key, keyx[key]]);
        var xx = JSON.parse(JSON.stringify(report.program_detail.branch_wise));

        branchTable +=
          '<tr><td class="align-left">' +
          keyx[i] +
          "</td><td>" +
          result[i][1].eligible_caregiver +
          "</td><td>" +
          result[i][1].registered_caregiver +
          "</td><td>" +
          result[i][1].registered_percentage +
          "</td><td>" +
          result[i][1].reward_redemeed_period +
          "</td></tr>";
      }

      $("#branch-table TBODY").html(branchTable);

      var reportData = "";
      var reportsHeaderDiv =
        '<div class="Padding_Wrap ThirdSection page-break">';

      if (
        (jsonData.incident && report.incident_report.length > 0) ||
        (jsonData.risk && report.risk_report.length > 0)
      ) {
        reportData += reportsHeaderDiv;
      }

      if (jsonData.incident && report.incident_report.length > 0) {
        reportData +=
          ' <h2 class="HeadingWrap d-flex" style="margin: 0px 0 0 0;">Incident Reports</h2>';
        for (i = 0; i < report.incident_report.length; i++) {
          reportData += '<div class="Reports">';

          reportData += '<div class="LeftSide"> <span class="Date">';
          reportData +=
            formatDateddmmyyyy(report.incident_report[i].incident_date) +
            "</span>";

          reportData +=
            "<p> <span> Caregiver: </span> " +
            report.incident_report[i].caregiver_name +
            "</p>";
          reportData +=
            "<p><span> Client: </span> " +
            report.incident_report[i].client_name +
            "</p>";
          reportData +=
            '<p><span> Type: </span> <span class="Red">' +
            report.incident_report[i].type_of_incident +
            "</span></p>";

          reportData += '</div><div class="RightSide"><h5>Notes:</h5><p>';
          reportData += report.incident_report[i].notes;
          reportData += "</div></div>";
        }
      }

      if (report.incident_report.length > 0 && report.risk_report.length <= 0) {
        reportData += "</div>";
      }

      if (jsonData.risk && report.risk_report.length > 0) {
        reportData +=
          '<h2 class="HeadingWrap d-flex" style="margin: 0px 0 0 0;page-break-before: always;">Risk Reports</h2>';
        for (i = 0; i < report.risk_report.length; i++) {
          reportData += '<div class="Reports">';

          reportData += '<div class="LeftSide"> <span class="Date">';
          reportData +=
            formatDateddmmyyyy(report.risk_report[i].incident_date) + "</span>";

          reportData +=
            "<p> <span> Caregiver: </span> " +
            report.risk_report[i].caregiver_name +
            "</p>";
          reportData +=
            "<p><span> Client: </span> " +
            report.risk_report[i].client_name +
            "</p>";
          reportData +=
            '<p><span> Type: </span> <span class="Yellow">' +
            report.risk_report[i].type_of_risk +
            "</span></p>";

          reportData += '</div><div class="RightSide"><h5>Notes:</h5><p>';
          reportData += report.risk_report[i].notes;
          reportData += "</div></div>";
        }
        reportData += "</div>";
      }

      if (jsonData.risk || jsonData.incident) {
        $(".ReportsDiv").append(reportData);
      } else {
        reportData = "";
        $(".ReportsDiv").append(reportData);
      }
    }

    if (!jsonData.risk && !jsonData.incident) {
      $("#incidentRiskRow").hide();
    }
  });
};
// </script>

let getCalenderDaysBetweenDates = (startDate, endDate) => {
    var now = startDate.clone(), dates = [];

    while (now.isSameOrBefore(endDate)) {
        const year = now.format('YYYY');
        const month = now.format('MMMM');
        const days = now.format('D');
        const shortday = now.format('ddd')
        const find_date = {year, month, days, shortday}

        dates.push(find_date);
        now.add(1, 'days');
    }
    return dates;
};

function load_calendar(calender_count = 0) {
    document.getElementById('render-calendar').innerHTML = '';

    const startMonth = moment().add(calender_count, 'month').startOf('month');
    const endMonth = moment().add(calender_count, 'month').endOf('month');

    const currentDateTitle = moment().add(calender_count, 'month').startOf('month').format('MMMM YYYY');

    let month_el = '<div class="month-range-title" id="month-range-title">';

    month_el += '<img class="back-appointment-arrow" loading="lazy" src="https://uploads-ssl.webflow.com/61bb14ca2605dbf57ee956a0/61f26eca58147e810b931de3_arrow-left.png" alt="">' +
                '<div class="month-title">' + currentDateTitle + '</div>' +
                '<img class="forward-appointment-arrow" loading="lazy" src="https://uploads-ssl.webflow.com/61bb14ca2605dbf57ee956a0/61c0571f3cf2261928eac70d_Vector.png" alt="">';
    
    month_el += '</div>';

    let dateList = getCalenderDaysBetweenDates(startMonth, endMonth);

    let calendar = [];

    const date_ranges = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

    month_el += '<div class="div-block-16 month-title">';

    date_ranges.forEach((element, index) => {
        month_el += '<div class="text-block-7">' + element + '</div>';
    });

    month_el += '</div>';

    let startDate = startMonth.format('ddd');
    const empty_start_dates_count = date_ranges.indexOf(startDate);

    let endDate = endMonth.format('ddd');
    const empty_end_dates_count = date_ranges.indexOf(endDate);

    console.log(empty_start_dates_count, empty_end_dates_count);

    let count = 0;
    for (let i = 0; i < dateList.length; i++) {
        if (count == 0) {
            month_el += '<div class="div-block-15">';
        }

        console.log(date_ranges[count],  dateList[i].shortday);

        if(count <= empty_start_dates_count || count > empty_end_dates_count) {
            month_el += '<div class="div-block-14 blank-cell"></div>';
        } else {
            month_el += '<div class="div-block-14"><div class="text-block-6">' + dateList[i].days + '</div></div>';
        }
            
        // month_el += '<div class="div-block-14 blank-cell"></div>';

        if(count == 6) {


            month_el += '</div>';
            count = 0;
        } else count++;
    }
    

    var userSelection = document.getElementsByClassName('back-appointment-arrow');
    for(let i = 0; i < userSelection.length; i++) {
        userSelection[i].addEventListener("click", () => {
            backAppointmentCalendarNav(calender_count) 
        })
    }

    var userSelection = document.getElementsByClassName('forward-appointment-arrow');
    for(let i = 0; i < userSelection.length; i++) {
        userSelection[i].addEventListener("click", () => {
            forwardAppointmentCalendarNav(calender_count) 
        })
    }

    document.getElementById('render-calendar').innerHTML = month_el;
}

function backAppointmentCalendarNav(calender_count) {
    calender_count -= 1;
    load_calendar(calender_count);
    //add firebase api to get all appointments
}

function forwardAppointmentCalendarNav(calender_count) {
    calender_count += 1;
    load_calendar(calender_count);
    //add firebase api to get all appointments
}


document.addEventListener('DOMContentLoaded', function() {
    load_calendar();
    // firebase api to get appointment
});
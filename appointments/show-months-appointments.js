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

    month_el += '<div class="div-block-24"><div class="div-block-17">';

    month_el += '<div class="div-block-16">';

    date_ranges.forEach((element, index) => {
        month_el += '<div class="text-block-7">' + element + '</div>';
    });

    month_el += '</div>';

    let startDate = startMonth.format('ddd');
    const empty_start_dates_count = date_ranges.indexOf(startDate);

    let endDate = endMonth.format('ddd');
    const empty_end_dates_count = date_ranges.indexOf(endDate);

    let append_prev_month_el = '';
    let has_prev_month = false;
    if(empty_start_dates_count > 0) {
        has_prev_month = true;

        for(let i = empty_start_dates_count; i >= 0; i--) {
            const prev_date = moment().add(calender_count-1, 'month').endOf('month').add(empty_start_dates_count - i, 'days').format('D');
            append_prev_month_el += '<div class="div-block-14 blank-cell"><div class="text-block-6">' + prev_date + '</div></div>';
        }
    }

    let append_end_month_el = '';
    let has_end_month = false;
    if(empty_end_dates_count < date_ranges.length) {
        has_end_month = true;

        for(let i = empty_end_dates_count; i < date_ranges.length; i++) {
            const next_date = moment().add(calender_count+1, 'month').startOf('month').add(i - 1, 'days').format('D');
            append_end_month_el += '<div class="div-block-14 blank-cell"><div class="text-block-6">' + next_date + '</div></div>';
        }
    }

    let count = 0;
    for (let i = 0; i < dateList.length; i++) {
        if (count == 0) {
            month_el += '<div class="div-block-15">';
        }

        if(has_prev_month) {
            month_el += append_prev_month_el;
            count += empty_start_dates_count;
            has_prev_month = false;
        }

        month_el += '<div class="div-block-14"><div class="text-block-6">' + dateList[i].days + '</div></div>';

        if(i == dateList.length - 1) {
            if(has_end_month) {
                month_el += append_end_month_el;
                count += empty_end_dates_count;
                has_end_month = false;
            }
        }

        if(count >= 6) {
            month_el += '</div>';
            count = 0;
        } else count++;


    }

    month_el += '</div></div>';

    document.getElementById('render-calendar').innerHTML = month_el;

    let userBackAppointmentSelection = document.querySelectorAll('.back-appointment-arrow');
    for(let i = 0; i < userBackAppointmentSelection.length; i++) {
        console.log(i)
        userBackAppointmentSelection[i].addEventListener("click", () => {
            backAppointmentCalendarNav(calender_count) 
        })
    }

    let userForwardAppointmentSelection = document.querySelectorAll('.forward-appointment-arrow');
    for(let i = 0; i < userForwardAppointmentSelection.length; i++) {
        userForwardAppointmentSelection[i].addEventListener("click", () => {
            forwardAppointmentCalendarNav(calender_count) 
        })
    }
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
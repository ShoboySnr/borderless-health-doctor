"use strict";

let getDaysBetweenDates = (startDate, endDate) => {
    var now = startDate.clone(), dates = [];

    while (now.isSameOrBefore(endDate)) {
        const year = now.format('YYYY');
        const month = now.format('MMM');
        const days = now.format('DD');
        const find_date = {year, month, days}

        dates.push(find_date);
        now.add(1, 'days');
    }
    return dates;
};

let getTimeBetweenDates = (startTime, endTime) => {
    var now = startTime.clone(), dates = [];

    while (now.isBefore(endTime)) {
        dates.push(now.format('hh:mm A'));
        now.add(30, 'minutes');
    }
    return dates;
};

const chunk = (arr, size) => arr.reduce((acc, e, i) => (i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc), []);

const load_custom_calender_dates = (count = 0) => {
    const startDate = moment().add(-2 + count, 'months');
    const endDate = moment().add(1 + count, 'months');

    let dateList = getDaysBetweenDates(startDate, endDate);

    let chunkDateList = chunk(dateList, 7); 

    let returnDate = [];

    chunkDateList.forEach((element, count) => {
        let first_item = element[0];
        let last_item = element[element.length - 1];
        let concat_first_item = first_item['year'] + first_item['month'] + first_item['days'];
        let concat_last_item = last_item['year'] + last_item['month'] + last_item['days'];
        let first_item_date = moment(concat_first_item, 'YYYYMMMDD').format('MMMM Do');
        let last_item_date = moment(concat_last_item, 'YYYYMMMDD').format('MMMM Do YYYY');

        let is_active = false;
        if(moment(first_item['year'] + first_item['month'] + first_item['days'], 'YYYYMMMDD').isBefore(moment(), 'day') &&  moment(last_item['year'] + last_item['month'] + last_item['days'], 'YYYYMMMDD').isSameOrAfter(moment(), 'day')) is_active = true;
        let groupDate = {
            'start_date' : first_item_date,
            'end_date'   : last_item_date,
            'data'       : element,
            'active'     : is_active,
        };

        returnDate.push(groupDate);
    });

    return returnDate;
}

const load_custom_calendar_time = () => {
    const startTime = moment('00:00', 'HH::mm');
    const endTime = moment('24:00', 'HH::mm');

    let timeList = getTimeBetweenDates(startTime, endTime);

    let returnDate = [];
    
    timeList.forEach((element, count) => {
        let start_time = moment(element, 'HH:mm A');
        let end_time = moment(element, 'HH:mm A').add(30, 'minutes');

        let is_active = false;
        if(moment(start_time).isBefore(moment()) &&  moment(end_time).isAfter(moment())) is_active = true;

        let groupTime = {
            'data'       : element,
            'active'     : is_active
        };

        returnDate.push(groupTime)
    });

    return returnDate;
}

const generate_columns_time = (current_time, active_time, current_value = []) => {
    let is_active = active_time ? 'current-active-time' : '';
    let append_html = '<div class="container-8 w-container ' + is_active + '">'
    for(let i = 0; i < 7; i++) {
        append_html += i == 0 ? '<div class="text-block-9"><strong>' + current_time + '</strong></div>' : '<div class="div-block-28 appointment-calendar-date">' +
                    '<input type="text" class="appointment-day w-input" maxlength="256" name="appointments[]" data-name="appointments[]" placeholder="" id="field">' +
                    '<label class="field-label"></label>' +
                    '</div>';

    }

    append_html += '</div>'

    return append_html;
}

const generate_calendar_table_html = (current_dates, calendar_title, active_date, count, current_value = []) => {
    let current_active_date = active_date ? ' open-calender-active' : ''
    let append_html = '<div class="appointment-calendar-container calendar-' + count + current_active_date +'" data-cal="' + count +'">';
    append_html += '<div class="container-7 w-container">' + 
                        '<div class="columns-6 w-row"><div class="column-8 w-col w-col-4">' + 
                        '<img data-cal="'+count+'" src="https://uploads-ssl.webflow.com/61bb14ca2605dbf57ee956a0/61f26eca58147e810b931de3_arrow-left.png" loading="lazy" alt="" class="back-arrow">' + 
                        '</div>' + 
                        '<div class="column-10 w-col w-col-4">' + 
                        '<p class="paragraph-7">' + calendar_title + '</p>' +
                        '</div>' + 
                        '<div class="column-9 w-col w-col-4">' + 
                        '<img data-cal="'+count+'" src="https://uploads-ssl.webflow.com/61bb14ca2605dbf57ee956a0/61c0571f3cf2261928eac70d_Vector.png" loading="lazy" alt="" class="image-4 forward-arrow"></div></div></div>';
    append_html += '<div class="container-8 w-container">';
    append_html += '<div class="div-block-21"></div>';
    current_dates.forEach((element, index) => {
        append_html += '<div class="text-block-8">' + element.month  + '<br><strong class="bold-text">' + element.days +'</strong><br>'+ element.days +'</div>';

        // calander_time.forEach((element, index) => {
        //     append_html += generate_columns_time(element.data, element.active);
        // })
    })

    append_html += '</div>'
    append_html += '</div>'

    return append_html;
}

function backCalendarNav () {
    const data_cal = this.getAttribute('data-cal');

    document.querySelector('.calendar-'+data_cal).classList.remove("open-calender-active");

    let next_cal_index = parseInt(data_cal) - 1;

    let next_cal_el = document.querySelector('.calendar-'+next_cal_index);

    if(next_cal_el) {
        next_cal_el.classList.add("open-calender-active");
    } else {
        //generate new calander
        //add loading
    }

    return;
}

function NextCalendarNav () {
    const data_cal = this.getAttribute('data-cal');

    document.querySelector('.calendar-'+data_cal).classList.remove("open-calender-active");

    let next_cal_index = parseInt(data_cal) + 1;

    let next_cal_el = document.querySelector('.calendar-'+next_cal_index);

    if(next_cal_el) {
        next_cal_el.classList.add("open-calender-active");
    } else {
        //generate new calander
        //add loading
    }

    return;
}

window.addEventListener('load', function() {
    let load_dates = load_custom_calender_dates();
    const month_el = document.getElementById('show-month-range');
    for (let i = 0; i < load_dates.length; i++) {
        let calender_title = load_dates[i].start_date + ' - ' + load_dates[i].end_date;
        month_el.innerHTML = generate_calendar_table_html(load_dates[i].data, calender_title, load_dates[i].active, i)
    }

    var userSelection = document.getElementsByClassName('back-arrow');
    for(let i = 0; i < userSelection.length; i++) {
        userSelection[i].addEventListener("click", backCalendarNav)
    }

    var userSelection = document.getElementsByClassName('forward-arrow');
    for(let i = 0; i < userSelection.length; i++) {
        userSelection[i].addEventListener("click", NextCalendarNav)
    }
});




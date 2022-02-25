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

    const date_ranges = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    month_el += '<div class="div-block-24"><div class="div-block-17">';

    month_el += '<div class="div-block-16">';

    date_ranges.forEach((element, index) => {
        month_el += '<div class="text-block-7">' + element + '</div>';
    });

    month_el += '</div>';

    let startDate = startMonth.format('ddd');
    const empty_start_dates_count = date_ranges.indexOf(startDate);

    let endDate = endMonth.format('ddd');
    console.log(endDate);
    const empty_end_dates_count = date_ranges.indexOf(endDate);

    let append_prev_month_el = '';
    let has_prev_month = false;
    if(empty_start_dates_count > -1) {
        has_prev_month = true;

        for(let i = 0; i < empty_start_dates_count; i++) {
            const prev_days = moment().add(calender_count-1, 'month').endOf('month').add(i - empty_start_dates_count + 1, 'days')
            const prev_date = prev_days.format('D');
            const format_prev_date = prev_days.format("MMMM D, YYYY [at] h:mm:ss A [UTC]Z");
            append_prev_month_el += '<div class="div-block-14 blank-cell" data-current-date="' + format_prev_date + '"><div class="text-block-6">' + prev_date + '</div></div>';
        }
    }

    let append_end_month_el = '';
    let has_end_month = false;
    if(empty_end_dates_count > -1) {
        has_end_month = true;

        for(let i = empty_end_dates_count; i < date_ranges.length - 1; i++) {
            console.log(i, date_ranges.length)
            const next_days = moment().add(calender_count+1, 'month').startOf('month').add(i - empty_end_dates_count, 'days');
            const next_date = next_days.format('D');
            const format_next_date = next_days.format("MMMM D, YYYY [at] h:mm:ss A [UTC]Z");
            append_end_month_el += '<div class="div-block-14 blank-cell" data-current-date="' + format_next_date + '"><div class="text-block-6">' + next_date + '</div></div>';
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


        const format_current_date = moment(`${dateList[i].days} ${dateList[i].month} ${dateList[i].year}`, "D MMMM YYYY").format("MMMM D, YYYY [at] h:mm:ss A [UTC]Z");

        month_el += '<div class="div-block-14" data-current-date="' + format_current_date + '"><div class="text-block-6">' + dateList[i].days + '</div></div>';

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

function getAllBookedAppointments() {
    const inner_page_loader = document.querySelector('#calendar-appointment .inner-loader-class');

    inner_page_loader.setAttribute('style', 'display:flex');

    appointments = [];

    auth.onAuthStateChanged((user) => {
        if(user) {
            const doctor_uid = user.uid;
            console.log(doctor_uid);
            let appointmentRef = db.collection('test-appointments').where('doctor_uid', '==', doctor_uid).where('patient_uid', '!=', null);
            console.log(appointmentRef);
            appointmentRef.get().then((querySnapshot) => {
                if(!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        if(doc.exists) {
                            const data_collected = doc.data();
                            const { patient_uid } = data_collected;

                            // get the patients collection
                            db.collection('test-patients').doc(patient_uid).get().then((patientSnapshot) => {
                                console.log('hello', patientSnapshot);
                                const patients_doc_collected = patientSnapshot.data();
                                appointments.push({
                                    id: doc.id,
                                    ...data_collected,
                                    ...patients_doc_collected
                                });
                                inner_page_loader.setAttribute('style', 'display:none');
                            }).then((error) => {
                                console.log(error);
                                inner_page_loader.setAttribute('style', 'display:none');
                            })

                        }
                    });
                }

            }).then((error) => {
                console.log(error);
                inner_page_loader.setAttribute('style', 'display:none');
            })

        } else {
            alert('Please login to proceed');
            window.location.href = '/login';
        }
    });

    appointments.forEach((appointment, index) => {
        const { date } = appointment;
        const { patient_uid } = appointment;
        console.log(date, patient_uid);

        const get_selected_date = document.querySelector('div[data-current-date="' + date.toString() + '"]');

        if(get_selected_date) {
            get_selected_date.setAttribute('style', 'background-color: #27AE60;color: white;');
            const url = '/appointments/appointment?id=' + patient_uid;
            document.querySelector('div[data-current-date="' + date + '"] div').innerHTML += '<a href="' + url + '" style="height: 100%;width: 100%;display:flex;justify-content:center;align-items:center;" >Booked</a>';
        }
    })
}


document.addEventListener('DOMContentLoaded', function() {
    load_calendar();
    getAllBookedAppointments();
    // firebase api to get appointment
});
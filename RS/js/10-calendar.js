
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 10 — CALENDAR
   File: 10-calendar.js

   DATABASE:
   public.orders

   RESPONSIBILITY:
   - Calendar rendering
   - Month navigation
   - Date selection
   - Booking indicators
   - Selected-date bookings
   - Calendar data loading

   DOES NOT:
   - Handle authentication
   - Handle sidebar
   - Handle navigation
   - Create/update/delete bookings
   - Manage contracts
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_CALENDAR_INITIALIZED = false;

let RS_CALENDAR_LOADING = false;


/* =========================================================
   2. CALENDAR STATE
   ========================================================= */

const RS_CALENDAR_STATE = {

    currentDate:
        new Date(),

    selectedDate:
        null,

    bookings:
        []

};


/* =========================================================
   3. CALENDAR CONFIGURATION
   ========================================================= */

const CALENDAR_CONFIG = Object.freeze({

    table:
        'orders',

    firstDay:
        1

});


/* =========================================================
   4. GET CALENDAR ELEMENTS
   ========================================================= */

function getCalendarElements() {

    return {

        page:
            domSelect(
                '[data-page-view="calendar"]'
            ),

        title:
            domSelect(
                '[data-calendar-title]'
            ),

        grid:
            domSelect(
                '[data-calendar-grid]'
            ),

        previous:
            domSelect(
                '[data-action="calendar-previous"]'
            ),

        next:
            domSelect(
                '[data-action="calendar-next"]'
            ),

        today:
            domSelect(
                '[data-action="calendar-today"]'
            ),

        selectedDate:
            domSelect(
                '[data-calendar-selected-date]'
            ),

        selectedCount:
            domSelect(
                '[data-calendar-selected-count]'
            ),

        selectedBookings:
            domSelect(
                '[data-calendar-selected-bookings]'
            ),

        loading:
            domSelect(
                '[data-calendar-state="loading"]'
            ),

        error:
            domSelect(
                '[data-calendar-state="error"]'
            )

    };

}


/* =========================================================
   5. FORMAT MONTH TITLE
   ========================================================= */

function formatCalendarMonthTitle(
    date
) {

    return date.toLocaleDateString(
        'en-IN',
        {

            month:
                'long',

            year:
                'numeric'

        }
    );

}


/* =========================================================
   6. FORMAT FULL DATE
   ========================================================= */

function formatCalendarFullDate(
    date
) {

    return date.toLocaleDateString(
        'en-IN',
        {

            weekday:
                'long',

            day:
                'numeric',

            month:
                'long',

            year:
                'numeric'

        }
    );

}


/* =========================================================
   7. DATE KEY
   ========================================================= */

function getCalendarDateKey(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   8. BOOKING DATE KEY
   ========================================================= */

function getBookingDateKey(
    booking
) {

    if (
        !booking ||
        !booking.booking_date
    ) {

        return null;

    }


    const raw =
        String(
            booking.booking_date
        );


    /*
     * PostgreSQL DATE normally arrives as:
     * YYYY-MM-DD
     *
     * Taking the first 10 characters prevents timezone
     * conversion from moving the booking to another day.
     */

    return raw.slice(
        0,
        10
    );

}


/* =========================================================
   9. SAME DATE
   ========================================================= */

function calendarDatesEqual(
    first,
    second
) {

    if (
        !first ||
        !second
    ) {

        return false;

    }


    return (

        first.getFullYear() ===
            second.getFullYear()

        &&

        first.getMonth() ===
            second.getMonth()

        &&

        first.getDate() ===
            second.getDate()

    );

}


/* =========================================================
   10. SET LOADING
   ========================================================= */

function setCalendarLoading(
    loading
) {

    RS_CALENDAR_LOADING =
        Boolean(loading);


    const elements =
        getCalendarElements();


    if (elements.loading) {

        elements.loading.hidden =
            !RS_CALENDAR_LOADING;

    }


    if (elements.page) {

        elements.page.classList.toggle(
            'calendar-loading',
            RS_CALENDAR_LOADING
        );

    }

}


/* =========================================================
   11. SET ERROR
   ========================================================= */

function setCalendarError(
    message
) {

    const elements =
        getCalendarElements();


    if (!elements.error) {

        return;

    }


    elements.error.textContent =
        message || '';


    elements.error.hidden =
        !Boolean(message);

}


/* =========================================================
   12. GET MONTH RANGE
   ========================================================= */

function getCalendarMonthRange(
    date
) {

    const year =
        date.getFullYear();


    const month =
        date.getMonth();


    const start =
        new Date(
            year,
            month,
            1
        );


    const end =
        new Date(
            year,
            month + 1,
            0
        );


    return {

        start,

        end

    };

}


/* =========================================================
   13. LOAD CALENDAR BOOKINGS
   ========================================================= */

async function loadCalendarBookings() {

    if (
        RS_CALENDAR_LOADING
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Calendar loading skipped: user is not authenticated.'
        );


        return;

    }


    setCalendarLoading(
        true
    );


    setCalendarError(
        ''
    );


    try {

        const client =
            getSupabaseClient();


        /*
         * Fetch bookings for the visible month.
         *
         * We deliberately use string dates because the
         * booking_date column is normally a PostgreSQL DATE.
         */

        const {
            start,
            end
        } =
            getCalendarMonthRange(
                RS_CALENDAR_STATE.currentDate
            );


        const startKey =
            getCalendarDateKey(
                start
            );


        const endKey =
            getCalendarDateKey(
                end
            );


        const {
            data,
            error
        } = await client
            .from(
                CALENDAR_CONFIG.table
            )
            .select(
                '*'
            )
            .gte(
                'booking_date',
                startKey
            )
            .lte(
                'booking_date',
                endKey
            )
            .order(
                'booking_date',
                {
                    ascending: true
                }
            );


        if (error) {

            throw error;

        }


        RS_CALENDAR_STATE.bookings =
            Array.isArray(data)
                ? data
                : [];


        renderCalendar();


        if (
            RS_CALENDAR_STATE.selectedDate
        ) {

            renderSelectedDateBookings();

        }


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        setCalendarError(
            normalizedError.message ||
            'Unable to load calendar.'
        );


        debugError(
            'Calendar loading failed:',
            normalizedError
        );


    } finally {

        setCalendarLoading(
            false
        );

    }

}


/* =========================================================
   14. GET BOOKINGS FOR DATE
   ========================================================= */

function getBookingsForCalendarDate(
    date
) {

    const key =
        getCalendarDateKey(
            date
        );


    return RS_CALENDAR_STATE.bookings.filter(
        (booking) =>
            getBookingDateKey(
                booking
            ) === key
    );

}


/* =========================================================
   15. CREATE CALENDAR DAY
   ========================================================= */

function createCalendarDay(
    date,
    options = {}
) {

    const {

        outsideMonth =
            false,

        today =
            false,

        selected =
            false,

        bookings =
            []

    } = options;


    const button =
        document.createElement(
            'button'
        );


    button.type =
        'button';


    button.className =
        'calendar-day';


    if (outsideMonth) {

        button.classList.add(
            'calendar-day-outside'
        );

    }


    if (today) {

        button.classList.add(
            'calendar-day-today'
        );

    }


    if (selected) {

        button.classList.add(
            'calendar-day-selected'
        );

    }


    if (
        bookings.length > 0
    ) {

        button.classList.add(
            'calendar-day-has-bookings'
        );

    }


    button.dataset.calendarDate =
        getCalendarDateKey(
            date
        );


    const dayNumber =
        document.createElement(
            'span'
        );


    dayNumber.className =
        'calendar-day-number';


    dayNumber.textContent =
        String(
            date.getDate()
        );


    button.appendChild(
        dayNumber
    );


    if (
        bookings.length > 0
    ) {

        const indicator =
            document.createElement(
                'span'
            );


        indicator.className =
            'calendar-booking-indicator';


        indicator.setAttribute(
            'aria-label',
            `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`
        );


        if (
            bookings.length <= 3
        ) {

            for (
                let index = 0;
                index < bookings.length;
                index++
            ) {

                const dot =
                    document.createElement(
                        'span'
                    );


                dot.className =
                    'calendar-booking-dot';


                indicator.appendChild(
                    dot
                );

            }

        } else {

            indicator.textContent =
                String(
                    bookings.length
                );

        }


        button.appendChild(
            indicator
        );

    }


    button.addEventListener(
        'click',
        () => {

            selectCalendarDate(
                date
            );

        }
    );


    return button;

}


/* =========================================================
   16. RENDER CALENDAR
   ========================================================= */

function renderCalendar() {

    const elements =
        getCalendarElements();


    if (!elements.grid) {

        return;

    }


    const current =
        RS_CALENDAR_STATE.currentDate;


    const year =
        current.getFullYear();


    const month =
        current.getMonth();


    if (elements.title) {

        elements.title.textContent =
            formatCalendarMonthTitle(
                current
            );

    }


    elements.grid.innerHTML =
        '';


    /*
     * Monday-first calendar.
     */

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startingDay =
        firstDay.getDay();


    /*
     * JavaScript:
     * Sunday = 0
     *
     * We want:
     * Monday = 0
     */

    startingDay =
        (
            startingDay +
            6
        ) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    const today =
        new Date();


    const totalCells =
        Math.ceil(
            (
                startingDay +
                daysInMonth
            ) / 7
        ) * 7;


    for (
        let index = 0;
        index < totalCells;
        index++
    ) {

        let date;

        let outsideMonth =
            false;


        if (
            index < startingDay
        ) {

            const day =
                previousMonthDays -
                startingDay +
                index +
                1;


            date =
                new Date(
                    year,
                    month - 1,
                    day
                );


            outsideMonth =
                true;

        } else if (
            index >=
            startingDay +
            daysInMonth
        ) {

            const day =
                index -
                (
                    startingDay +
                    daysInMonth
                ) +
                1;


            date =
                new Date(
                    year,
                    month + 1,
                    day
                );


            outsideMonth =
                true;

        } else {

            const day =
                index -
                startingDay +
                1;


            date =
                new Date(
                    year,
                    month,
                    day
                );

        }


        const bookings =
            getBookingsForCalendarDate(
                date
            );


        const selected =
            calendarDatesEqual(
                date,
                RS_CALENDAR_STATE.selectedDate
            );


        const isToday =
            calendarDatesEqual(
                date,
                today
            );


        const dayElement =
            createCalendarDay(
                date,
                {

                    outsideMonth,

                    today:
                        isToday,

                    selected,

                    bookings

                }
            );


        elements.grid.appendChild(
            dayElement
        );

    }

}


/* =========================================================
   17. SELECT CALENDAR DATE
   ========================================================= */

function selectCalendarDate(
    date
) {

    RS_CALENDAR_STATE.selectedDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    /*
     * If a day from the previous/next month was selected,
     * move the calendar to that month.
     */

    if (
        date.getMonth() !==
        RS_CALENDAR_STATE.currentDate.getMonth()
        ||
        date.getFullYear() !==
        RS_CALENDAR_STATE.currentDate.getFullYear()
    ) {

        RS_CALENDAR_STATE.currentDate =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );


        loadCalendarBookings();

        return;

    }


    renderCalendar();

    renderSelectedDateBookings();

}


/* =========================================================
   18. RENDER SELECTED DATE
   ========================================================= */

function renderSelectedDateBookings() {

    const elements =
        getCalendarElements();


    if (
        !RS_CALENDAR_STATE.selectedDate
    ) {

        if (elements.selectedDate) {

            elements.selectedDate.textContent =
                'Select a date';

        }


        if (elements.selectedCount) {

            elements.selectedCount.textContent =
                '0 bookings';

        }


        if (elements.selectedBookings) {

            elements.selectedBookings.innerHTML =
                '';

        }


        return;

    }


    const date =
        RS_CALENDAR_STATE.selectedDate;


    const bookings =
        getBookingsForCalendarDate(
            date
        );


    if (elements.selectedDate) {

        elements.selectedDate.textContent =
            formatCalendarFullDate(
                date
            );

    }


    if (elements.selectedCount) {

        elements.selectedCount.textContent =
            `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`;

    }


    if (
        !elements.selectedBookings
    ) {

        return;

    }


    elements.selectedBookings.innerHTML =
        '';


    if (
        bookings.length === 0
    ) {

        const empty =
            document.createElement(
                'div'
            );


        empty.className =
            'calendar-empty';


        empty.textContent =
            'No bookings on this date.';


        elements.selectedBookings.appendChild(
            empty
        );


        return;

    }


    bookings.forEach(
        (booking) => {

            elements.selectedBookings.appendChild(
                createCalendarBookingElement(
                    booking
                )
            );

        }
    );

}


/* =========================================================
   19. CREATE SELECTED-DATE BOOKING
   ========================================================= */

function createCalendarBookingElement(
    booking
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'calendar-booking';


    article.dataset.bookingId =
        booking.id || '';


    const name =
        booking.customer_name ||
        'Unknown Customer';


    const functionType =
        booking.function_type ||
        'Photography Event';


    const time =
        booking.booking_time
            ? formatBookingCalendarTime(
                booking.booking_time
            )
            : 'Time not specified';


    const status =
        formatCalendarStatus(
            booking.status
        );


    article.innerHTML = `

        <div class="calendar-booking-info">

            <strong>
                ${escapeHtml(name)}
            </strong>

            <span>
                ${escapeHtml(functionType)}
            </span>

            <small>
                ${escapeHtml(time)}
            </small>

        </div>


        <span class="booking-status booking-status-${slugify(status)}">

            ${escapeHtml(status)}

        </span>

    `;


    return article;

}


/* =========================================================
   20. FORMAT CALENDAR TIME
   ========================================================= */

function formatBookingCalendarTime(
    value
) {

    const match =
        String(value).match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) {

        return String(value);

    }


    let hours =
        Number(
            match[1]
        );


    const minutes =
        match[2];


    const period =
        hours >= 12
            ? 'PM'
            : 'AM';


    hours =
        hours % 12 || 12;


    return `${hours}:${minutes} ${period}`;

}


/* =========================================================
   21. FORMAT CALENDAR STATUS
   ========================================================= */

function formatCalendarStatus(
    status
) {

    const normalized =
        String(
            status ||
            'pending'
        )
            .trim()
            .toLowerCase();


    const labels = {

        pending:
            'Pending',

        confirmed:
            'Confirmed',

        completed:
            'Completed',

        cancelled:
            'Cancelled',

        canceled:
            'Cancelled',

        rejected:
            'Rejected'

    };


    return (
        labels[normalized] ||
        capitalizeWords(
            normalized
        )
    );

}


/* =========================================================
   22. GO TO PREVIOUS MONTH
   ========================================================= */

function calendarPreviousMonth() {

    const current =
        RS_CALENDAR_STATE.currentDate;


    RS_CALENDAR_STATE.currentDate =
        new Date(
            current.getFullYear(),
            current.getMonth() - 1,
            1
        );


    RS_CALENDAR_STATE.selectedDate =
        null;


    loadCalendarBookings();

}


/* =========================================================
   23. GO TO NEXT MONTH
   ========================================================= */

function calendarNextMonth() {

    const current =
        RS_CALENDAR_STATE.currentDate;


    RS_CALENDAR_STATE.currentDate =
        new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            1
        );


    RS_CALENDAR_STATE.selectedDate =
        null;


    loadCalendarBookings();

}


/* =========================================================
   24. GO TO TODAY
   ========================================================= */

function calendarToday() {

    const today =
        new Date();


    RS_CALENDAR_STATE.currentDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    RS_CALENDAR_STATE.selectedDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    loadCalendarBookings();

}


/* =========================================================
   25. CALENDAR NAVIGATION ACTIONS
   ========================================================= */

function handleCalendarAction(
    event
) {

    const button =
        event.target.closest(
            '[data-action]'
        );


    if (!button) {

        return;

    }


    const action =
        button.getAttribute(
            'data-action'
        );


    switch (action) {

        case 'calendar-previous':

            event.preventDefault();

            calendarPreviousMonth();

            break;


        case 'calendar-next':

            event.preventDefault();

            calendarNextMonth();

            break;


        case 'calendar-today':

            event.preventDefault();

            calendarToday();

            break;


        default:

            break;

    }

}


/* =========================================================
   26. NAVIGATION EVENT
   ========================================================= */

function handleCalendarNavigation(
    event
) {

    const detail =
        event?.detail;


    if (!detail) {

        return;

    }


    if (
        detail.section !== 'navigation'
    ) {

        return;

    }


    if (
        detail.event !== 'page-changed'
    ) {

        return;

    }


    if (
        detail.page !== 'calendar'
    ) {

        return;

    }


    loadCalendarBookings();

}


/* =========================================================
   27. BOOKING CHANGE EVENT
   ========================================================= */

function handleCalendarBookingChange(
    event
) {

    const detail =
        event?.detail;


    if (!detail) {

        return;

    }


    if (
        detail.section !== 'bookings'
    ) {

        return;

    }


    if (
        detail.event === 'created' ||
        detail.event === 'updated' ||
        detail.event === 'deleted'
    ) {

        /*
         * Refresh only when the Calendar page is active.
         */

        const elements =
            getCalendarElements();


        if (
            elements.page &&
            elements.page.hidden === false
        ) {

            loadCalendarBookings();

        }

    }

}


/* =========================================================
   28. INITIALIZE CALENDAR
   ========================================================= */

function initializeCalendar() {

    if (
        RS_CALENDAR_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getCalendarElements();


    if (!elements.page) {

        debugError(
            'Calendar page element was not found.'
        );


        return false;

    }


    document.addEventListener(
        'click',
        handleCalendarAction
    );


    window.addEventListener(
        'rs:state-changed',
        handleCalendarNavigation
    );


    window.addEventListener(
        'rs:state-changed',
        handleCalendarBookingChange
    );


    RS_CALENDAR_INITIALIZED =
        true;


    debugLog(
        'Calendar module initialized.'
    );


    /*
     * Load immediately if Calendar is already visible.
     */

    if (
        elements.page.hidden === false &&
        isAuthenticated()
    ) {

        loadCalendarBookings();

    }


    return true;

}


/* =========================================================
   29. REFRESH CALENDAR
   ========================================================= */

async function refreshCalendar() {

    return loadCalendarBookings();

}


/* =========================================================
   30. CLEANUP
   ========================================================= */

function destroyCalendar() {

    RS_CALENDAR_INITIALIZED =
        false;

    RS_CALENDAR_LOADING =
        false;

    RS_CALENDAR_STATE.bookings =
        [];

    RS_CALENDAR_STATE.selectedDate =
        null;

}


/* =========================================================
   END OF 10-CALENDAR.JS
   ========================================================= */

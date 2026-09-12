
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 08 — DASHBOARD
   File: 08-dashboard.js

   RESPONSIBILITY:
   - Dashboard statistics
   - Recent bookings
   - Upcoming bookings
   - Dashboard rendering
   - Dashboard loading state
   - Dashboard empty state
   - Dashboard error state

   THIS FILE DOES NOT:
   - Handle authentication
   - Handle sidebar
   - Handle navigation
   - Perform booking CRUD
   - Manage calendar
   - Manage contracts
   ========================================================= */

'use strict';


/* =========================================================
   1. DASHBOARD MODULE STATE
   ========================================================= */

let RS_DASHBOARD_INITIALIZED = false;

let RS_DASHBOARD_LOADING = false;


/* =========================================================
   2. DASHBOARD CONFIGURATION
   ========================================================= */

const DASHBOARD_CONFIG = Object.freeze({

    recentLimit: 5,

    upcomingLimit: 5,

    refreshInterval:
        5 * 60 * 1000

});


/* =========================================================
   3. DASHBOARD DOM ELEMENTS
   ========================================================= */

function getDashboardElements() {

    return {

        page:
            domSelect(
                '[data-page-view="dashboard"]'
            ),

        totalBookings:
            domSelect(
                '[data-dashboard-stat="total-bookings"]'
            ),

        pendingBookings:
            domSelect(
                '[data-dashboard-stat="pending-bookings"]'
            ),

        confirmedBookings:
            domSelect(
                '[data-dashboard-stat="confirmed-bookings"]'
            ),

        monthBookings:
            domSelect(
                '[data-dashboard-stat="month-bookings"]'
            ),

        recentList:
            domSelect(
                '[data-dashboard-list="recent"]'
            ),

        upcomingList:
            domSelect(
                '[data-dashboard-list="upcoming"]'
            ),

        loading:
            domSelect(
                '[data-dashboard-state="loading"]'
            ),

        empty:
            domSelect(
                '[data-dashboard-state="empty"]'
            ),

        error:
            domSelect(
                '[data-dashboard-state="error"]'
            )

    };

}


/* =========================================================
   4. DASHBOARD VISIBILITY CHECK
   ========================================================= */

function isDashboardPageVisible() {

    const page =
        getDashboardElements().page;


    if (!page) {

        return false;

    }


    return (
        page.hidden === false &&
        page.classList.contains(
            'page-active'
        )
    );

}


/* =========================================================
   5. DASHBOARD LOADING STATE
   ========================================================= */

function setDashboardLoading(
    loading
) {

    RS_DASHBOARD_LOADING =
        Boolean(loading);


    const elements =
        getDashboardElements();


    if (elements.loading) {

        elements.loading.hidden =
            !RS_DASHBOARD_LOADING;

    }


    if (elements.page) {

        elements.page.classList.toggle(
            'dashboard-loading',
            RS_DASHBOARD_LOADING
        );

    }

}


/* =========================================================
   6. DASHBOARD ERROR STATE
   ========================================================= */

function setDashboardError(
    message
) {

    const elements =
        getDashboardElements();


    if (!elements.error) {

        return;

    }


    elements.error.textContent =
        message ||
        'Unable to load dashboard data.';


    elements.error.hidden =
        !message;

}


/* =========================================================
   7. DASHBOARD EMPTY STATE
   ========================================================= */

function setDashboardEmpty(
    empty
) {

    const elements =
        getDashboardElements();


    if (!elements.empty) {

        return;

    }


    elements.empty.hidden =
        !Boolean(empty);

}


/* =========================================================
   8. FORMAT BOOKING STATUS
   ========================================================= */

function formatBookingStatus(
    status
) {

    if (!status) {

        return 'Pending';

    }


    const normalized =
        String(status)
            .trim()
            .toLowerCase();


    const statusMap = {

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
        statusMap[normalized] ||
        capitalizeWords(status)
    );

}


/* =========================================================
   9. FORMAT CURRENCY
   ========================================================= */

function formatDashboardCurrency(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return '₹0';

    }


    const numericValue =
        Number(
            String(value)
                .replace(/[₹,\s]/g, '')
        );


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        return '₹0';

    }


    return new Intl.NumberFormat(
        'en-IN',
        {

            style: 'currency',

            currency: 'INR',

            maximumFractionDigits: 0

        }
    ).format(
        numericValue
    );

}


/* =========================================================
   10. FORMAT BOOKING DATE
   ========================================================= */

function formatDashboardDate(
    value
) {

    if (!value) {

        return 'Date not available';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        'en-IN',
        {

            day: '2-digit',

            month: 'short',

            year: 'numeric'

        }
    );

}


/* =========================================================
   11. FORMAT BOOKING TIME
   ========================================================= */

function formatDashboardTime(
    value
) {

    if (!value) {

        return '';

    }


    /*
     * If the database contains a simple time such as
     * 18:30: keep it readable.
     */

    const match =
        String(value).match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) {

        return String(value);

    }


    let hours =
        Number(match[1]);


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
   12. GET BOOKING CUSTOMER NAME
   ========================================================= */

function getDashboardCustomerName(
    booking
) {

    return (

        booking?.customer_name ||

        booking?.name ||

        booking?.customerName ||

        'Unknown Customer'

    );

}


/* =========================================================
   13. GET BOOKING FUNCTION TYPE
   ========================================================= */

function getDashboardFunctionType(
    booking
) {

    return (

        booking?.function_type ||

        booking?.functionType ||

        booking?.event_type ||

        booking?.eventType ||

        'Photography Event'

    );

}


/* =========================================================
   14. GET BOOKING DATE
   ========================================================= */

function getDashboardBookingDate(
    booking
) {

    return (

        booking?.booking_date ||

        booking?.bookingDate ||

        booking?.event_date ||

        booking?.eventDate ||

        null

    );

}


/* =========================================================
   15. GET BOOKING AMOUNT
   ========================================================= */

function getDashboardBookingAmount(
    booking
) {

    return (

        booking?.expected_money ||

        booking?.amount ||

        booking?.price ||

        booking?.total_amount ||

        0

    );

}


/* =========================================================
   16. CREATE RECENT BOOKING ELEMENT
   ========================================================= */

function createRecentBookingElement(
    booking
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'dashboard-booking-card';


    article.dataset.bookingId =
        booking?.id || '';


    const name =
        getDashboardCustomerName(
            booking
        );


    const functionType =
        getDashboardFunctionType(
            booking
        );


    const date =
        formatDashboardDate(
            getDashboardBookingDate(
                booking
            )
        );


    const amount =
        formatDashboardCurrency(
            getDashboardBookingAmount(
                booking
            )
        );


    const status =
        formatBookingStatus(
            booking?.status
        );


    article.innerHTML = `

        <div class="dashboard-booking-main">

            <div class="dashboard-booking-customer">

                <strong>
                    ${escapeHtml(name)}
                </strong>

                <span>
                    ${escapeHtml(functionType)}
                </span>

            </div>

            <div class="dashboard-booking-date">

                ${escapeHtml(date)}

            </div>

        </div>


        <div class="dashboard-booking-meta">

            <span class="booking-status booking-status-${slugify(status)}">

                ${escapeHtml(status)}

            </span>


            <span class="dashboard-booking-amount">

                ${escapeHtml(amount)}

            </span>

        </div>

    `;


    return article;

}


/* =========================================================
   17. CREATE UPCOMING BOOKING ELEMENT
   ========================================================= */

function createUpcomingBookingElement(
    booking
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'dashboard-upcoming-card';


    article.dataset.bookingId =
        booking?.id || '';


    const name =
        getDashboardCustomerName(
            booking
        );


    const functionType =
        getDashboardFunctionType(
            booking
        );


    const date =
        formatDashboardDate(
            getDashboardBookingDate(
                booking
            )
        );


    const time =
        formatDashboardTime(
            booking?.booking_time
        );


    article.innerHTML = `

        <div class="upcoming-date">

            <span>
                ${escapeHtml(date)}
            </span>

        </div>


        <div class="upcoming-details">

            <strong>
                ${escapeHtml(name)}
            </strong>

            <span>
                ${escapeHtml(functionType)}
            </span>

            ${
                time
                    ? `<small>${escapeHtml(time)}</small>`
                    : ''
            }

        </div>

    `;


    return article;

}


/* =========================================================
   18. RENDER RECENT BOOKINGS
   ========================================================= */

function renderRecentBookings(
    bookings
) {

    const elements =
        getDashboardElements();


    if (!elements.recentList) {

        return;

    }


    elements.recentList.innerHTML =
        '';


    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        const empty =
            document.createElement(
                'div'
            );


        empty.className =
            'dashboard-list-empty';


        empty.textContent =
            'No recent bookings.';


        elements.recentList.appendChild(
            empty
        );


        return;

    }


    bookings
        .slice(
            0,
            DASHBOARD_CONFIG.recentLimit
        )
        .forEach(
            (booking) => {

                elements.recentList.appendChild(
                    createRecentBookingElement(
                        booking
                    )
                );

            }
        );

}


/* =========================================================
   19. RENDER UPCOMING BOOKINGS
   ========================================================= */

function renderUpcomingBookings(
    bookings
) {

    const elements =
        getDashboardElements();


    if (!elements.upcomingList) {

        return;

    }


    elements.upcomingList.innerHTML =
        '';


    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        const empty =
            document.createElement(
                'div'
            );


        empty.className =
            'dashboard-list-empty';


        empty.textContent =
            'No upcoming bookings.';


        elements.upcomingList.appendChild(
            empty
        );


        return;

    }


    bookings
        .slice(
            0,
            DASHBOARD_CONFIG.upcomingLimit
        )
        .forEach(
            (booking) => {

                elements.upcomingList.appendChild(
                    createUpcomingBookingElement(
                        booking
                    )
                );

            }
        );

}


/* =========================================================
   20. UPDATE STATISTICS
   ========================================================= */

function renderDashboardStatistics(
    statistics
) {

    const elements =
        getDashboardElements();


    if (elements.totalBookings) {

        elements.totalBookings.textContent =
            String(
                statistics.total
            );

    }


    if (elements.pendingBookings) {

        elements.pendingBookings.textContent =
            String(
                statistics.pending
            );

    }


    if (elements.confirmedBookings) {

        elements.confirmedBookings.textContent =
            String(
                statistics.confirmed
            );

    }


    if (elements.monthBookings) {

        elements.monthBookings.textContent =
            String(
                statistics.thisMonth
            );

    }

}


/* =========================================================
   21. CALCULATE STATISTICS
   ========================================================= */

function calculateDashboardStatistics(
    bookings
) {

    if (
        !Array.isArray(bookings)
    ) {

        return {

            total: 0,

            pending: 0,

            confirmed: 0,

            thisMonth: 0

        };

    }


    const now =
        new Date();


    const currentYear =
        now.getFullYear();


    const currentMonth =
        now.getMonth();


    let pending = 0;

    let confirmed = 0;

    let thisMonth = 0;


    bookings.forEach(
        (booking) => {

            const status =
                String(
                    booking?.status || ''
                )
                    .trim()
                    .toLowerCase();


            if (
                status === 'pending'
            ) {

                pending++;

            }


            if (
                status === 'confirmed'
            ) {

                confirmed++;

            }


            const rawDate =
                getDashboardBookingDate(
                    booking
                );


            if (!rawDate) {

                return;

            }


            const date =
                new Date(rawDate);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return;

            }


            if (
                date.getFullYear() === currentYear &&
                date.getMonth() === currentMonth
            ) {

                thisMonth++;

            }

        }
    );


    return {

        total:
            bookings.length,

        pending,

        confirmed,

        thisMonth

    };

}


/* =========================================================
   22. SORT RECENT BOOKINGS
   ========================================================= */

function sortRecentBookings(
    bookings
) {

    return [
        ...bookings
    ].sort(
        (
            first,
            second
        ) => {

            const firstDate =
                new Date(
                    first?.created_at ||
                    first?.createdAt ||
                    getDashboardBookingDate(
                        first
                    ) ||
                    0
                ).getTime();


            const secondDate =
                new Date(
                    second?.created_at ||
                    second?.createdAt ||
                    getDashboardBookingDate(
                        second
                    ) ||
                    0
                ).getTime();


            return (
                secondDate -
                firstDate
            );

        }
    );

}


/* =========================================================
   23. SORT UPCOMING BOOKINGS
   ========================================================= */

function sortUpcomingBookings(
    bookings
) {

    const now =
        new Date();


    return [
        ...bookings
    ]
        .filter(
            (booking) => {

                const rawDate =
                    getDashboardBookingDate(
                        booking
                    );


                if (!rawDate) {

                    return false;

                }


                const date =
                    new Date(
                        rawDate
                    );


                return (
                    !Number.isNaN(
                        date.getTime()
                    ) &&
                    date >= now
                );

            }
        )
        .sort(
            (
                first,
                second
            ) => {

                const firstDate =
                    new Date(
                        getDashboardBookingDate(
                            first
                        )
                    ).getTime();


                const secondDate =
                    new Date(
                        getDashboardBookingDate(
                            second
                        )
                    ).getTime();


                return (
                    firstDate -
                    secondDate
                );

            }
        );

}


/* =========================================================
   24. FETCH DASHBOARD BOOKINGS
   ========================================================= */

/**
 * The dashboard reads from the existing orders table.
 *
 * This keeps dashboard logic independent from the complete
 * booking-management module.
 */

async function fetchDashboardBookings() {

    const client =
        getSupabaseClient();


    const {
        data,
        error
    } = await client
        .from('orders')
        .select('*')
        .order(
            'created_at',
            {
                ascending: false
            }
        );


    if (error) {

        throw error;

    }


    return Array.isArray(data)
        ? data
        : [];

}


/* =========================================================
   25. LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {

    if (
        RS_DASHBOARD_LOADING
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Dashboard loading skipped: user is not authenticated.'
        );


        return;

    }


    setDashboardLoading(
        true
    );


    setDashboardError(
        ''
    );


    setDashboardEmpty(
        false
    );


    try {

        const bookings =
            await fetchDashboardBookings();


        const statistics =
            calculateDashboardStatistics(
                bookings
            );


        const recent =
            sortRecentBookings(
                bookings
            );


        const upcoming =
            sortUpcomingBookings(
                bookings
            );


        renderDashboardStatistics(
            statistics
        );


        renderRecentBookings(
            recent
        );


        renderUpcomingBookings(
            upcoming
        );


        setDashboardEmpty(
            bookings.length === 0
        );


        /*
         * Store a lightweight copy in application state.
         * The complete booking module will later own the
         * main booking dataset.
         */

        if (
            RS_STATE.dashboard
        ) {

            RS_STATE.dashboard.lastLoaded =
                new Date().toISOString();

        }


        notifyStateChange(
            'dashboard',
            {

                event: 'loaded',

                total:
                    statistics.total

            }
        );


    } catch (error) {

        const normalizedError =
            normalizeError(error);


        const friendlyMessage =
            getFriendlyAuthError(
                normalizedError
            );


        setDashboardError(
            friendlyMessage ||
            'Unable to load dashboard data.'
        );


        debugError(
            'Dashboard loading failed:',
            normalizedError
        );


    } finally {

        setDashboardLoading(
            false
        );

    }

}


/* =========================================================
   26. DASHBOARD REFRESH
   ========================================================= */

async function refreshDashboard() {

    return loadDashboard();

}


/* =========================================================
   27. DASHBOARD NAVIGATION EVENT
   ========================================================= */

function handleDashboardNavigation(
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
        detail.page !== 'dashboard'
    ) {

        return;

    }


    /*
     * Loading happens after navigation has finished.
     */

    loadDashboard();

}


/* =========================================================
   28. DASHBOARD INITIALIZATION
   ========================================================= */

function initializeDashboard() {

    if (
        RS_DASHBOARD_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getDashboardElements();


    if (!elements.page) {

        debugError(
            'Dashboard page element was not found.'
        );


        return false;

    }


    window.addEventListener(
        'rs:state-changed',
        handleDashboardNavigation
    );


    RS_DASHBOARD_INITIALIZED =
        true;


    debugLog(
        'Dashboard initialized.'
    );


    /*
     * If Dashboard is already the initial page,
     * load immediately.
     */

    if (
        isDashboardPageVisible() &&
        isAuthenticated()
    ) {

        loadDashboard();

    }


    return true;

}


/* =========================================================
   29. DASHBOARD CLEANUP
   ========================================================= */

function destroyDashboard() {

    RS_DASHBOARD_INITIALIZED =
        false;

    RS_DASHBOARD_LOADING =
        false;

}


/* =========================================================
   END OF 08-DASHBOARD.JS
   ========================================================= */


/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 09 — BOOKINGS
   File: 09-bookings.js

   DATABASE TABLE:
   public.orders

   EXPECTED EXISTING COLUMNS:
   - id
   - customer_name
   - phone
   - location
   - booking_date
   - booking_time
   - function_type
   - expected_money
   - notes
   - status
   - created_at

   RESPONSIBILITY:
   - Load bookings
   - Search
   - Filter
   - Sort
   - Create
   - Read
   - Update
   - Delete
   - Render booking list

   THIS FILE DOES NOT:
   - Handle login
   - Handle logout
   - Handle sidebar
   - Control navigation
   - Manage contracts
   - Manage gallery
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_BOOKINGS_INITIALIZED = false;

let RS_BOOKINGS_LOADING = false;

let RS_BOOKINGS_DELETE_LOADING = false;


/* =========================================================
   2. BOOKING CONFIGURATION
   ========================================================= */

const BOOKINGS_CONFIG = Object.freeze({

    table:
        'orders',

    defaultStatus:
        'pending',

    defaultSort:
        'newest',

    pageSize:
        50

});


/* =========================================================
   3. GET BOOKING ELEMENTS
   ========================================================= */

function getBookingElements() {

    return {

        page:
            domSelect(
                '[data-page-view="bookings"]'
            ),

        list:
            domSelect(
                '[data-bookings-list]'
            ),

        tableBody:
            domSelect(
                '[data-bookings-table-body]'
            ),

        search:
            domSelect(
                '[data-bookings-search]'
            ),

        statusFilter:
            domSelect(
                '[data-bookings-status-filter]'
            ),

        dateFilter:
            domSelect(
                '[data-bookings-date-filter]'
            ),

        sort:
            domSelect(
                '[data-bookings-sort]'
            ),

        empty:
            domSelect(
                '[data-bookings-state="empty"]'
            ),

        loading:
            domSelect(
                '[data-bookings-state="loading"]'
            ),

        error:
            domSelect(
                '[data-bookings-state="error"]'
            ),

        resultCount:
            domSelect(
                '[data-bookings-result-count]'
            ),

        newButton:
            domSelect(
                '[data-action="open-new-booking"]'
            )

    };

}


/* =========================================================
   4. BOOKING STATE INITIALIZATION
   ========================================================= */

function initializeBookingState() {

    if (!RS_STATE.bookings) {

        RS_STATE.bookings = {

            items: [],

            filteredItems: [],

            loading: false,

            search:
                '',

            status:
                'all',

            date:
                '',

            sort:
                BOOKINGS_CONFIG.defaultSort,

            selectedId:
                null

        };

    }

}


/* =========================================================
   5. NORMALIZE BOOKING
   ========================================================= */

function normalizeBooking(
    booking
) {

    if (!booking) {

        return null;

    }


    return {

        ...booking,

        id:
            booking.id ?? null,

        customer_name:
            booking.customer_name ?? '',

        phone:
            booking.phone ?? '',

        location:
            booking.location ?? '',

        booking_date:
            booking.booking_date ?? '',

        booking_time:
            booking.booking_time ?? '',

        function_type:
            booking.function_type ?? '',

        expected_money:
            booking.expected_money ?? '',

        notes:
            booking.notes ?? '',

        status:
            booking.status ||
            BOOKINGS_CONFIG.defaultStatus,

        created_at:
            booking.created_at ?? null

    };

}


/* =========================================================
   6. LOAD ALL BOOKINGS
   ========================================================= */

async function loadBookings() {

    if (
        RS_BOOKINGS_LOADING
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Bookings loading skipped: user is not authenticated.'
        );


        return;

    }


    RS_BOOKINGS_LOADING =
        true;


    setBookingLoading(
        true
    );


    setBookingError(
        ''
    );


    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client
            .from(
                BOOKINGS_CONFIG.table
            )
            .select('*')
            .order(
                'created_at',
                {
                    ascending: false
                }
            )
            .limit(
                BOOKINGS_CONFIG.pageSize
            );


        if (error) {

            throw error;

        }


        const bookings =
            Array.isArray(data)
                ? data
                    .map(normalizeBooking)
                    .filter(Boolean)
                : [];


        RS_STATE.bookings.items =
            bookings;


        applyBookingFilters();


        renderBookings();


        notifyStateChange(
            'bookings',
            {

                event:
                    'loaded',

                count:
                    bookings.length

            }
        );


    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setBookingError(
            normalizedError.message ||
            'Unable to load bookings.'
        );


        debugError(
            'Bookings loading failed:',
            normalizedError
        );


    } finally {

        RS_BOOKINGS_LOADING =
            false;


        setBookingLoading(
            false
        );

    }

}


/* =========================================================
   7. SET LOADING STATE
   ========================================================= */

function setBookingLoading(
    loading
) {

    const elements =
        getBookingElements();


    if (elements.loading) {

        elements.loading.hidden =
            !Boolean(loading);

    }


    if (elements.page) {

        elements.page.classList.toggle(
            'bookings-loading',
            Boolean(loading)
        );

    }


    RS_STATE.bookings.loading =
        Boolean(loading);

}


/* =========================================================
   8. SET ERROR STATE
   ========================================================= */

function setBookingError(
    message
) {

    const elements =
        getBookingElements();


    if (!elements.error) {

        return;

    }


    elements.error.textContent =
        message || '';


    elements.error.hidden =
        !Boolean(message);

}


/* =========================================================
   9. GET SEARCH TEXT
   ========================================================= */

function getBookingSearchText() {

    const value =
        RS_STATE.bookings.search;


    return String(
        value || ''
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   10. SEARCH BOOKING
   ========================================================= */

function bookingMatchesSearch(
    booking,
    search
) {

    if (!search) {

        return true;

    }


    const searchableText = [

        booking.customer_name,

        booking.phone,

        booking.location,

        booking.function_type,

        booking.status,

        booking.notes

    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


    return searchableText.includes(
        search
    );

}


/* =========================================================
   11. STATUS FILTER
   ========================================================= */

function bookingMatchesStatus(
    booking,
    status
) {

    if (
        !status ||
        status === 'all'
    ) {

        return true;

    }


    return (
        String(
            booking.status || ''
        )
            .trim()
            .toLowerCase()
        ===
        String(status)
            .trim()
            .toLowerCase()
    );

}


/* =========================================================
   12. DATE FILTER
   ========================================================= */

function bookingMatchesDate(
    booking,
    selectedDate
) {

    if (!selectedDate) {

        return true;

    }


    return (
        String(
            booking.booking_date || ''
        )
        ===
        String(selectedDate)
    );

}


/* =========================================================
   13. SORT BOOKINGS
   ========================================================= */

function sortBookings(
    bookings,
    sort
) {

    const sorted =
        [...bookings];


    sorted.sort(
        (
            first,
            second
        ) => {

            switch (sort) {

                case 'oldest': {

                    return compareDates(
                        first.created_at,
                        second.created_at
                    );

                }


                case 'date-asc': {

                    return compareDates(
                        first.booking_date,
                        second.booking_date
                    );

                }


                case 'date-desc': {

                    return compareDates(
                        second.booking_date,
                        first.booking_date
                    );

                }


                case 'customer-asc': {

                    return String(
                        first.customer_name || ''
                    ).localeCompare(
                        String(
                            second.customer_name || ''
                        )
                    );

                }


                case 'customer-desc': {

                    return String(
                        second.customer_name || ''
                    ).localeCompare(
                        String(
                            first.customer_name || ''
                        )
                    );

                }


                case 'newest':
                default: {

                    return compareDates(
                        second.created_at,
                        first.created_at
                    );

                }

            }

        }
    );


    return sorted;

}


/* =========================================================
   14. APPLY FILTERS
   ========================================================= */

function applyBookingFilters() {

    initializeBookingState();


    const allBookings =
        Array.isArray(
            RS_STATE.bookings.items
        )
            ? RS_STATE.bookings.items
            : [];


    const search =
        getBookingSearchText();


    const status =
        RS_STATE.bookings.status;


    const date =
        RS_STATE.bookings.date;


    const sort =
        RS_STATE.bookings.sort;


    const filtered =
        allBookings.filter(
            (booking) => {

                return (

                    bookingMatchesSearch(
                        booking,
                        search
                    ) &&

                    bookingMatchesStatus(
                        booking,
                        status
                    ) &&

                    bookingMatchesDate(
                        booking,
                        date
                    )

                );

            }
        );


    RS_STATE.bookings.filteredItems =
        sortBookings(
            filtered,
            sort
        );


    return RS_STATE.bookings.filteredItems;

}


/* =========================================================
   15. UPDATE SEARCH
   ========================================================= */

function updateBookingSearch(
    value
) {

    RS_STATE.bookings.search =
        String(
            value || ''
        );


    applyBookingFilters();


    renderBookings();

}


/* =========================================================
   16. UPDATE STATUS FILTER
   ========================================================= */

function updateBookingStatusFilter(
    value
) {

    RS_STATE.bookings.status =
        value || 'all';


    applyBookingFilters();


    renderBookings();

}


/* =========================================================
   17. UPDATE DATE FILTER
   ========================================================= */

function updateBookingDateFilter(
    value
) {

    RS_STATE.bookings.date =
        value || '';


    applyBookingFilters();


    renderBookings();

}


/* =========================================================
   18. UPDATE SORT
   ========================================================= */

function updateBookingSort(
    value
) {

    RS_STATE.bookings.sort =
        value ||
        BOOKINGS_CONFIG.defaultSort;


    applyBookingFilters();


    renderBookings();

}


/* =========================================================
   19. FORMAT BOOKING DATE
   ========================================================= */

function formatBookingDate(
    value
) {

    if (!value) {

        return 'Not scheduled';

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
   20. FORMAT BOOKING TIME
   ========================================================= */

function formatBookingTime(
    value
) {

    if (!value) {

        return '';

    }


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
   21. FORMAT MONEY
   ========================================================= */

function formatBookingMoney(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return '₹0';

    }


    const amount =
        Number(
            String(value)
                .replace(/[₹,\s]/g, '')
        );


    if (
        !Number.isFinite(amount)
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
    ).format(amount);

}


/* =========================================================
   22. FORMAT STATUS
   ========================================================= */

function formatBookingStatusText(
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
   23. CREATE BOOKING CARD
   ========================================================= */

function createBookingCard(
    booking
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'booking-card';


    article.dataset.bookingId =
        booking.id || '';


    const status =
        formatBookingStatusText(
            booking.status
        );


    article.innerHTML = `

        <div class="booking-card-header">

            <div>

                <h3>
                    ${escapeHtml(
                        booking.customer_name ||
                        'Unknown Customer'
                    )}
                </h3>

                <span class="booking-function">

                    ${escapeHtml(
                        booking.function_type ||
                        'Photography Event'
                    )}

                </span>

            </div>


            <span class="booking-status booking-status-${slugify(status)}">

                ${escapeHtml(status)}

            </span>

        </div>


        <div class="booking-card-details">

            <div>

                <span class="booking-label">
                    Date
                </span>

                <strong>

                    ${escapeHtml(
                        formatBookingDate(
                            booking.booking_date
                        )
                    )}

                </strong>

            </div>


            <div>

                <span class="booking-label">
                    Time
                </span>

                <strong>

                    ${escapeHtml(
                        formatBookingTime(
                            booking.booking_time
                        ) ||
                        'Not specified'
                    )}

                </strong>

            </div>


            <div>

                <span class="booking-label">
                    Location
                </span>

                <strong>

                    ${escapeHtml(
                        booking.location ||
                        'Not specified'
                    )}

                </strong>

            </div>


            <div>

                <span class="booking-label">
                    Amount
                </span>

                <strong>

                    ${escapeHtml(
                        formatBookingMoney(
                            booking.expected_money
                        )
                    )}

                </strong>

            </div>

        </div>


        <div class="booking-card-actions">

            <button
                type="button"
                class="btn btn-secondary"
                data-action="view-booking"
                data-booking-id="${escapeHtml(
                    String(booking.id || '')
                )}">

                View

            </button>


            <button
                type="button"
                class="btn btn-secondary"
                data-action="edit-booking"
                data-booking-id="${escapeHtml(
                    String(booking.id || '')
                )}">

                Edit

            </button>


            <button
                type="button"
                class="btn btn-danger"
                data-action="delete-booking"
                data-booking-id="${escapeHtml(
                    String(booking.id || '')
                )}">

                Delete

            </button>

        </div>

    `;


    return article;

}


/* =========================================================
   24. CREATE TABLE ROW
   ========================================================= */

function createBookingTableRow(
    booking
) {

    const row =
        document.createElement(
            'tr'
        );


    row.dataset.bookingId =
        booking.id || '';


    const status =
        formatBookingStatusText(
            booking.status
        );


    row.innerHTML = `

        <td>

            <strong>

                ${escapeHtml(
                    booking.customer_name ||
                    'Unknown Customer'
                )}

            </strong>

        </td>


        <td>

            ${escapeHtml(
                booking.function_type ||
                'Photography Event'
            )}

        </td>


        <td>

            ${escapeHtml(
                formatBookingDate(
                    booking.booking_date
                )
            )}

        </td>


        <td>

            ${escapeHtml(
                booking.location ||
                'Not specified'
            )}

        </td>


        <td>

            <span class="booking-status booking-status-${slugify(status)}">

                ${escapeHtml(status)}

            </span>

        </td>


        <td>

            ${escapeHtml(
                formatBookingMoney(
                    booking.expected_money
                )
            )}

        </td>


        <td>

            <div class="booking-table-actions">

                <button
                    type="button"
                    class="btn btn-small btn-secondary"
                    data-action="view-booking"
                    data-booking-id="${escapeHtml(
                        String(booking.id || '')
                    )}">

                    View

                </button>


                <button
                    type="button"
                    class="btn btn-small btn-secondary"
                    data-action="edit-booking"
                    data-booking-id="${escapeHtml(
                        String(booking.id || '')
                    )}">

                    Edit

                </button>


                <button
                    type="button"
                    class="btn btn-small btn-danger"
                    data-action="delete-booking"
                    data-booking-id="${escapeHtml(
                        String(booking.id || '')
                    )}">

                    Delete

                </button>

            </div>

        </td>

    `;


    return row;

}


/* =========================================================
   25. RENDER BOOKINGS
   ========================================================= */

function renderBookings() {

    const elements =
        getBookingElements();


    const bookings =
        RS_STATE.bookings.filteredItems || [];


    /*
     * Mobile/card layout.
     */

    if (elements.list) {

        elements.list.innerHTML =
            '';


        bookings.forEach(
            (booking) => {

                elements.list.appendChild(
                    createBookingCard(
                        booking
                    )
                );

            }
        );

    }


    /*
     * Desktop/table layout.
     */

    if (elements.tableBody) {

        elements.tableBody.innerHTML =
            '';


        bookings.forEach(
            (booking) => {

                elements.tableBody.appendChild(
                    createBookingTableRow(
                        booking
                    )
                );

            }
        );

    }


    /*
     * Result count.
     */

    if (elements.resultCount) {

        elements.resultCount.textContent =
            String(
                bookings.length
            );

    }


    /*
     * Empty state.
     */

    if (elements.empty) {

        elements.empty.hidden =
            bookings.length !== 0;

    }

}


/* =========================================================
   26. FIND BOOKING
   ========================================================= */

function findBookingById(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    const bookings =
        RS_STATE.bookings.items || [];


    return (
        bookings.find(
            (booking) =>
                String(
                    booking.id
                )
                ===
                String(id)
        ) ||
        null
    );

}


/* =========================================================
   27. CREATE BOOKING
   ========================================================= */

async function createBooking(
    bookingData
) {

    if (
        !isAuthenticated()
    ) {

        return {

            success: false,

            error:
                'Authentication required.'

        };

    }


    if (
        !bookingData ||
        typeof bookingData !== 'object'
    ) {

        return {

            success: false,

            error:
                'Invalid booking data.'

        };

    }


    const payload = {

        customer_name:
            String(
                bookingData.customer_name || ''
            ).trim(),

        phone:
            String(
                bookingData.phone || ''
            ).trim(),

        location:
            String(
                bookingData.location || ''
            ).trim(),

        booking_date:
            bookingData.booking_date || null,

        booking_time:
            bookingData.booking_time || null,

        function_type:
            String(
                bookingData.function_type || ''
            ).trim(),

        expected_money:
            bookingData.expected_money || null,

        notes:
            String(
                bookingData.notes || ''
            ).trim(),

        status:
            bookingData.status ||
            BOOKINGS_CONFIG.defaultStatus

    };


    if (
        !payload.customer_name
    ) {

        return {

            success: false,

            error:
                'Customer name is required.'

        };

    }


    if (
        !payload.phone
    ) {

        return {

            success: false,

            error:
                'Phone number is required.'

        };

    }


    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client
            .from(
                BOOKINGS_CONFIG.table
            )
            .insert(
                payload
            )
            .select()
            .single();


        if (error) {

            throw error;

        }


        const booking =
            normalizeBooking(
                data
            );


        if (booking) {

            RS_STATE.bookings.items.unshift(
                booking
            );

        }


        applyBookingFilters();

        renderBookings();


        notifyStateChange(
            'bookings',
            {

                event:
                    'created',

                booking

            }
        );


        return {

            success: true,

            booking

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        debugError(
            'Create booking failed:',
            normalizedError
        );


        return {

            success: false,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   28. UPDATE BOOKING
   ========================================================= */

async function updateBooking(
    id,
    bookingData
) {

    if (
        !isAuthenticated()
    ) {

        return {

            success: false,

            error:
                'Authentication required.'

        };

    }


    if (
        id === null ||
        id === undefined
    ) {

        return {

            success: false,

            error:
                'Booking ID is required.'

        };

    }


    if (
        !bookingData ||
        typeof bookingData !== 'object'
    ) {

        return {

            success: false,

            error:
                'Invalid booking data.'

        };

    }


    const payload = {

        customer_name:
            String(
                bookingData.customer_name || ''
            ).trim(),

        phone:
            String(
                bookingData.phone || ''
            ).trim(),

        location:
            String(
                bookingData.location || ''
            ).trim(),

        booking_date:
            bookingData.booking_date || null,

        booking_time:
            bookingData.booking_time || null,

        function_type:
            String(
                bookingData.function_type || ''
            ).trim(),

        expected_money:
            bookingData.expected_money || null,

        notes:
            String(
                bookingData.notes || ''
            ).trim(),

        status:
            bookingData.status ||
            BOOKINGS_CONFIG.defaultStatus

    };


    if (
        !payload.customer_name
    ) {

        return {

            success: false,

            error:
                'Customer name is required.'

        };

    }


    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client
            .from(
                BOOKINGS_CONFIG.table
            )
            .update(
                payload
            )
            .eq(
                'id',
                id
            )
            .select()
            .single();


        if (error) {

            throw error;

        }


        const updatedBooking =
            normalizeBooking(
                data
            );


        const index =
            RS_STATE.bookings.items.findIndex(
                (booking) =>
                    String(
                        booking.id
                    )
                    ===
                    String(id)
            );


        if (
            index !== -1 &&
            updatedBooking
        ) {

            RS_STATE.bookings.items[index] =
                updatedBooking;

        }


        applyBookingFilters();

        renderBookings();


        notifyStateChange(
            'bookings',
            {

                event:
                    'updated',

                booking:
                    updatedBooking

            }
        );


        return {

            success: true,

            booking:
                updatedBooking

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        debugError(
            'Update booking failed:',
            normalizedError
        );


        return {

            success: false,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   29. DELETE BOOKING
   ========================================================= */

async function deleteBooking(
    id
) {

    if (
        !isAuthenticated()
    ) {

        return {

            success: false,

            error:
                'Authentication required.'

        };

    }


    if (
        id === null ||
        id === undefined
    ) {

        return {

            success: false,

            error:
                'Booking ID is required.'

        };

    }


    if (
        RS_BOOKINGS_DELETE_LOADING
    ) {

        return {

            success: false,

            error:
                'Another delete operation is already running.'

        };

    }


    RS_BOOKINGS_DELETE_LOADING =
        true;


    try {

        const client =
            getSupabaseClient();


        const {
            error
        } = await client
            .from(
                BOOKINGS_CONFIG.table
            )
            .delete()
            .eq(
                'id',
                id
            );


        if (error) {

            throw error;

        }


        RS_STATE.bookings.items =
            RS_STATE.bookings.items.filter(
                (booking) =>
                    String(
                        booking.id
                    )
                    !==
                    String(id)
            );


        applyBookingFilters();

        renderBookings();


        notifyStateChange(
            'bookings',
            {

                event:
                    'deleted',

                bookingId:
                    id

            }
        );


        return {

            success: true

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        debugError(
            'Delete booking failed:',
            normalizedError
        );


        return {

            success: false,

            error:
                normalizedError.message

        };

    } finally {

        RS_BOOKINGS_DELETE_LOADING =
            false;

    }

}


/* =========================================================
   30. GET BOOKING DETAILS
   ========================================================= */

async function getBookingDetails(
    id
) {

    if (
        !isAuthenticated()
    ) {

        return {

            success: false,

            booking: null,

            error:
                'Authentication required.'

        };

    }


    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client
            .from(
                BOOKINGS_CONFIG.table
            )
            .select('*')
            .eq(
                'id',
                id
            )
            .single();


        if (error) {

            throw error;

        }


        return {

            success: true,

            booking:
                normalizeBooking(
                    data
                )

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        return {

            success: false,

            booking: null,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   31. BOOKING ACTION HANDLER
   ========================================================= */

async function handleBookingAction(
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


    if (
        action !== 'view-booking' &&
        action !== 'edit-booking' &&
        action !== 'delete-booking'
    ) {

        return;

    }


    const bookingId =
        button.getAttribute(
            'data-booking-id'
        );


    if (!bookingId) {

        return;

    }


    event.preventDefault();


    const booking =
        findBookingById(
            bookingId
        );


    if (!booking) {

        debugError(
            `Booking not found: ${bookingId}`
        );


        return;

    }


    switch (action) {

        case 'view-booking':

            notifyStateChange(
                'bookings',
                {

                    event:
                        'view-requested',

                    booking

                }
            );

            break;


        case 'edit-booking':

            notifyStateChange(
                'bookings',
                {

                    event:
                        'edit-requested',

                    booking

                }
            );

            break;


        case 'delete-booking': {

            /*
             * Actual confirmation modal will be handled by
             * the modal layer.
             *
             * We only announce the request here.
             */

            notifyStateChange(
                'bookings',
                {

                    event:
                        'delete-requested',

                    booking

                }
            );

            break;

        }

    }

}


/* =========================================================
   32. BOOKING FILTER EVENTS
   ========================================================= */

function initializeBookingFilterEvents() {

    const elements =
        getBookingElements();


    if (elements.search) {

        elements.search.addEventListener(
            'input',
            (event) => {

                updateBookingSearch(
                    event.target.value
                );

            }
        );

    }


    if (elements.statusFilter) {

        elements.statusFilter.addEventListener(
            'change',
            (event) => {

                updateBookingStatusFilter(
                    event.target.value
                );

            }
        );

    }


    if (elements.dateFilter) {

        elements.dateFilter.addEventListener(
            'change',
            (event) => {

                updateBookingDateFilter(
                    event.target.value
                );

            }
        );

    }


    if (elements.sort) {

        elements.sort.addEventListener(
            'change',
            (event) => {

                updateBookingSort(
                    event.target.value
                );

            }
        );

    }

}


/* =========================================================
   33. BOOKING ACTION EVENTS
   ========================================================= */

function initializeBookingActionEvents() {

    document.addEventListener(
        'click',
        handleBookingAction
    );

}


/* =========================================================
   34. NAVIGATION EVENT
   ========================================================= */

function handleBookingNavigation(
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
        detail.page !== 'bookings'
    ) {

        return;

    }


    /*
     * Load bookings only when the Bookings page is
     * actually opened.
     */

    loadBookings();

}


/* =========================================================
   35. BOOKING CHANGE EVENT
   ========================================================= */

function handleBookingStateChange(
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


    /*
     * Dashboard can be refreshed after a booking changes.
     */

    if (
        detail.event === 'created' ||
        detail.event === 'updated' ||
        detail.event === 'deleted'
    ) {

        if (
            typeof refreshDashboard ===
            'function'
        ) {

            refreshDashboard();

        }

    }

}


/* =========================================================
   36. INITIALIZE BOOKINGS
   ========================================================= */

function initializeBookings() {

    if (
        RS_BOOKINGS_INITIALIZED
    ) {

        return true;

    }


    initializeBookingState();


    initializeBookingFilterEvents();


    initializeBookingActionEvents();


    window.addEventListener(
        'rs:state-changed',
        handleBookingNavigation
    );


    window.addEventListener(
        'rs:state-changed',
        handleBookingStateChange
    );


    RS_BOOKINGS_INITIALIZED =
        true;


    debugLog(
        'Bookings module initialized.'
    );


    /*
     * If Bookings is already visible, load immediately.
     */

    const page =
        getBookingElements().page;


    if (
        page &&
        page.hidden === false &&
        isAuthenticated()
    ) {

        loadBookings();

    }


    return true;

}


/* =========================================================
   37. REFRESH BOOKINGS
   ========================================================= */

async function refreshBookings() {

    return loadBookings();

}


/* =========================================================
   38. CLEAR BOOKING FILTERS
   ========================================================= */

function clearBookingFilters() {

    initializeBookingState();


    RS_STATE.bookings.search =
        '';

    RS_STATE.bookings.status =
        'all';

    RS_STATE.bookings.date =
        '';

    RS_STATE.bookings.sort =
        BOOKINGS_CONFIG.defaultSort;


    const elements =
        getBookingElements();


    if (elements.search) {

        elements.search.value =
            '';

    }


    if (elements.statusFilter) {

        elements.statusFilter.value =
            'all';

    }


    if (elements.dateFilter) {

        elements.dateFilter.value =
            '';

    }


    if (elements.sort) {

        elements.sort.value =
            BOOKINGS_CONFIG.defaultSort;

    }


    applyBookingFilters();

    renderBookings();

}


/* =========================================================
   39. CLEANUP
   ========================================================= */

function destroyBookings() {

    RS_BOOKINGS_INITIALIZED =
        false;

    RS_BOOKINGS_LOADING =
        false;

    RS_BOOKINGS_DELETE_LOADING =
        false;

}


/* =========================================================
   END OF 09-BOOKINGS.JS
   ========================================================= */

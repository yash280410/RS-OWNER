
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 02 — APPLICATION STATE
   File: 02-state.js

   RESPONSIBILITY:
   - Maintain central application state
   - Maintain authentication state
   - Maintain current page
   - Maintain sidebar state
   - Maintain booking/calendar/gallery state
   - Provide controlled state updates

   THIS FILE DOES NOT:
   - Perform Supabase requests
   - Login/logout
   - Manipulate the DOM
   - Render pages
   - Attach button listeners
   ========================================================= */

'use strict';


/* =========================================================
   1. INITIAL APPLICATION STATE
   ========================================================= */

const INITIAL_APP_STATE = {

    /* -----------------------------------------------------
       Application
       ----------------------------------------------------- */

    app: {

        status: APP_STATUS.STARTING,

        initialized: false,

        online: navigator.onLine,

        error: null

    },


    /* -----------------------------------------------------
       Authentication
       ----------------------------------------------------- */

    auth: {

        authenticated: false,

        loading: true,

        user: null,

        session: null,

        error: null

    },


    /* -----------------------------------------------------
       Navigation
       ----------------------------------------------------- */

    navigation: {

        currentPage: RS_CONFIG.DEFAULT_PAGE,

        previousPage: null,

        loading: false

    },


    /* -----------------------------------------------------
       Sidebar
       ----------------------------------------------------- */

    sidebar: {

        isOpen: false,

        isCollapsed: false

    },


    /* -----------------------------------------------------
       Dashboard
       ----------------------------------------------------- */

    dashboard: {

        loading: false,

        stats: {

            totalBookings: 0,

            pendingBookings: 0,

            confirmedBookings: 0,

            thisMonthBookings: 0

        },

        recentBookings: [],

        upcomingEvents: [],

        lastUpdated: null,

        error: null

    },


    /* -----------------------------------------------------
       Bookings
       ----------------------------------------------------- */

    bookings: {

        items: [],

        loading: false,

        error: null,

        selectedBooking: null,

        searchQuery: '',

        statusFilter: 'all',

        dateFilter: 'all',

        sortBy: 'booking_date',

        sortDirection: 'asc',

        currentPage: 1,

        pageSize: RS_CONFIG.DEFAULT_PAGE_SIZE,

        totalCount: 0

    },


    /* -----------------------------------------------------
       Calendar
       ----------------------------------------------------- */

    calendar: {

        loading: false,

        error: null,

        currentDate: new Date(),

        selectedDate: null,

        events: [],

        selectedEvents: []

    },


    /* -----------------------------------------------------
       Contracts
       ----------------------------------------------------- */

    contracts: {

        items: [],

        loading: false,

        error: null,

        selectedContract: null,

        searchQuery: '',

        statusFilter: 'all'

    },


    /* -----------------------------------------------------
       Gallery
       ----------------------------------------------------- */

    gallery: {

        items: [],

        loading: false,

        error: null,

        selectedItem: null,

        category: 'all',

        searchQuery: ''

    },


    /* -----------------------------------------------------
       Notifications
       ----------------------------------------------------- */

    notifications: {

        items: [],

        loading: false,

        error: null,

        unreadCount: 0

    },


    /* -----------------------------------------------------
       Settings
       ----------------------------------------------------- */

    settings: {

        loading: false,

        saving: false,

        error: null,

        studio: {

            name: 'RS Photography',

            ownerName: '',

            phone: '',

            email: '',

            theme: RS_CONFIG.DEFAULT_THEME

        }

    },


    /* -----------------------------------------------------
       Modal
       ----------------------------------------------------- */

    modal: {

        isOpen: false,

        type: null,

        data: null,

        loading: false

    },


    /* -----------------------------------------------------
       UI
       ----------------------------------------------------- */

    ui: {

        toast: {

            visible: false,

            type: 'info',

            message: '',

            timeoutId: null

        },

        globalLoading: false

    }

};


/* =========================================================
   2. STATE CLONING
   ========================================================= */

/*
 * Creates a new state object from the initial state.
 *
 * structuredClone() is supported by modern browsers.
 * A fallback is included for compatibility.
 */

function cloneInitialState() {

    if (typeof structuredClone === 'function') {

        return structuredClone(INITIAL_APP_STATE);

    }


    return JSON.parse(
        JSON.stringify(INITIAL_APP_STATE)
    );

}


/* =========================================================
   3. APPLICATION STATE
   ========================================================= */

const RS_STATE = cloneInitialState();


/* =========================================================
   4. STATE PATH RESOLUTION
   ========================================================= */

/*
 * Example:
 *
 * getStateValue('auth.authenticated')
 *
 * returns:
 *
 * true / false
 */

function getStateValue(path) {

    if (
        typeof path !== 'string' ||
        path.trim() === ''
    ) {

        return undefined;

    }


    const parts = path.split('.');

    let current = RS_STATE;


    for (const part of parts) {

        if (
            current === null ||
            current === undefined
        ) {

            return undefined;

        }


        current = current[part];

    }


    return current;

}


/* =========================================================
   5. STATE VALUE UPDATE
   ========================================================= */

/*
 * Example:
 *
 * setStateValue(
 *     'navigation.currentPage',
 *     'bookings'
 * );
 */

function setStateValue(path, value) {

    if (
        typeof path !== 'string' ||
        path.trim() === ''
    ) {

        return false;

    }


    const parts = path.split('.');

    let current = RS_STATE;


    for (let index = 0; index < parts.length - 1; index++) {

        const part = parts[index];


        if (
            typeof current[part] !== 'object' ||
            current[part] === null
        ) {

            current[part] = {};

        }


        current = current[part];

    }


    const finalKey =
        parts[parts.length - 1];


    current[finalKey] = value;


    return true;

}


/* =========================================================
   6. STATE MERGE
   ========================================================= */

/*
 * Used when updating a section without destroying
 * the values that were not changed.
 */

function mergeState(section, updates) {

    if (
        typeof section !== 'string' ||
        typeof updates !== 'object' ||
        updates === null
    ) {

        return false;

    }


    const target =
        getStateValue(section);


    if (
        typeof target !== 'object' ||
        target === null
    ) {

        return false;

    }


    Object.assign(
        target,
        updates
    );


    return true;

}


/* =========================================================
   7. AUTH STATE
   ========================================================= */

function setAuthState(updates) {

    return mergeState(
        'auth',
        updates
    );

}


/* =========================================================
   8. NAVIGATION STATE
   ========================================================= */

function setNavigationState(updates) {

    return mergeState(
        'navigation',
        updates
    );

}


/* =========================================================
   9. SIDEBAR STATE
   ========================================================= */

function setSidebarState(updates) {

    return mergeState(
        'sidebar',
        updates
    );

}


/* =========================================================
   10. DASHBOARD STATE
   ========================================================= */

function setDashboardState(updates) {

    return mergeState(
        'dashboard',
        updates
    );

}


/* =========================================================
   11. BOOKINGS STATE
   ========================================================= */

function setBookingsState(updates) {

    return mergeState(
        'bookings',
        updates
    );

}


/* =========================================================
   12. CALENDAR STATE
   ========================================================= */

function setCalendarState(updates) {

    return mergeState(
        'calendar',
        updates
    );

}


/* =========================================================
   13. CONTRACTS STATE
   ========================================================= */

function setContractsState(updates) {

    return mergeState(
        'contracts',
        updates
    );

}


/* =========================================================
   14. GALLERY STATE
   ========================================================= */

function setGalleryState(updates) {

    return mergeState(
        'gallery',
        updates
    );

}


/* =========================================================
   15. NOTIFICATION STATE
   ========================================================= */

function setNotificationsState(updates) {

    return mergeState(
        'notifications',
        updates
    );

}


/* =========================================================
   16. SETTINGS STATE
   ========================================================= */

function setSettingsState(updates) {

    return mergeState(
        'settings',
        updates
    );

}


/* =========================================================
   17. MODAL STATE
   ========================================================= */

function setModalState(updates) {

    return mergeState(
        'modal',
        updates
    );

}


/* =========================================================
   18. APP STATE
   ========================================================= */

function setAppState(updates) {

    return mergeState(
        'app',
        updates
    );

}


/* =========================================================
   19. UI STATE
   ========================================================= */

function setUIState(updates) {

    return mergeState(
        'ui',
        updates
    );

}


/* =========================================================
   20. RESET AUTH STATE
   ========================================================= */

function resetAuthState() {

    setAuthState({

        authenticated: false,

        loading: false,

        user: null,

        session: null,

        error: null

    });

}


/* =========================================================
   21. RESET BOOKING SELECTION
   ========================================================= */

function clearSelectedBooking() {

    setBookingsState({

        selectedBooking: null

    });

}


/* =========================================================
   22. RESET CONTRACT SELECTION
   ========================================================= */

function clearSelectedContract() {

    setContractsState({

        selectedContract: null

    });

}


/* =========================================================
   23. RESET GALLERY SELECTION
   ========================================================= */

function clearSelectedGalleryItem() {

    setGalleryState({

        selectedItem: null

    });

}


/* =========================================================
   24. RESET MODAL
   ========================================================= */

function resetModalState() {

    setModalState({

        isOpen: false,

        type: null,

        data: null,

        loading: false

    });

}


/* =========================================================
   25. RESET APPLICATION
   ========================================================= */

function resetApplicationState() {

    const freshState =
        cloneInitialState();


    Object.keys(RS_STATE)
        .forEach((key) => {

            RS_STATE[key] =
                freshState[key];

        });

}


/* =========================================================
   26. STATE SNAPSHOT
   ========================================================= */

/*
 * Returns a copy so another module cannot accidentally
 * modify the live state through a returned object.
 */

function getStateSnapshot() {

    if (typeof structuredClone === 'function') {

        return structuredClone(RS_STATE);

    }


    return JSON.parse(
        JSON.stringify(RS_STATE)
    );

}


/* =========================================================
   27. PAGE VALIDATION
   ========================================================= */

function isValidPage(page) {

    return Object.values(RS_PAGES)
        .includes(page);

}


/* =========================================================
   28. SET CURRENT PAGE
   ========================================================= */

function setCurrentPage(page) {

    if (!isValidPage(page)) {

        return false;

    }


    const currentPage =
        RS_STATE.navigation.currentPage;


    setNavigationState({

        previousPage:
            currentPage,

        currentPage:
            page

    });


    return true;

}


/* =========================================================
   29. SET ONLINE STATUS
   ========================================================= */

function setOnlineStatus(isOnline) {

    setAppState({

        online:
            Boolean(isOnline)

    });

}


/* =========================================================
   30. APPLICATION READY
   ========================================================= */

function markApplicationReady() {

    setAppState({

        status:
            APP_STATUS.READY,

        initialized:
            true,

        error:
            null

    });

}


/* =========================================================
   31. APPLICATION ERROR
   ========================================================= */

function setApplicationError(error) {

    setAppState({

        status:
            APP_STATUS.ERROR,

        error:
            error || 'Unknown application error'

    });

}


/* =========================================================
   32. LOADING STATE
   ========================================================= */

function setGlobalLoading(isLoading) {

    setUIState({

        globalLoading:
            Boolean(isLoading)

    });

}


/* =========================================================
   33. STATE EVENT DISPATCH
   ========================================================= */

/*
 * Later modules can listen for application state changes
 * without directly depending on every other module.
 */

function dispatchStateEvent(eventName, detail = {}) {

    if (
        typeof eventName !== 'string' ||
        eventName.trim() === ''
    ) {

        return;

    }


    window.dispatchEvent(

        new CustomEvent(
            eventName,
            {
                detail: {
                    ...detail,
                    state: getStateSnapshot()
                }
            }
        )

    );

}


/* =========================================================
   34. STATE CHANGE NOTIFICATION
   ========================================================= */

function notifyStateChange(section, detail = {}) {

    dispatchStateEvent(

        'rs:state-changed',

        {

            section,

            ...detail

        }

    );

}


/* =========================================================
   35. ONLINE / OFFLINE EVENTS
   ========================================================= */

/*
 * These listeners only update state.
 *
 * They do not display UI.
 * They do not reload the page.
 * They do not perform database operations.
 */

window.addEventListener(
    'online',
    () => {

        setOnlineStatus(true);

        notifyStateChange(
            'app',
            {
                property: 'online',
                value: true
            }
        );

    }
);


window.addEventListener(
    'offline',
    () => {

        setOnlineStatus(false);

        notifyStateChange(
            'app',
            {
                property: 'online',
                value: false
            }
        );

    }
);


/* =========================================================
   36. INITIAL STATE CHECK
   ========================================================= */

setOnlineStatus(
    navigator.onLine
);


/* =========================================================
   END OF 02-STATE.JS
   ========================================================= */

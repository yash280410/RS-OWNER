
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 03 — DOM MANAGEMENT
   File: 03-dom.js

   RESPONSIBILITY:
   - Central DOM references
   - Safe DOM selectors
   - Page element lookup
   - Navigation element lookup
   - Modal element lookup
   - Common UI element lookup

   THIS FILE DOES NOT:
   - Login/logout
   - Query Supabase
   - Navigate pages
   - Open/close sidebar
   - Render bookings
   - Perform CRUD
   ========================================================= */

'use strict';


/* =========================================================
   1. DOM SELECTOR HELPERS
   ========================================================= */

/**
 * Safely select one element.
 *
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {Element|null}
 */

function domSelect(
    selector,
    root = document
) {

    if (
        typeof selector !== 'string' ||
        selector.trim() === ''
    ) {

        return null;

    }


    return root.querySelector(selector);

}


/**
 * Safely select multiple elements.
 *
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {Element[]}
 */

function domSelectAll(
    selector,
    root = document
) {

    if (
        typeof selector !== 'string' ||
        selector.trim() === ''
    ) {

        return [];

    }


    return Array.from(
        root.querySelectorAll(selector)
    );

}


/* =========================================================
   2. ID SELECTOR HELPER
   ========================================================= */

/**
 * Get an element by ID.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */

function domById(id) {

    if (
        typeof id !== 'string' ||
        id.trim() === ''
    ) {

        return null;

    }


    return document.getElementById(id);

}


/* =========================================================
   3. APPLICATION ROOT
   ========================================================= */

const DOM = {

    /* -----------------------------------------------------
       Root
       ----------------------------------------------------- */

    app:
        domById('app'),

    appShell:
        domById('app-shell'),

    dashboardApp:
        domById('dashboard-app'),


    /* -----------------------------------------------------
       Authentication
       ----------------------------------------------------- */

    loginPage:
        domById('login-page'),

    loginForm:
        domById('login-form'),

    loginEmail:
        domById('login-email'),

    loginPassword:
        domById('login-password'),

    loginSubmit:
        domById('login-submit'),

    loginError:
        domById('login-error'),

    logoutButtons:
        domSelectAll('[data-action="logout"]'),


    /* -----------------------------------------------------
       Sidebar
       ----------------------------------------------------- */

    sidebar:
        domById('sidebar'),

    sidebarOverlay:
        domById('sidebar-overlay'),

    sidebarToggle:
        domById('sidebar-toggle'),

    sidebarClose:
        domById('sidebar-close'),

    sidebarNavigation:
        domById('sidebar-navigation'),

    navigationButtons:
        domSelectAll('[data-page]'),


    /* -----------------------------------------------------
       Header
       ----------------------------------------------------- */

    mobileHeader:
        domById('mobile-header'),

    headerTitle:
        domById('header-title'),

    headerSubtitle:
        domById('header-subtitle'),

    headerUserName:
        domById('header-user-name'),

    headerUserEmail:
        domById('header-user-email'),


    /* -----------------------------------------------------
       Page containers
       ----------------------------------------------------- */

    pages:
        domSelectAll('[data-page-view]'),

    dashboardPage:
        domById('page-dashboard'),

    bookingsPage:
        domById('page-bookings'),

    calendarPage:
        domById('page-calendar'),

    contractsPage:
        domById('page-contracts'),

    galleryPage:
        domById('page-gallery'),

    notificationsPage:
        domById('page-notifications'),

    settingsPage:
        domById('page-settings'),


    /* -----------------------------------------------------
       Dashboard
       ----------------------------------------------------- */

    dashboardStats:
        domById('dashboard-stats'),

    totalBookings:
        domById('total-bookings'),

    pendingBookings:
        domById('pending-bookings'),

    confirmedBookings:
        domById('confirmed-bookings'),

    thisMonthBookings:
        domById('this-month-bookings'),

    recentBookings:
        domById('recent-bookings'),

    upcomingEvents:
        domById('upcoming-events'),


    /* -----------------------------------------------------
       Bookings
       ----------------------------------------------------- */

    bookingsContainer:
        domById('bookings-container'),

    bookingsSearch:
        domById('bookings-search'),

    bookingsStatusFilter:
        domById('bookings-status-filter'),

    bookingsDateFilter:
        domById('bookings-date-filter'),

    bookingsSort:
        domById('bookings-sort'),

    bookingsPagination:
        domById('bookings-pagination'),

    bookingsEmpty:
        domById('bookings-empty'),

    bookingsLoading:
        domById('bookings-loading'),

    newBookingButton:
        domSelect(
            '[data-action="open-new-booking"]'
        ),


    /* -----------------------------------------------------
       Calendar
       ----------------------------------------------------- */

    calendarContainer:
        domById('calendar-container'),

    calendarTitle:
        domById('calendar-title'),

    calendarPrevious:
        domById('calendar-previous'),

    calendarNext:
        domById('calendar-next'),

    calendarToday:
        domById('calendar-today'),

    calendarGrid:
        domById('calendar-grid'),

    calendarSelectedDate:
        domById('calendar-selected-date'),

    calendarSelectedEvents:
        domById('calendar-selected-events'),


    /* -----------------------------------------------------
       Contracts
       ----------------------------------------------------- */

    contractsContainer:
        domById('contracts-container'),

    contractsSearch:
        domById('contracts-search'),

    contractsStatusFilter:
        domById('contracts-status-filter'),

    contractsEmpty:
        domById('contracts-empty'),

    contractsLoading:
        domById('contracts-loading'),


    /* -----------------------------------------------------
       Gallery
       ----------------------------------------------------- */

    galleryContainer:
        domById('gallery-container'),

    galleryCategory:
        domById('gallery-category'),

    gallerySearch:
        domById('gallery-search'),

    galleryEmpty:
        domById('gallery-empty'),

    galleryLoading:
        domById('gallery-loading'),

    galleryUpload:
        domSelect(
            '[data-action="upload-gallery"]'
        ),


    /* -----------------------------------------------------
       Notifications
       ----------------------------------------------------- */

    notificationsContainer:
        domById('notifications-container'),

    notificationsEmpty:
        domById('notifications-empty'),

    notificationsLoading:
        domById('notifications-loading'),

    notificationBadge:
        domById('notification-badge'),


    /* -----------------------------------------------------
       Settings
       ----------------------------------------------------- */

    settingsForm:
        domById('settings-form'),

    studioName:
        domById('studio-name'),

    ownerName:
        domById('owner-name'),

    studioPhone:
        domById('studio-phone'),

    studioEmail:
        domById('studio-email'),

    studioTheme:
        domById('studio-theme'),

    settingsSave:
        domSelect(
            '[data-action="save-settings"]'
        ),

    settingsStatus:
        domById('settings-status'),


    /* -----------------------------------------------------
       Modals
       ----------------------------------------------------- */

    modalContainer:
        domById('modal-container'),

    modalOverlay:
        domById('modal-overlay'),

    modal:
        domById('modal'),

    modalTitle:
        domById('modal-title'),

    modalBody:
        domById('modal-body'),

    modalClose:
        domById('modal-close'),

    modalCancel:
        domById('modal-cancel'),

    modalConfirm:
        domById('modal-confirm'),


    /* -----------------------------------------------------
       Toast / notifications
       ----------------------------------------------------- */

    toastContainer:
        domById('toast-container'),

    toast:
        domById('toast'),

    toastMessage:
        domById('toast-message'),


    /* -----------------------------------------------------
       Global loading
       ----------------------------------------------------- */

    globalLoader:
        domById('global-loader')

};


/* =========================================================
   4. PAGE MAP
   ========================================================= */

/*
 * This gives later modules one predictable way to find
 * pages.
 */

const DOM_PAGES = Object.freeze({

    dashboard:
        DOM.dashboardPage,

    bookings:
        DOM.bookingsPage,

    calendar:
        DOM.calendarPage,

    contracts:
        DOM.contractsPage,

    gallery:
        DOM.galleryPage,

    notifications:
        DOM.notificationsPage,

    settings:
        DOM.settingsPage

});


/* =========================================================
   5. NAVIGATION MAP
   ========================================================= */

const DOM_NAVIGATION = Object.freeze({

    buttons:
        DOM.navigationButtons,

    sidebar:
        DOM.sidebarNavigation,

    toggle:
        DOM.sidebarToggle,

    close:
        DOM.sidebarClose,

    overlay:
        DOM.sidebarOverlay

});


/* =========================================================
   6. MODAL MAP
   ========================================================= */

const DOM_MODAL = Object.freeze({

    container:
        DOM.modalContainer,

    overlay:
        DOM.modalOverlay,

    modal:
        DOM.modal,

    title:
        DOM.modalTitle,

    body:
        DOM.modalBody,

    close:
        DOM.modalClose,

    cancel:
        DOM.modalCancel,

    confirm:
        DOM.modalConfirm

});


/* =========================================================
   7. DOM AVAILABILITY CHECK
   ========================================================= */

/**
 * Check whether a DOM element exists.
 *
 * @param {Element|null} element
 * @returns {boolean}
 */

function domExists(element) {

    return element instanceof Element;

}


/* =========================================================
   8. REQUIRED DOM CHECK
   ========================================================= */

/*
 * These elements are required for the application shell.
 *
 * Feature-specific elements are NOT required here because
 * individual modules may load/render them later.
 */

const REQUIRED_DOM_IDS = Object.freeze([

    'app',

    'app-shell',

    'login-page',

    'login-form',

    'sidebar',

    'sidebar-overlay',

    'sidebar-toggle',

    'mobile-header',

    'header-title'

]);


/**
 * Check required application elements.
 *
 * @returns {Object}
 */

function checkRequiredDOM() {

    const missing = [];


    REQUIRED_DOM_IDS.forEach((id) => {

        if (!domById(id)) {

            missing.push(id);

        }

    });


    return {

        valid:
            missing.length === 0,

        missing

    };

}


/* =========================================================
   9. DOM REFRESH
   ========================================================= */

/*
 * Some elements may be created dynamically.
 *
 * The main DOM object therefore gets a refresh function
 * for dynamic references.
 *
 * Static references remain unchanged unless explicitly
 * refreshed.
 */

function refreshDOMReferences() {

    DOM.navigationButtons =
        domSelectAll('[data-page]');

    DOM.pages =
        domSelectAll('[data-page-view]');

    DOM.logoutButtons =
        domSelectAll(
            '[data-action="logout"]'
        );

}


/* =========================================================
   10. GET PAGE ELEMENT
   ========================================================= */

/**
 * Get a page by page name.
 *
 * @param {string} page
 * @returns {Element|null}
 */

function getPageElement(page) {

    if (!isValidPage(page)) {

        return null;

    }


    return DOM_PAGES[page] || null;

}


/* =========================================================
   11. GET NAVIGATION BUTTONS
   ========================================================= */

/**
 * Get navigation buttons for a page.
 *
 * @param {string} page
 * @returns {Element[]}
 */

function getNavigationButtons(page) {

    if (!isValidPage(page)) {

        return [];

    }


    return domSelectAll(
        `[data-page="${page}"]`
    );

}


/* =========================================================
   12. GET ACTION ELEMENTS
   ========================================================= */

/**
 * Get all elements using a data-action value.
 *
 * @param {string} action
 * @returns {Element[]}
 */

function getActionElements(action) {

    if (
        typeof action !== 'string' ||
        action.trim() === ''
    ) {

        return [];

    }


    return domSelectAll(
        `[data-action="${action}"]`
    );

}


/* =========================================================
   13. GET DATA ELEMENT
   ========================================================= */

/**
 * Get all elements containing a data attribute.
 *
 * @param {string} attribute
 * @returns {Element[]}
 */

function getDataElements(attribute) {

    if (
        typeof attribute !== 'string' ||
        attribute.trim() === ''
    ) {

        return [];

    }


    return domSelectAll(
        `[${attribute}]`
    );

}


/* =========================================================
   14. DOM READY FLAG
   ========================================================= */

let RS_DOM_READY = false;


/* =========================================================
   15. DOM READY EVENT
   ========================================================= */

function markDOMReady() {

    RS_DOM_READY = true;

}


/* =========================================================
   16. INITIAL DOM READY HANDLING
   ========================================================= */

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        markDOMReady,
        {
            once: true
        }
    );

} else {

    markDOMReady();

}


/* =========================================================
   17. DOM STATUS
   ========================================================= */

function getDOMStatus() {

    const required =
        checkRequiredDOM();


    return {

        ready:
            RS_DOM_READY,

        requiredElementsPresent:
            required.valid,

        missingRequiredElements:
            required.missing,

        pageCount:
            DOM.pages.length,

        navigationButtonCount:
            DOM.navigationButtons.length

    };

}


/* =========================================================
   END OF 03-DOM.JS
   ========================================================= */

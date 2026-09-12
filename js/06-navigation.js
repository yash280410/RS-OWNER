
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 06 — NAVIGATION
   File: 06-navigation.js

   RESPONSIBILITY:
   - Dashboard page switching
   - Active navigation state
   - Page visibility
   - Page title
   - Page metadata
   - Navigation button handling

   THIS FILE DOES NOT:
   - Authenticate users
   - Query Supabase
   - Manage bookings
   - Open/close sidebar
   - Manage modals
   ========================================================= */

'use strict';


/* =========================================================
   1. NAVIGATION STATE
   ========================================================= */

let RS_NAVIGATION_INITIALIZED = false;


/* =========================================================
   2. PAGE INFORMATION
   ========================================================= */

/*
 * All dashboard pages are defined here.
 *
 * The values must match:
 *
 * data-page="..."
 *
 * and:
 *
 * data-page-view="..."
 */

const NAVIGATION_PAGES = Object.freeze({

    dashboard: {

        title: 'Dashboard',

        subtitle:
            'Overview of your photography studio'

    },


    bookings: {

        title: 'Bookings',

        subtitle:
            'Manage customer bookings'

    },


    calendar: {

        title: 'Calendar',

        subtitle:
            'View upcoming photography events'

    },


    contracts: {

        title: 'Contracts',

        subtitle:
            'Manage photography contracts'

    },


    gallery: {

        title: 'Gallery',

        subtitle:
            'Manage your photography gallery'

    },


    notifications: {

        title: 'Notifications',

        subtitle:
            'View studio notifications'

    },


    settings: {

        title: 'Settings',

        subtitle:
            'Manage studio settings'

    }

});


/* =========================================================
   3. VALID PAGE CHECK
   ========================================================= */

function navigationPageExists(page) {

    return Object.prototype.hasOwnProperty.call(
        NAVIGATION_PAGES,
        page
    );

}


/* =========================================================
   4. GET PAGE INFORMATION
   ========================================================= */

function getNavigationPageInfo(page) {

    if (
        !navigationPageExists(page)
    ) {

        return null;

    }


    return NAVIGATION_PAGES[page];

}


/* =========================================================
   5. HIDE ALL PAGES
   ========================================================= */

function hideAllPages() {

    const pages =
        domSelectAll(
            '[data-page-view]'
        );


    pages.forEach(
        (pageElement) => {

            pageElement.classList.remove(
                'page-active'
            );


            pageElement.setAttribute(
                'aria-hidden',
                'true'
            );


            pageElement.hidden = true;

        }
    );

}


/* =========================================================
   6. SHOW PAGE
   ========================================================= */

function showPage(page) {

    if (
        !navigationPageExists(page)
    ) {

        debugError(
            `Navigation page does not exist: ${page}`
        );


        return false;

    }


    const pageElement =
        domSelect(
            `[data-page-view="${page}"]`
        );


    if (!pageElement) {

        debugError(
            `DOM page element not found: ${page}`
        );


        return false;

    }


    pageElement.hidden = false;


    pageElement.classList.add(
        'page-active'
    );


    pageElement.setAttribute(
        'aria-hidden',
        'false'
    );


    return true;

}


/* =========================================================
   7. UPDATE ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNavigation(page) {

    const buttons =
        domSelectAll(
            '[data-page]'
        );


    buttons.forEach(
        (button) => {

            const buttonPage =
                button.getAttribute(
                    'data-page'
                );


            const isActive =
                buttonPage === page;


            button.classList.toggle(
                'nav-active',
                isActive
            );


            button.setAttribute(
                'aria-current',
                isActive
                    ? 'page'
                    : 'false'
            );

        }
    );

}


/* =========================================================
   8. UPDATE PAGE TITLE
   ========================================================= */

function updatePageTitle(page) {

    const pageInfo =
        getNavigationPageInfo(page);


    if (!pageInfo) {

        return;

    }


    if (DOM.headerTitle) {

        DOM.headerTitle.textContent =
            pageInfo.title;

    }


    if (DOM.headerSubtitle) {

        DOM.headerSubtitle.textContent =
            pageInfo.subtitle;

    }


    /*
     * Browser document title.
     */

    document.title =
        `${pageInfo.title} | RS Photography Owner`;

}


/* =========================================================
   9. SET PAGE
   ========================================================= */

/**
 * Main navigation function.
 *
 * Example:
 *
 * navigateTo('bookings');
 */

function navigateTo(page) {

    if (
        !navigationPageExists(page)
    ) {

        debugError(
            `Invalid navigation request: ${page}`
        );


        return false;

    }


    const pageElement =
        getPageElement(page);


    if (!pageElement) {

        debugError(
            `Cannot navigate. Page not found: ${page}`
        );


        return false;

    }


    const previousPage =
        RS_STATE.navigation.currentPage;


    /*
     * Avoid unnecessary work if the requested page
     * is already visible.
     */

    if (
        previousPage === page &&
        pageElement.classList.contains(
            'page-active'
        )
    ) {

        updateActiveNavigation(page);

        updatePageTitle(page);

        return true;

    }


    setNavigationState({

        loading: true,

        previousPage,

        currentPage: page

    });


    /*
     * Hide everything first.
     */

    hideAllPages();


    /*
     * Then show only the requested page.
     */

    const shown =
        showPage(page);


    if (!shown) {

        /*
         * Restore previous navigation state if
         * something went wrong.
         */

        setNavigationState({

            loading: false,

            currentPage: previousPage

        });


        return false;

    }


    /*
     * Update sidebar navigation state.
     */

    updateActiveNavigation(page);


    /*
     * Update header.
     */

    updatePageTitle(page);


    /*
     * Finish navigation.
     */

    setNavigationState({

        loading: false,

        currentPage: page

    });


    /*
     * Tell other modules that navigation changed.
     *
     * The sidebar module can listen to this later.
     */

    notifyStateChange(
        'navigation',
        {

            event: 'page-changed',

            page,

            previousPage

        }
    );


    return true;

}


/* =========================================================
   10. NAVIGATION BUTTON HANDLER
   ========================================================= */

function handleNavigationClick(event) {

    const button =
        event.target.closest(
            '[data-page]'
        );


    if (!button) {

        return;

    }


    /*
     * Only handle navigation buttons inside
     * the current document.
     */

    if (
        !document.contains(button)
    ) {

        return;

    }


    const page =
        button.getAttribute(
            'data-page'
        );


    if (!page) {

        return;

    }


    event.preventDefault();


    navigateTo(page);

}


/* =========================================================
   11. GLOBAL NAVIGATION LISTENER
   ========================================================= */

/*
 * Event delegation means dynamically created navigation
 * buttons also work.
 *
 * We do not need to attach separate listeners to every
 * button.
 */

function initializeNavigationEvents() {

    document.addEventListener(
        'click',
        handleNavigationClick
    );

}


/* =========================================================
   12. KEYBOARD NAVIGATION
   ========================================================= */

/*
 * Buttons naturally support keyboard interaction.
 *
 * This handler additionally supports elements that may
 * later be rendered with role="button".
 */

function handleNavigationKeyboard(event) {

    if (
        event.key !== 'Enter' &&
        event.key !== ' '
    ) {

        return;

    }


    const element =
        event.target.closest(
            '[data-page]'
        );


    if (!element) {

        return;

    }


    /*
     * Native buttons already perform their normal keyboard
     * activation. Avoid triggering the action twice.
     */

    if (
        element.tagName === 'BUTTON'
    ) {

        return;

    }


    event.preventDefault();


    const page =
        element.getAttribute(
            'data-page'
        );


    if (page) {

        navigateTo(page);

    }

}


/* =========================================================
   13. INITIAL PAGE
   ========================================================= */

function initializeInitialPage() {

    let initialPage =
        RS_CONFIG.DEFAULT_PAGE;


    /*
     * If config contains an invalid page, fall back
     * to dashboard.
     */

    if (
        !navigationPageExists(initialPage)
    ) {

        initialPage =
            'dashboard';

    }


    /*
     * Make sure the state agrees with the actual
     * first page.
     */

    setNavigationState({

        currentPage:
            initialPage,

        previousPage:
            null

    });


    /*
     * Render initial page.
     */

    navigateTo(
        initialPage
    );

}


/* =========================================================
   14. REFRESH NAVIGATION REFERENCES
   ========================================================= */

function refreshNavigation() {

    refreshDOMReferences();


    const currentPage =
        RS_STATE.navigation.currentPage;


    if (
        navigationPageExists(currentPage)
    ) {

        updateActiveNavigation(
            currentPage
        );

        updatePageTitle(
            currentPage
        );

    }

}


/* =========================================================
   15. GET CURRENT PAGE
   ========================================================= */

function getCurrentPage() {

    return (
        RS_STATE.navigation.currentPage
    );

}


/* =========================================================
   16. GET PREVIOUS PAGE
   ========================================================= */

function getPreviousPage() {

    return (
        RS_STATE.navigation.previousPage
    );

}


/* =========================================================
   17. NAVIGATION INITIALIZATION
   ========================================================= */

function initializeNavigation() {

    if (
        RS_NAVIGATION_INITIALIZED
    ) {

        return true;

    }


    initializeNavigationEvents();


    document.addEventListener(
        'keydown',
        handleNavigationKeyboard
    );


    initializeInitialPage();


    RS_NAVIGATION_INITIALIZED = true;


    debugLog(
        'Navigation initialized.'
    );


    return true;

}


/* =========================================================
   18. DESTROY NAVIGATION
   ========================================================= */

function destroyNavigation() {

    /*
     * Navigation listeners are intentionally kept simple.
     *
     * This function exists so the module has a clean
     * lifecycle if the project later needs it.
     */

    RS_NAVIGATION_INITIALIZED = false;

}


/* =========================================================
   END OF 06-NAVIGATION.JS
   ========================================================= */

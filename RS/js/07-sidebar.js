
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 07 — SIDEBAR
   File: 07-sidebar.js

   RESPONSIBILITY:
   - Desktop sidebar
   - Mobile off-canvas sidebar
   - Sidebar overlay
   - Open / close / toggle
   - Escape key
   - Resize handling
   - Body scroll locking
   - Close sidebar after navigation

   THIS FILE DOES NOT:
   - Authenticate users
   - Query Supabase
   - Load bookings
   - Change dashboard data
   - Render pages
   - Manage contracts/gallery
   ========================================================= */

'use strict';


/* =========================================================
   1. SIDEBAR MODULE STATE
   ========================================================= */

let RS_SIDEBAR_INITIALIZED = false;


/* =========================================================
   2. SIDEBAR CSS STATE CLASSES
   ========================================================= */

const SIDEBAR_CLASSES = Object.freeze({

    open: 'sidebar-open',

    collapsed: 'sidebar-collapsed',

    overlayVisible: 'sidebar-overlay-visible'

});


/* =========================================================
   3. MOBILE CHECK
   ========================================================= */

function sidebarIsMobile() {

    return isMobileViewport();

}


/* =========================================================
   4. GET SIDEBAR ELEMENTS
   ========================================================= */

function getSidebarElements() {

    return {

        sidebar:
            DOM.sidebar,

        overlay:
            DOM.sidebarOverlay,

        toggle:
            DOM.sidebarToggle,

        close:
            DOM.sidebarClose

    };

}


/* =========================================================
   5. CHECK ELEMENT AVAILABILITY
   ========================================================= */

function sidebarElementsAvailable() {

    const elements =
        getSidebarElements();


    return Boolean(
        elements.sidebar &&
        elements.overlay
    );

}


/* =========================================================
   6. UPDATE ARIA STATE
   ========================================================= */

function updateSidebarAccessibility(
    isOpen
) {

    const elements =
        getSidebarElements();


    if (elements.sidebar) {

        elements.sidebar.setAttribute(
            'aria-hidden',
            isOpen
                ? 'false'
                : 'true'
        );

    }


    if (elements.overlay) {

        elements.overlay.setAttribute(
            'aria-hidden',
            isOpen
                ? 'false'
                : 'true'
        );


        elements.overlay.setAttribute(
            'aria-hidden',
            isOpen
                ? 'false'
                : 'true'
        );

    }


    if (elements.toggle) {

        elements.toggle.setAttribute(
            'aria-expanded',
            isOpen
                ? 'true'
                : 'false'
        );

    }

}


/* =========================================================
   7. APPLY OPEN STATE
   ========================================================= */

function applySidebarOpenState(
    isOpen
) {

    const elements =
        getSidebarElements();


    if (
        !elements.sidebar
    ) {

        return false;

    }


    const open =
        Boolean(isOpen);


    /*
     * Main application shell.
     */

    if (DOM.appShell) {

        DOM.appShell.classList.toggle(
            SIDEBAR_CLASSES.open,
            open
        );

    }


    /*
     * Sidebar itself.
     */

    elements.sidebar.classList.toggle(
        SIDEBAR_CLASSES.open,
        open
    );


    /*
     * Overlay.
     */

    if (elements.overlay) {

        elements.overlay.classList.toggle(
            SIDEBAR_CLASSES.overlayVisible,
            open
        );

    }


    /*
     * Accessibility.
     */

    updateSidebarAccessibility(
        open
    );


    /*
     * Prevent the page behind the mobile menu from
     * scrolling.
     */

    if (sidebarIsMobile()) {

        setBodyScrollLock(
            open
        );

    } else {

        setBodyScrollLock(
            false
        );

    }


    return true;

}


/* =========================================================
   8. OPEN SIDEBAR
   ========================================================= */

function openSidebar() {

    if (
        !sidebarElementsAvailable()
    ) {

        debugError(
            'Sidebar elements are missing.'
        );


        return false;

    }


    setSidebarState({

        isOpen: true

    });


    applySidebarOpenState(
        true
    );


    notifyStateChange(
        'sidebar',
        {

            event: 'opened'

        }
    );


    return true;

}


/* =========================================================
   9. CLOSE SIDEBAR
   ========================================================= */

function closeSidebar() {

    if (
        !sidebarElementsAvailable()
    ) {

        return false;

    }


    setSidebarState({

        isOpen: false

    });


    applySidebarOpenState(
        false
    );


    notifyStateChange(
        'sidebar',
        {

            event: 'closed'

        }
    );


    return true;

}


/* =========================================================
   10. TOGGLE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const currentlyOpen =
        RS_STATE.sidebar.isOpen;


    if (currentlyOpen) {

        return closeSidebar();

    }


    return openSidebar();

}


/* =========================================================
   11. DESKTOP COLLAPSE
   ========================================================= */

function toggleSidebarCollapse() {

    /*
     * Mobile uses the off-canvas open/close system.
     *
     * Collapse is a desktop-only behavior.
     */

    if (
        sidebarIsMobile()
    ) {

        return false;

    }


    const nextState =
        !RS_STATE.sidebar.isCollapsed;


    setSidebarState({

        isCollapsed:
            nextState

    });


    const elements =
        getSidebarElements();


    if (elements.sidebar) {

        elements.sidebar.classList.toggle(
            SIDEBAR_CLASSES.collapsed,
            nextState
        );

    }


    if (DOM.appShell) {

        DOM.appShell.classList.toggle(
            SIDEBAR_CLASSES.collapsed,
            nextState
        );

    }


    notifyStateChange(
        'sidebar',
        {

            event: 'collapse-changed',

            collapsed:
                nextState

        }
    );


    return true;

}


/* =========================================================
   12. CLOSE AFTER NAVIGATION
   ========================================================= */

/*
 * This is deliberately connected through the application's
 * state event system rather than directly modifying the
 * navigation module.
 *
 * Navigation changes:
 *
 * rs:state-changed
 *       ↓
 * sidebar receives event
 *       ↓
 * mobile?
 *       ↓
 * close
 */

function handleSidebarStateChange(
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


    /*
     * On mobile, selecting a page automatically closes
     * the off-canvas sidebar.
     */

    if (
        sidebarIsMobile()
    ) {

        closeSidebar();

    }

}


/* =========================================================
   13. TOGGLE BUTTON
   ========================================================= */

function handleSidebarToggle(
    event
) {

    const button =
        event.target.closest(
            '[data-action="toggle-sidebar"]'
        );


    if (!button) {

        return;

    }


    event.preventDefault();


    toggleSidebar();

}


/* =========================================================
   14. CLOSE BUTTON
   ========================================================= */

function handleSidebarClose(
    event
) {

    const button =
        event.target.closest(
            '[data-action="close-sidebar"]'
        );


    if (!button) {

        return;

    }


    event.preventDefault();


    closeSidebar();

}


/* =========================================================
   15. OVERLAY CLICK
   ========================================================= */

function handleSidebarOverlayClick(
    event
) {

    const overlay =
        event.target.closest(
            '#sidebar-overlay'
        );


    if (!overlay) {

        return;

    }


    /*
     * Only close when the actual overlay itself was tapped.
     * This prevents clicks from inside unrelated elements
     * from accidentally closing the sidebar.
     */

    if (
        event.target !== overlay
    ) {

        return;

    }


    closeSidebar();

}


/* =========================================================
   16. ESCAPE KEY
   ========================================================= */

function handleSidebarEscape(
    event
) {

    if (
        event.key !== 'Escape'
    ) {

        return;

    }


    if (
        !RS_STATE.sidebar.isOpen
    ) {

        return;

    }


    closeSidebar();

}


/* =========================================================
   17. RESIZE HANDLING
   ========================================================= */

/*
 * Prevents a mobile sidebar state from remaining active
 * when the user rotates a phone or expands the browser.
 */

function handleSidebarResize() {

    if (
        !sidebarIsMobile()
    ) {

        /*
         * Desktop does not need the mobile body lock.
         */

        setBodyScrollLock(
            false
        );


        /*
         * Remove mobile open state from the visual layer.
         */

        if (DOM.sidebar) {

            DOM.sidebar.classList.remove(
                SIDEBAR_CLASSES.open
            );

        }


        if (DOM.sidebarOverlay) {

            DOM.sidebarOverlay.classList.remove(
                SIDEBAR_CLASSES.overlayVisible
            );

        }


        return;

    }


    /*
     * If we are back on mobile, restore the state
     * according to application state.
     */

    applySidebarOpenState(
        RS_STATE.sidebar.isOpen
    );

}


/* =========================================================
   18. CLOSE SIDEBAR ON PAGE VISIBILITY CHANGE
   ========================================================= */

/*
 * If the browser/tab becomes hidden, close the mobile
 * sidebar when the user returns.
 */

function handleVisibilityChange() {

    if (
        document.visibilityState === 'hidden'
    ) {

        return;

    }


    if (
        sidebarIsMobile() &&
        RS_STATE.sidebar.isOpen
    ) {

        closeSidebar();

    }

}


/* =========================================================
   19. DOCUMENT CLICK HANDLER
   ========================================================= */

function handleSidebarDocumentClick(
    event
) {

    handleSidebarToggle(
        event
    );


    handleSidebarClose(
        event
    );

}


/* =========================================================
   20. APPLY INITIAL SIDEBAR STATE
   ========================================================= */

function initializeSidebarState() {

    /*
     * On startup, sidebar is closed on mobile.
     */

    if (
        sidebarIsMobile()
    ) {

        setSidebarState({

            isOpen: false

        });


        applySidebarOpenState(
            false
        );


        return;

    }


    /*
     * Desktop sidebar is visible by default.
     */

    setSidebarState({

        isOpen: true

    });


    applySidebarOpenState(
        true
    );

}


/* =========================================================
   21. SIDEBAR EVENT INITIALIZATION
   ========================================================= */

function initializeSidebarEvents() {

    document.addEventListener(
        'click',
        handleSidebarDocumentClick
    );


    document.addEventListener(
        'click',
        handleSidebarOverlayClick
    );


    document.addEventListener(
        'keydown',
        handleSidebarEscape
    );


    window.addEventListener(
        'resize',
        debounce(
            handleSidebarResize,
            100
        )
    );


    document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
    );


    /*
     * Navigation → Sidebar communication.
     */

    window.addEventListener(
        'rs:state-changed',
        handleSidebarStateChange
    );

}


/* =========================================================
   22. SIDEBAR INITIALIZATION
   ========================================================= */

function initializeSidebar() {

    if (
        RS_SIDEBAR_INITIALIZED
    ) {

        return true;

    }


    if (
        !sidebarElementsAvailable()
    ) {

        debugError(
            'Cannot initialize sidebar. Required elements are missing.'
        );


        return false;

    }


    initializeSidebarEvents();


    initializeSidebarState();


    RS_SIDEBAR_INITIALIZED = true;


    debugLog(
        'Sidebar initialized.'
    );


    return true;

}


/* =========================================================
   23. SIDEBAR STATUS
   ========================================================= */

function getSidebarStatus() {

    return {

        initialized:
            RS_SIDEBAR_INITIALIZED,

        open:
            RS_STATE.sidebar.isOpen,

        collapsed:
            RS_STATE.sidebar.isCollapsed,

        mobile:
            sidebarIsMobile()

    };

}


/* =========================================================
   24. SIDEBAR CLEANUP
   ========================================================= */

function destroySidebar() {

    closeSidebar();


    setBodyScrollLock(
        false
    );


    RS_SIDEBAR_INITIALIZED =
        false;

}


/* =========================================================
   END OF 07-SIDEBAR.JS
   ========================================================= */

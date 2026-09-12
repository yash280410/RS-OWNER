
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 13 — NOTIFICATIONS
   File: 13-notifications.js

   RESPONSIBILITY:
   - Notification state
   - Notification rendering
   - Read/unread state
   - Notification filtering
   - Notification actions
   - Notification UI updates

   DOES NOT:
   - Handle authentication
   - Handle navigation
   - Handle sidebar
   - Handle bookings
   - Handle contracts
   - Handle gallery
   - Directly modify Supabase

   DATABASE CONNECTION:
   Will be connected after the final notification
   database structure is confirmed.
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_NOTIFICATIONS_INITIALIZED = false;


/* =========================================================
   2. NOTIFICATION STATE
   ========================================================= */

const RS_NOTIFICATIONS_STATE = {

    items: [],

    filteredItems: [],

    filter: 'all',

    unreadCount: 0,

    selectedId: null,

    loading: false

};


/* =========================================================
   3. NOTIFICATION CONFIG
   ========================================================= */

const NOTIFICATIONS_CONFIG = Object.freeze({

    filters: [

        'all',

        'unread',

        'read'

    ],

    types: [

        'booking',

        'confirmation',

        'payment',

        'system',

        'general'

    ]

});


/* =========================================================
   4. GET DOM ELEMENTS
   ========================================================= */

function getNotificationElements() {

    return {

        page:
            domSelect(
                '[data-page-view="notifications"]'
            ),

        list:
            domSelect(
                '[data-notifications-list]'
            ),

        filter:
            domSelect(
                '[data-notifications-filter]'
            ),

        resultCount:
            domSelect(
                '[data-notifications-result-count]'
            ),

        unreadCount:
            domSelect(
                '[data-notifications-unread-count]'
            ),

        empty:
            domSelect(
                '[data-notifications-state="empty"]'
            ),

        loading:
            domSelect(
                '[data-notifications-state="loading"]'
            ),

        error:
            domSelect(
                '[data-notifications-state="error"]'
            ),

        markAll:
            domSelect(
                '[data-action="mark-all-notifications-read"]'
            )

    };

}


/* =========================================================
   5. NORMALIZE NOTIFICATION
   ========================================================= */

function normalizeNotification(
    notification
) {

    if (!notification) {

        return null;

    }


    return {

        ...notification,

        id:
            notification.id ??
            null,

        title:
            notification.title ??
            'Notification',

        message:
            notification.message ??
            '',

        type:
            notification.type ??
            'general',

        read:
            Boolean(
                notification.read
            ),

        created_at:
            notification.created_at ??
            null

    };

}


/* =========================================================
   6. FORMAT NOTIFICATION TYPE
   ========================================================= */

function formatNotificationType(
    type
) {

    const normalized =
        String(
            type ||
            'general'
        )
            .trim()
            .toLowerCase();


    const labels = {

        booking:
            'Booking',

        confirmation:
            'Confirmation',

        payment:
            'Payment',

        system:
            'System',

        general:
            'General'

    };


    return (
        labels[normalized]
        ||
        capitalizeWords(
            normalized
        )
    );

}


/* =========================================================
   7. FORMAT NOTIFICATION TIME
   ========================================================= */

function formatNotificationTime(
    value
) {

    if (!value) {

        return '';

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


    const now =
        Date.now();


    const difference =
        Math.max(
            0,
            now - date.getTime()
        );


    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;


    if (
        difference < minute
    ) {

        return 'Just now';

    }


    if (
        difference < hour
    ) {

        const minutes =
            Math.floor(
                difference / minute
            );


        return `${minutes} ${
            minutes === 1
                ? 'minute'
                : 'minutes'
        } ago`;

    }


    if (
        difference < day
    ) {

        const hours =
            Math.floor(
                difference / hour
            );


        return `${hours} ${
            hours === 1
                ? 'hour'
                : 'hours'
        } ago`;

    }


    if (
        difference < 7 * day
    ) {

        const days =
            Math.floor(
                difference / day
            );


        return `${days} ${
            days === 1
                ? 'day'
                : 'days'
        } ago`;

    }


    return date.toLocaleDateString(
        'en-IN',
        {

            day:
                '2-digit',

            month:
                'short',

            year:
                'numeric'

        }
    );

}


/* =========================================================
   8. CALCULATE UNREAD COUNT
   ========================================================= */

function calculateUnreadNotificationCount() {

    RS_NOTIFICATIONS_STATE.unreadCount =
        RS_NOTIFICATIONS_STATE.items.filter(
            (notification) =>
                !notification.read
        ).length;


    return RS_NOTIFICATIONS_STATE.unreadCount;

}


/* =========================================================
   9. UPDATE UNREAD BADGE
   ========================================================= */

function updateNotificationBadge() {

    calculateUnreadNotificationCount();


    const elements =
        getNotificationElements();


    if (
        elements.unreadCount
    ) {

        elements.unreadCount.textContent =
            String(
                RS_NOTIFICATIONS_STATE.unreadCount
            );


        elements.unreadCount.hidden =
            RS_NOTIFICATIONS_STATE.unreadCount === 0;

    }

}


/* =========================================================
   10. FILTER NOTIFICATIONS
   ========================================================= */

function notificationMatchesFilter(
    notification,
    filter
) {

    switch (filter) {

        case 'unread':

            return !notification.read;


        case 'read':

            return notification.read;


        case 'all':

        default:

            return true;

    }

}


/* =========================================================
   11. APPLY NOTIFICATION FILTER
   ========================================================= */

function applyNotificationFilters() {

    const filter =
        RS_NOTIFICATIONS_STATE.filter;


    RS_NOTIFICATIONS_STATE.filteredItems =
        RS_NOTIFICATIONS_STATE.items.filter(
            (notification) =>
                notificationMatchesFilter(
                    notification,
                    filter
                )
        );


    return RS_NOTIFICATIONS_STATE.filteredItems;

}


/* =========================================================
   12. CREATE NOTIFICATION ITEM
   ========================================================= */

function createNotificationItem(
    notification
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'notification-item';


    article.dataset.notificationId =
        notification.id || '';


    article.classList.toggle(
        'is-unread',
        !notification.read
    );


    article.innerHTML = `

        <div class="notification-icon">

            <span
                aria-hidden="true">

                ${getNotificationIcon(
                    notification.type
                )}

            </span>

        </div>


        <div class="notification-content">

            <div class="notification-header">

                <h3>

                    ${escapeHtml(
                        notification.title
                    )}

                </h3>


                <time>

                    ${escapeHtml(
                        formatNotificationTime(
                            notification.created_at
                        )
                    )}

                </time>

            </div>


            <p>

                ${escapeHtml(
                    notification.message
                )}

            </p>


            <div class="notification-actions">

                ${
                    !notification.read
                        ? `
                            <button
                                type="button"
                                class="btn btn-small"
                                data-action="mark-notification-read"
                                data-notification-id="${escapeHtml(
                                    String(
                                        notification.id || ''
                                    )
                                )}">

                                Mark as read

                            </button>
                          `
                        : ''
                }


                <button
                    type="button"
                    class="btn btn-small btn-secondary"
                    data-action="open-notification"
                    data-notification-id="${escapeHtml(
                        String(
                            notification.id || ''
                        )
                    )}">

                    View

                </button>

            </div>

        </div>

    `;


    return article;

}


/* =========================================================
   13. NOTIFICATION ICON
   ========================================================= */

function getNotificationIcon(
    type
) {

    switch (
        String(
            type || ''
        ).toLowerCase()
    ) {

        case 'booking':

            return 'B';


        case 'confirmation':

            return 'C';


        case 'payment':

            return '₹';


        case 'system':

            return 'S';


        default:

            return 'N';

    }

}


/* =========================================================
   14. RENDER NOTIFICATIONS
   ========================================================= */

function renderNotifications() {

    const elements =
        getNotificationElements();


    const items =
        RS_NOTIFICATIONS_STATE.filteredItems;


    if (elements.list) {

        elements.list.innerHTML =
            '';


        items.forEach(
            (notification) => {

                elements.list.appendChild(
                    createNotificationItem(
                        notification
                    )
                );

            }
        );

    }


    if (
        elements.resultCount
    ) {

        elements.resultCount.textContent =
            String(
                items.length
            );

    }


    if (
        elements.empty
    ) {

        elements.empty.hidden =
            items.length !== 0;

    }


    updateNotificationBadge();

}


/* =========================================================
   15. LOAD NOTIFICATIONS
   ========================================================= */

async function loadNotifications() {

    if (
        RS_NOTIFICATIONS_STATE.loading
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Notifications loading skipped: user is not authenticated.'
        );


        return;

    }


    RS_NOTIFICATIONS_STATE.loading =
        true;


    const elements =
        getNotificationElements();


    if (
        elements.loading
    ) {

        elements.loading.hidden =
            false;

    }


    if (
        elements.error
    ) {

        elements.error.hidden =
            true;

    }


    try {

        /*
         * Notification database integration will be
         * connected after the final Supabase schema
         * is established.
         *
         * Existing state remains untouched.
         */

        if (
            !Array.isArray(
                RS_NOTIFICATIONS_STATE.items
            )
        ) {

            RS_NOTIFICATIONS_STATE.items =
                [];

        }


        RS_NOTIFICATIONS_STATE.items =
            RS_NOTIFICATIONS_STATE.items
                .map(
                    normalizeNotification
                )
                .filter(Boolean);


        applyNotificationFilters();

        renderNotifications();


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        if (
            elements.error
        ) {

            elements.error.textContent =
                normalizedError.message ||
                'Unable to load notifications.';


            elements.error.hidden =
                false;

        }


        debugError(
            'Notification loading failed:',
            normalizedError
        );

    } finally {

        RS_NOTIFICATIONS_STATE.loading =
            false;


        if (
            elements.loading
        ) {

            elements.loading.hidden =
                true;

        }

    }

}


/* =========================================================
   16. FIND NOTIFICATION
   ========================================================= */

function findNotificationById(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    return (
        RS_NOTIFICATIONS_STATE.items.find(
            (notification) =>
                String(
                    notification.id
                )
                ===
                String(id)
        )
        ||
        null
    );

}


/* =========================================================
   17. MARK ONE AS READ
   ========================================================= */

function markNotificationRead(
    id
) {

    const notification =
        findNotificationById(
            id
        );


    if (!notification) {

        return false;

    }


    notification.read =
        true;


    applyNotificationFilters();

    renderNotifications();


    notifyStateChange(
        'notifications',
        {

            event:
                'notification-read',

            notification

        }
    );


    return true;

}


/* =========================================================
   18. MARK ALL AS READ
   ========================================================= */

function markAllNotificationsRead() {

    RS_NOTIFICATIONS_STATE.items.forEach(
        (notification) => {

            notification.read =
                true;

        }
    );


    applyNotificationFilters();

    renderNotifications();


    notifyStateChange(
        'notifications',
        {

            event:
                'all-notifications-read'

        }
    );

}


/* =========================================================
   19. OPEN NOTIFICATION
   ========================================================= */

function openNotification(
    id
) {

    const notification =
        findNotificationById(
            id
        );


    if (!notification) {

        return;

    }


    RS_NOTIFICATIONS_STATE.selectedId =
        notification.id;


    if (
        !notification.read
    ) {

        notification.read =
            true;

    }


    applyNotificationFilters();

    renderNotifications();


    notifyStateChange(
        'notifications',
        {

            event:
                'notification-opened',

            notification

        }
    );

}


/* =========================================================
   20. FILTER CHANGE
   ========================================================= */

function updateNotificationFilter(
    value
) {

    const allowedFilters =
        NOTIFICATIONS_CONFIG.filters;


    RS_NOTIFICATIONS_STATE.filter =
        allowedFilters.includes(
            value
        )
            ? value
            : 'all';


    applyNotificationFilters();

    renderNotifications();

}


/* =========================================================
   21. ACTION HANDLER
   ========================================================= */

function handleNotificationAction(
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

        case 'mark-notification-read': {

            event.preventDefault();


            const id =
                button.getAttribute(
                    'data-notification-id'
                );


            if (id) {

                markNotificationRead(
                    id
                );

            }


            break;

        }


        case 'open-notification': {

            event.preventDefault();


            const id =
                button.getAttribute(
                    'data-notification-id'
                );


            if (id) {

                openNotification(
                    id
                );

            }


            break;

        }


        case 'mark-all-notifications-read':

            event.preventDefault();

            markAllNotificationsRead();

            break;


        default:

            break;

    }

}


/* =========================================================
   22. INITIALIZE FILTER
   ========================================================= */

function initializeNotificationFilter() {

    const elements =
        getNotificationElements();


    if (
        elements.filter
    ) {

        elements.filter.addEventListener(
            'change',
            (event) => {

                updateNotificationFilter(
                    event.target.value
                );

            }
        );

    }

}


/* =========================================================
   23. NAVIGATION EVENT
   ========================================================= */

function handleNotificationNavigation(
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
        detail.page !== 'notifications'
    ) {

        return;

    }


    loadNotifications();

}


/* =========================================================
   24. GLOBAL NOTIFICATION EVENT
   ========================================================= */

function handleExternalNotification(
    event
) {

    const detail =
        event?.detail;


    if (!detail) {

        return;

    }


    if (
        detail.section !== 'notifications'
    ) {

        return;

    }


    if (
        detail.event !== 'new-notification'
    ) {

        return;

    }


    const notification =
        normalizeNotification(
            detail.notification
        );


    if (!notification) {

        return;

    }


    RS_NOTIFICATIONS_STATE.items.unshift(
        notification
    );


    applyNotificationFilters();

    renderNotifications();


    debugLog(
        'New notification received.'
    );

}


/* =========================================================
   25. INITIALIZE MODULE
   ========================================================= */

function initializeNotifications() {

    if (
        RS_NOTIFICATIONS_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getNotificationElements();


    if (!elements.page) {

        debugError(
            'Notifications page element was not found.'
        );


        return false;

    }


    initializeNotificationFilter();


    document.addEventListener(
        'click',
        handleNotificationAction
    );


    window.addEventListener(
        'rs:state-changed',
        handleNotificationNavigation
    );


    window.addEventListener(
        'rs:state-changed',
        handleExternalNotification
    );


    RS_NOTIFICATIONS_INITIALIZED =
        true;


    debugLog(
        'Notifications module initialized.'
    );


    if (
        elements.page.hidden === false &&
        isAuthenticated()
    ) {

        loadNotifications();

    }


    return true;

}


/* =========================================================
   26. REFRESH
   ========================================================= */

async function refreshNotifications() {

    return loadNotifications();

}


/* =========================================================
   27. RESET NOTIFICATIONS
   ========================================================= */

function resetNotifications() {

    RS_NOTIFICATIONS_STATE.items =
        [];

    RS_NOTIFICATIONS_STATE.filteredItems =
        [];

    RS_NOTIFICATIONS_STATE.filter =
        'all';

    RS_NOTIFICATIONS_STATE.unreadCount =
        0;

    RS_NOTIFICATIONS_STATE.selectedId =
        null;


    renderNotifications();

}


/* =========================================================
   28. CLEANUP
   ========================================================= */

function destroyNotifications() {

    RS_NOTIFICATIONS_INITIALIZED =
        false;


    RS_NOTIFICATIONS_STATE.items =
        [];

    RS_NOTIFICATIONS_STATE.filteredItems =
        [];

    RS_NOTIFICATIONS_STATE.selectedId =
        null;

    RS_NOTIFICATIONS_STATE.unreadCount =
        0;

}


/* =========================================================
   END OF 13-NOTIFICATIONS.JS
   ========================================================= */


/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 01 — CONFIGURATION
   File: 01-config.js

   RESPONSIBILITY:
   - Application configuration
   - Supabase configuration
   - Application constants
   - Feature configuration

   THIS FILE DOES NOT:
   - Login
   - Logout
   - Database queries
   - Navigation
   - Button handling
   - DOM manipulation
   - Page rendering
   ========================================================= */

'use strict';


/* =========================================================
   1. APPLICATION CONFIGURATION
   ========================================================= */

const RS_CONFIG = Object.freeze({

    /* -----------------------------------------------------
       Application identity
       ----------------------------------------------------- */

    APP_NAME: 'RS Photography',

    APP_TITLE: 'RS Photography Owner Dashboard',

    APP_VERSION: '1.0.0',

    APP_ENVIRONMENT: 'production',


    /* -----------------------------------------------------
       Owner dashboard
       ----------------------------------------------------- */

    DASHBOARD_NAME: 'Owner Dashboard',

    DEFAULT_PAGE: 'dashboard',


    /* -----------------------------------------------------
       Theme
       ----------------------------------------------------- */

    DEFAULT_THEME: 'dark',


    /* -----------------------------------------------------
       Date / time
       ----------------------------------------------------- */

    LOCALE: 'en-IN',

    TIMEZONE: 'Asia/Kolkata',


    /* -----------------------------------------------------
       Currency
       ----------------------------------------------------- */

    CURRENCY: 'INR',

    CURRENCY_LOCALE: 'en-IN',


    /* -----------------------------------------------------
       Pagination
       ----------------------------------------------------- */

    DEFAULT_PAGE_SIZE: 10,

    MAX_PAGE_SIZE: 100,


    /* -----------------------------------------------------
       Search
       ----------------------------------------------------- */

    SEARCH_DELAY: 250,


    /* -----------------------------------------------------
       UI
       ----------------------------------------------------- */

    MOBILE_BREAKPOINT: 768,

    SIDEBAR_BREAKPOINT: 1024,


    /* -----------------------------------------------------
       Notifications
       ----------------------------------------------------- */

    NOTIFICATION_LIMIT: 20,


    /* -----------------------------------------------------
       Calendar
       ----------------------------------------------------- */

    CALENDAR_FIRST_DAY: 1,


    /* -----------------------------------------------------
       Storage
       ----------------------------------------------------- */

    STORAGE_PREFIX: 'rs_photography_',


    /* -----------------------------------------------------
       Session
       ----------------------------------------------------- */

    SESSION_CHECK_TIMEOUT: 10000

});


/* =========================================================
   2. SUPABASE CONFIGURATION
   ========================================================= */

/*
 * IMPORTANT
 *
 * Replace these two values with the PUBLIC Supabase
 * project URL and PUBLIC anon/publishable key.
 *
 * NEVER put:
 *
 * - database password
 * - service_role key
 * - secret API key
 * - private server credentials
 *
 * inside this file.
 *
 * Browser applications can expose the public Supabase
 * client key. Database security must therefore be
 * enforced using Supabase Auth + Row Level Security.
 */

const SUPABASE_CONFIG = Object.freeze({

    URL: 'https://dazguesfusfmvgfwuqnk.supabase.co',

    ANON_KEY: 'sb_publishable_oZnvdj_k5vp8_gK_XLh3Lg_a3mgpJ4T'

});


/* =========================================================
   3. DATABASE TABLE CONFIGURATION
   ========================================================= */

const RS_TABLES = Object.freeze({

    ORDERS: 'orders',

    CONTRACTS: 'contracts',

    NOTIFICATIONS: 'notifications',

    GALLERY: 'gallery',

    SETTINGS: 'studio_settings'

});


/* =========================================================
   4. BOOKING STATUS
   ========================================================= */

const BOOKING_STATUS = Object.freeze({

    PENDING: 'pending',

    CONFIRMED: 'confirmed',

    COMPLETED: 'completed',

    CANCELLED: 'cancelled'


});


/* =========================================================
   5. BOOKING STATUS LABELS
   ========================================================= */

const BOOKING_STATUS_LABELS = Object.freeze({

    pending: 'Pending',

    confirmed: 'Confirmed',

    completed: 'Completed',

    cancelled: 'Cancelled'


});


/* =========================================================
   6. BOOKING STATUS CSS CLASSES
   ========================================================= */

const BOOKING_STATUS_CLASSES = Object.freeze({

    pending: 'status-pending',

    confirmed: 'status-confirmed',

    completed: 'status-completed',

    cancelled: 'status-cancelled'


});


/* =========================================================
   7. APPLICATION PAGES
   ========================================================= */

const RS_PAGES = Object.freeze({

    DASHBOARD: 'dashboard',

    BOOKINGS: 'bookings',

    CALENDAR: 'calendar',

    CONTRACTS: 'contracts',

    GALLERY: 'gallery',

    NOTIFICATIONS: 'notifications',

    SETTINGS: 'settings'


});


/* =========================================================
   8. PAGE TITLES
   ========================================================= */

const PAGE_TITLES = Object.freeze({

    dashboard: 'Dashboard',

    bookings: 'Bookings',

    calendar: 'Calendar',

    contracts: 'Contracts',

    gallery: 'Gallery',

    notifications: 'Notifications',

    settings: 'Settings'


});


/* =========================================================
   9. PAGE DESCRIPTIONS
   ========================================================= */

const PAGE_DESCRIPTIONS = Object.freeze({

    dashboard:
        'Overview of your photography business.',

    bookings:
        'Manage customer bookings and booking status.',

    calendar:
        'View and manage scheduled photography events.',

    contracts:
        'Manage photography contracts and agreements.',

    gallery:
        'Manage studio photos and gallery content.',

    notifications:
        'View recent dashboard notifications.',

    settings:
        'Manage studio and dashboard settings.'


});


/* =========================================================
   10. NAVIGATION ITEMS
   ========================================================= */

const NAVIGATION_ITEMS = Object.freeze([

    Object.freeze({
        page: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard'
    }),

    Object.freeze({
        page: 'bookings',
        label: 'Bookings',
        icon: 'bookings'
    }),

    Object.freeze({
        page: 'calendar',
        label: 'Calendar',
        icon: 'calendar'
    }),

    Object.freeze({
        page: 'contracts',
        label: 'Contracts',
        icon: 'contracts'
    }),

    Object.freeze({
        page: 'gallery',
        label: 'Gallery',
        icon: 'gallery'
    }),

    Object.freeze({
        page: 'notifications',
        label: 'Notifications',
        icon: 'notifications'
    }),

    Object.freeze({
        page: 'settings',
        label: 'Settings',
        icon: 'settings'
    })

]);


/* =========================================================
   11. CUSTOMER BOOKING FIELDS
   ========================================================= */

const BOOKING_FIELDS = Object.freeze({

    CUSTOMER_NAME: 'customer_name',

    PHONE: 'phone',

    LOCATION: 'location',

    BOOKING_DATE: 'booking_date',

    BOOKING_TIME: 'booking_time',

    FUNCTION_TYPE: 'function_type',

    EXPECTED_MONEY: 'expected_money',

    NOTES: 'notes',

    STATUS: 'status'


});


/* =========================================================
   12. LOCAL STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = Object.freeze({

    THEME:
        `${RS_CONFIG.STORAGE_PREFIX}theme`,

    LAST_PAGE:
        `${RS_CONFIG.STORAGE_PREFIX}last_page`,

    SIDEBAR:
        `${RS_CONFIG.STORAGE_PREFIX}sidebar`


});


/* =========================================================
   13. UI TIMING
   ========================================================= */

const UI_TIMING = Object.freeze({

    TOAST_DURATION: 3500,

    SIDEBAR_TRANSITION: 250,

    MODAL_TRANSITION: 250,

    SEARCH_DEBOUNCE: 250


});


/* =========================================================
   14. FEATURE FLAGS
   ========================================================= */

const FEATURE_FLAGS = Object.freeze({

    ENABLE_BOOKINGS: true,

    ENABLE_CALENDAR: true,

    ENABLE_CONTRACTS: true,

    ENABLE_GALLERY: true,

    ENABLE_NOTIFICATIONS: true,

    ENABLE_SETTINGS: true,

    ENABLE_DARK_MODE: true


});


/* =========================================================
   15. DEBUG CONFIGURATION
   ========================================================= */

/*
 * Keep false in production.
 *
 * Later, 04-utils.js will use this value for controlled
 * diagnostic logging.
 */

const DEBUG_CONFIG = Object.freeze({

    ENABLE_LOGGING: false,

    ENABLE_DATABASE_LOGGING: false,

    ENABLE_AUTH_LOGGING: false


});


/* =========================================================
   16. VALIDATION LIMITS
   ========================================================= */

const VALIDATION_LIMITS = Object.freeze({

    CUSTOMER_NAME_MIN: 2,

    CUSTOMER_NAME_MAX: 100,

    PHONE_MIN: 7,

    PHONE_MAX: 20,

    LOCATION_MAX: 200,

    FUNCTION_TYPE_MAX: 100,

    NOTES_MAX: 2000


});


/* =========================================================
   17. SUPPORTED IMAGE TYPES
   ========================================================= */

const SUPPORTED_IMAGE_TYPES = Object.freeze([

    'image/jpeg',

    'image/png',

    'image/webp'

]);


/* =========================================================
   18. SUPPORTED VIDEO TYPES
   ========================================================= */

const SUPPORTED_VIDEO_TYPES = Object.freeze([

    'video/mp4',

    'video/webm'

]);


/* =========================================================
   19. FILE SIZE LIMITS
   ========================================================= */

const FILE_LIMITS = Object.freeze({

    IMAGE_MAX_MB: 10,

    VIDEO_MAX_MB: 100


});


/* =========================================================
   20. APPLICATION EVENTS
   ========================================================= */

const APP_EVENTS = Object.freeze({

    AUTH_CHANGED:
        'rs:auth-changed',

    PAGE_CHANGED:
        'rs:page-changed',

    SIDEBAR_CHANGED:
        'rs:sidebar-changed',

    BOOKING_CHANGED:
        'rs:booking-changed',

    NOTIFICATION_CHANGED:
        'rs:notification-changed'

});


/* =========================================================
   21. ERROR CODES
   ========================================================= */

const ERROR_CODES = Object.freeze({

    AUTH_REQUIRED:
        'AUTH_REQUIRED',

    AUTH_FAILED:
        'AUTH_FAILED',

    DATABASE_ERROR:
        'DATABASE_ERROR',

    VALIDATION_ERROR:
        'VALIDATION_ERROR',

    NETWORK_ERROR:
        'NETWORK_ERROR',

    UNKNOWN_ERROR:
        'UNKNOWN_ERROR'


});


/* =========================================================
   22. APPLICATION STATUS
   ========================================================= */

const APP_STATUS = Object.freeze({

    STARTING:
        'starting',

    READY:
        'ready',

    LOADING:
        'loading',

    ERROR:
        'error',

    OFFLINE:
        'offline'


});


/* =========================================================
   23. GLOBAL CONFIGURATION CHECK
   ========================================================= */

/*
 * This function does NOT connect to Supabase.
 *
 * It only checks whether configuration values have been
 * replaced from their placeholders.
 *
 * Authentication and database logic will be implemented
 * later in 05-auth.js and the relevant feature files.
 */

function isSupabaseConfigured() {

    const hasUrl =
        typeof SUPABASE_CONFIG.URL === 'string' &&
        SUPABASE_CONFIG.URL.trim() !== '' &&
        SUPABASE_CONFIG.URL !== 'YOUR_SUPABASE_PROJECT_URL';


    const hasKey =
        typeof SUPABASE_CONFIG.ANON_KEY === 'string' &&
        SUPABASE_CONFIG.ANON_KEY.trim() !== '' &&
        SUPABASE_CONFIG.ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';


    return hasUrl && hasKey;

}


/* =========================================================
   24. CONFIGURATION SUMMARY
   ========================================================= */

const RS_APP_INFO = Object.freeze({

    name:
        RS_CONFIG.APP_NAME,

    version:
        RS_CONFIG.APP_VERSION,

    environment:
        RS_CONFIG.APP_ENVIRONMENT,

    defaultPage:
        RS_CONFIG.DEFAULT_PAGE,

    supabaseConfigured:
        isSupabaseConfigured()

});


/* =========================================================
   END OF 01-CONFIG.JS
   ========================================================= */

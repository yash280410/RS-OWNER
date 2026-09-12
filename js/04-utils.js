
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 04 — UTILITY FUNCTIONS
   File: 04-utils.js

   RESPONSIBILITY:
   - General reusable helper functions
   - Formatting
   - Validation helpers
   - Date/time helpers
   - Safe text handling
   - Debounce/throttle
   - ID generation
   - Error normalization

   THIS FILE DOES NOT:
   - Authenticate users
   - Contact Supabase
   - Navigate pages
   - Control sidebar
   - Render dashboard
   - Perform booking CRUD
   ========================================================= */

'use strict';


/* =========================================================
   1. GENERAL TYPE HELPERS
   ========================================================= */

function isObject(value) {

    return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
    );

}


function isArray(value) {

    return Array.isArray(value);

}


function isString(value) {

    return typeof value === 'string';

}


function isNumber(value) {

    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );

}


function isFunction(value) {

    return typeof value === 'function';

}


/* =========================================================
   2. STRING HELPERS
   ========================================================= */

function normalizeString(value) {

    if (value === null || value === undefined) {

        return '';

    }


    return String(value).trim();

}


function capitalizeFirst(value) {

    const text =
        normalizeString(value);


    if (!text) {

        return '';

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function capitalizeWords(value) {

    const text =
        normalizeString(value);


    if (!text) {

        return '';

    }


    return text
        .toLowerCase()
        .split(/\s+/)
        .map(capitalizeFirst)
        .join(' ');

}


/* =========================================================
   3. SAFE HTML TEXT
   ========================================================= */

/*
 * Used whenever text originating from a database or user
 * input must be placed into an HTML string.
 *
 * This prevents HTML injection when using innerHTML.
 */

function escapeHTML(value) {

    const text =
        normalizeString(value);


    return text.replace(
        /[&<>"']/g,
        (character) => {

            const entities = {

                '&': '&amp;',

                '<': '&lt;',

                '>': '&gt;',

                '"': '&quot;',

                "'": '&#039;'

            };


            return entities[character];

        }
    );

}


/* =========================================================
   4. PHONE NORMALIZATION
   ========================================================= */

function normalizePhone(value) {

    const text =
        normalizeString(value);


    return text.replace(
        /[^\d+]/g,
        ''
    );

}


/* =========================================================
   5. EMAIL NORMALIZATION
   ========================================================= */

function normalizeEmail(value) {

    return normalizeString(value)
        .toLowerCase();

}


/* =========================================================
   6. CURRENCY FORMATTING
   ========================================================= */

function formatCurrency(
    amount,
    currency = RS_CONFIG.CURRENCY
) {

    const numericAmount =
        Number(amount);


    if (!Number.isFinite(numericAmount)) {

        return '₹0';

    }


    try {

        return new Intl.NumberFormat(
            RS_CONFIG.CURRENCY_LOCALE,
            {
                style: 'currency',
                currency,
                maximumFractionDigits: 0
            }
        ).format(numericAmount);

    } catch (error) {

        return `₹${Math.round(numericAmount)}`;

    }

}


/* =========================================================
   7. NUMBER FORMATTING
   ========================================================= */

function formatNumber(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return '0';

    }


    return new Intl.NumberFormat(
        RS_CONFIG.LOCALE
    ).format(number);

}


/* =========================================================
   8. DATE PARSING
   ========================================================= */

function parseDate(value) {

    if (!value) {

        return null;

    }


    const date =
        value instanceof Date
            ? new Date(value.getTime())
            : new Date(value);


    if (Number.isNaN(date.getTime())) {

        return null;

    }


    return date;

}


/* =========================================================
   9. DATE FORMAT
   ========================================================= */

function formatDate(
    value,
    options = {}
) {

    const date =
        parseDate(value);


    if (!date) {

        return '—';

    }


    const defaultOptions = {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

    };


    return new Intl.DateTimeFormat(
        RS_CONFIG.LOCALE,
        {
            ...defaultOptions,
            ...options
        }
    ).format(date);

}


/* =========================================================
   10. LONG DATE FORMAT
   ========================================================= */

function formatLongDate(value) {

    return formatDate(
        value,
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );

}


/* =========================================================
   11. SHORT DATE FORMAT
   ========================================================= */

function formatShortDate(value) {

    return formatDate(
        value,
        {
            day: 'numeric',
            month: 'short'
        }
    );

}


/* =========================================================
   12. TIME FORMAT
   ========================================================= */

function formatTime(value) {

    const date =
        parseDate(value);


    if (!date) {

        return '—';

    }


    return new Intl.DateTimeFormat(
        RS_CONFIG.LOCALE,
        {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }
    ).format(date);

}


/* =========================================================
   13. DATE + TIME FORMAT
   ========================================================= */

function formatDateTime(value) {

    const date =
        parseDate(value);


    if (!date) {

        return '—';

    }


    return new Intl.DateTimeFormat(
        RS_CONFIG.LOCALE,
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }
    ).format(date);

}


/* =========================================================
   14. ISO DATE
   ========================================================= */

function toISODate(value) {

    const date =
        parseDate(value);


    if (!date) {

        return '';

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');


    const day =
        String(
            date.getDate()
        ).padStart(2, '0');


    return `${year}-${month}-${day}`;

}


/* =========================================================
   15. TODAY
   ========================================================= */

function getTodayISO() {

    return toISODate(
        new Date()
    );

}


/* =========================================================
   16. SAME CALENDAR DAY
   ========================================================= */

function isSameDate(
    first,
    second
) {

    const firstDate =
        parseDate(first);

    const secondDate =
        parseDate(second);


    if (!firstDate || !secondDate) {

        return false;

    }


    return (

        firstDate.getFullYear() ===
        secondDate.getFullYear()

        &&

        firstDate.getMonth() ===
        secondDate.getMonth()

        &&

        firstDate.getDate() ===
        secondDate.getDate()

    );

}


/* =========================================================
   17. DATE COMPARISON
   ========================================================= */

function compareDates(
    first,
    second
) {

    const firstDate =
        parseDate(first);

    const secondDate =
        parseDate(second);


    if (!firstDate && !secondDate) {

        return 0;

    }


    if (!firstDate) {

        return 1;

    }


    if (!secondDate) {

        return -1;

    }


    return (
        firstDate.getTime() -
        secondDate.getTime()
    );

}


/* =========================================================
   18. DAYS IN MONTH
   ========================================================= */

function getDaysInMonth(
    year,
    month
) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}


/* =========================================================
   19. FIRST DAY OF MONTH
   ========================================================= */

function getFirstDayOfMonth(
    year,
    month
) {

    return new Date(
        year,
        month,
        1
    ).getDay();

}


/* =========================================================
   20. MONTH NAME
   ========================================================= */

function getMonthName(
    month,
    year = new Date().getFullYear()
) {

    return new Intl.DateTimeFormat(
        RS_CONFIG.LOCALE,
        {
            month: 'long'
        }
    ).format(
        new Date(year, month, 1)
    );

}


/* =========================================================
   21. DAY NAME
   ========================================================= */

function getDayName(
    day,
    short = false
) {

    return new Intl.DateTimeFormat(
        RS_CONFIG.LOCALE,
        {
            weekday:
                short
                    ? 'short'
                    : 'long'
        }
    ).format(
        new Date(2024, 0, 7 + day)
    );

}


/* =========================================================
   22. DEBOUNCE
   ========================================================= */

/*
 * Useful for search inputs.
 *
 * Example:
 *
 * const search = debounce(
 *     function () {},
 *     250
 * );
 */

function debounce(
    callback,
    delay = RS_CONFIG.SEARCH_DELAY
) {

    let timeoutId = null;


    return function (...args) {

        clearTimeout(timeoutId);


        timeoutId = setTimeout(
            () => {

                callback.apply(
                    this,
                    args
                );

            },
            delay
        );

    };

}


/* =========================================================
   23. THROTTLE
   ========================================================= */

function throttle(
    callback,
    delay = 100
) {

    let waiting = false;


    return function (...args) {

        if (waiting) {

            return;

        }


        waiting = true;


        callback.apply(
            this,
            args
        );


        setTimeout(
            () => {

                waiting = false;

            },
            delay
        );

    };

}


/* =========================================================
   24. SAFE JSON PARSE
   ========================================================= */

function safeJSONParse(
    value,
    fallback = null
) {

    if (!isString(value)) {

        return fallback;

    }


    try {

        return JSON.parse(value);

    } catch (error) {

        return fallback;

    }

}


/* =========================================================
   25. SAFE JSON STRINGIFY
   ========================================================= */

function safeJSONStringify(
    value,
    fallback = ''
) {

    try {

        return JSON.stringify(value);

    } catch (error) {

        return fallback;

    }

}


/* =========================================================
   26. LOCAL STORAGE GET
   ========================================================= */

function getStorageItem(
    key,
    fallback = null
) {

    try {

        const value =
            localStorage.getItem(key);


        if (value === null) {

            return fallback;

        }


        return value;

    } catch (error) {

        return fallback;

    }

}


/* =========================================================
   27. LOCAL STORAGE SET
   ========================================================= */

function setStorageItem(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            String(value)
        );


        return true;

    } catch (error) {

        return false;

    }

}


/* =========================================================
   28. LOCAL STORAGE REMOVE
   ========================================================= */

function removeStorageItem(key) {

    try {

        localStorage.removeItem(key);

        return true;

    } catch (error) {

        return false;

    }

}


/* =========================================================
   29. UNIQUE ID
   ========================================================= */

function generateId(
    prefix = 'rs'
) {

    const timestamp =
        Date.now()
            .toString(36);


    const random =
        Math.random()
            .toString(36)
            .slice(2, 10);


    return `${prefix}_${timestamp}_${random}`;

}


/* =========================================================
   30. ARRAY UNIQUE
   ========================================================= */

function uniqueArray(array) {

    if (!Array.isArray(array)) {

        return [];

    }


    return [
        ...new Set(array)
    ];

}


/* =========================================================
   31. ARRAY SORT
   ========================================================= */

function sortByValue(
    array,
    property,
    direction = 'asc'
) {

    if (!Array.isArray(array)) {

        return [];

    }


    const multiplier =
        direction === 'desc'
            ? -1
            : 1;


    return [...array].sort(
        (first, second) => {

            const firstValue =
                first?.[property];

            const secondValue =
                second?.[property];


            if (
                firstValue === null ||
                firstValue === undefined
            ) {

                return 1;

            }


            if (
                secondValue === null ||
                secondValue === undefined
            ) {

                return -1;

            }


            if (
                typeof firstValue === 'number' &&
                typeof secondValue === 'number'
            ) {

                return (
                    (firstValue - secondValue) *
                    multiplier
                );

            }


            return String(firstValue)
                .localeCompare(
                    String(secondValue),
                    RS_CONFIG.LOCALE,
                    {
                        sensitivity: 'base'
                    }
                ) * multiplier;

        }
    );

}


/* =========================================================
   32. ARRAY SEARCH
   ========================================================= */

function searchArray(
    array,
    query,
    fields = []
) {

    if (!Array.isArray(array)) {

        return [];

    }


    const normalizedQuery =
        normalizeString(query)
            .toLowerCase();


    if (!normalizedQuery) {

        return [...array];

    }


    return array.filter(
        (item) => {

            if (!item) {

                return false;

            }


            return fields.some(
                (field) => {

                    const value =
                        item[field];


                    return normalizeString(value)
                        .toLowerCase()
                        .includes(
                            normalizedQuery
                        );

                }
            );

        }
    );

}


/* =========================================================
   33. CLAMP NUMBER
   ========================================================= */

function clamp(
    value,
    minimum,
    maximum
) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return minimum;

    }


    return Math.min(
        Math.max(
            number,
            minimum
        ),
        maximum
    );

}


/* =========================================================
   34. FILE SIZE
   ========================================================= */

function formatFileSize(bytes) {

    const size =
        Number(bytes);


    if (
        !Number.isFinite(size) ||
        size < 0
    ) {

        return '0 B';

    }


    const units = [
        'B',
        'KB',
        'MB',
        'GB'
    ];


    if (size === 0) {

        return '0 B';

    }


    const index =
        Math.floor(
            Math.log(size) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    const value =
        size /
        Math.pow(
            1024,
            safeIndex
        );


    return `${value.toFixed(
        safeIndex === 0 ? 0 : 2
    )} ${units[safeIndex]}`;

}


/* =========================================================
   35. FILE SIZE VALIDATION
   ========================================================= */

function isFileSizeAllowed(
    file,
    maximumMB
) {

    if (!(file instanceof File)) {

        return false;

    }


    const maximumBytes =
        Number(maximumMB) *
        1024 *
        1024;


    return (
        Number.isFinite(maximumBytes) &&
        file.size <= maximumBytes
    );

}


/* =========================================================
   36. FILE TYPE VALIDATION
   ========================================================= */

function isFileTypeAllowed(
    file,
    allowedTypes
) {

    if (
        !(file instanceof File) ||
        !Array.isArray(allowedTypes)
    ) {

        return false;

    }


    return allowedTypes.includes(
        file.type
    );

}


/* =========================================================
   37. EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    const value =
        normalizeEmail(email);


    if (!value) {

        return false;

    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(value);

}


/* =========================================================
   38. PHONE VALIDATION
   ========================================================= */

function isValidPhone(phone) {

    const value =
        normalizePhone(phone);


    const digits =
        value.replace(
            /\D/g,
            ''
        );


    return (
        digits.length >=
        VALIDATION_LIMITS.PHONE_MIN

        &&

        digits.length <=
        VALIDATION_LIMITS.PHONE_MAX
    );

}


/* =========================================================
   39. CUSTOMER NAME VALIDATION
   ========================================================= */

function isValidCustomerName(name) {

    const value =
        normalizeString(name);


    return (
        value.length >=
        VALIDATION_LIMITS.CUSTOMER_NAME_MIN

        &&

        value.length <=
        VALIDATION_LIMITS.CUSTOMER_NAME_MAX
    );

}


/* =========================================================
   40. REQUIRED VALUE
   ========================================================= */

function isRequired(value) {

    return (
        value !== null &&
        value !== undefined &&
        normalizeString(value) !== ''
    );

}


/* =========================================================
   41. ERROR NORMALIZATION
   ========================================================= */

function normalizeError(error) {

    if (!error) {

        return {

            code:
                ERROR_CODES.UNKNOWN_ERROR,

            message:
                'An unknown error occurred.'

        };

    }


    if (typeof error === 'string') {

        return {

            code:
                ERROR_CODES.UNKNOWN_ERROR,

            message:
                error

        };

    }


    return {

        code:
            error.code ||
            ERROR_CODES.UNKNOWN_ERROR,

        message:
            error.message ||
            'An unexpected error occurred.'

    };

}


/* =========================================================
   42. ERROR MESSAGE
   ========================================================= */

function getErrorMessage(error) {

    return normalizeError(
        error
    ).message;

}


/* =========================================================
   43. LOGGING
   ========================================================= */

function debugLog(
    ...args
) {

    if (
        DEBUG_CONFIG.ENABLE_LOGGING
    ) {

        console.log(
            '[RS Photography]',
            ...args
        );

    }

}


/* =========================================================
   44. ERROR LOGGING
   ========================================================= */

function debugError(
    ...args
) {

    if (
        DEBUG_CONFIG.ENABLE_LOGGING
    ) {

        console.error(
            '[RS Photography]',
            ...args
        );

    }

}


/* =========================================================
   45. ASYNC DELAY
   ========================================================= */

function wait(milliseconds) {

    const duration =
        Math.max(
            0,
            Number(milliseconds) || 0
        );


    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                duration
            );

        }
    );

}


/* =========================================================
   46. SAFE CALLBACK
   ========================================================= */

function callSafely(
    callback,
    ...args
) {

    if (!isFunction(callback)) {

        return undefined;

    }


    try {

        return callback(
            ...args
        );

    } catch (error) {

        debugError(
            error
        );

        return undefined;

    }

}


/* =========================================================
   47. ELEMENT CLASS HELPERS
   ========================================================= */

function addClass(
    element,
    className
) {

    if (
        !element ||
        !className
    ) {

        return false;

    }


    element.classList.add(
        className
    );


    return true;

}


function removeClass(
    element,
    className
) {

    if (
        !element ||
        !className
    ) {

        return false;

    }


    element.classList.remove(
        className
    );


    return true;

}


function toggleClass(
    element,
    className,
    force
) {

    if (
        !element ||
        !className
    ) {

        return false;

    }


    return element.classList.toggle(
        className,
        force
    );

}


/* =========================================================
   48. ATTRIBUTE HELPERS
   ========================================================= */

function getDataAttribute(
    element,
    attribute
) {

    if (
        !element ||
        !attribute
    ) {

        return '';

    }


    return (
        element.dataset?.[attribute] ||
        ''
    );

}


/* =========================================================
   49. SCROLL LOCK
   ========================================================= */

function setBodyScrollLock(
    locked
) {

    document.body.classList.toggle(
        'scroll-locked',
        Boolean(locked)
    );

}


/* =========================================================
   50. VIEWPORT CHECK
   ========================================================= */

function isMobileViewport() {

    return (
        window.innerWidth <=
        RS_CONFIG.MOBILE_BREAKPOINT
    );

}


/* =========================================================
   51. CURRENT YEAR
   ========================================================= */

function getCurrentYear() {

    return new Date()
        .getFullYear();

}


/* =========================================================
   52. EMPTY VALUE DISPLAY
   ========================================================= */

function displayValue(
    value,
    fallback = '—'
) {

    if (
        value === null ||
        value === undefined ||
        normalizeString(value) === ''
    ) {

        return fallback;

    }


    return String(value);

}


/* =========================================================
   END OF 04-UTILS.JS
   ========================================================= */

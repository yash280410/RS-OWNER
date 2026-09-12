
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 14 — SETTINGS
   File: 14-settings.js

   RESPONSIBILITY:
   - Settings page
   - Settings form state
   - Input handling
   - Validation
   - Reset
   - Save request
   - Settings UI state

   DOES NOT:
   - Handle authentication
   - Handle navigation
   - Handle sidebar
   - Handle bookings
   - Handle calendar
   - Handle contracts
   - Handle gallery
   - Handle notifications

   DATABASE:
   The final Supabase settings table will be connected
   after the schema is finalized.
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_SETTINGS_INITIALIZED = false;


/* =========================================================
   2. SETTINGS STATE
   ========================================================= */

const RS_SETTINGS_STATE = {

    studioName: '',

    ownerName: '',

    phone: '',

    email: '',

    theme: 'dark',

    original: {},

    dirty: false,

    saving: false,

    loading: false

};


/* =========================================================
   3. SETTINGS CONFIG
   ========================================================= */

const SETTINGS_CONFIG = Object.freeze({

    defaultTheme:
        'dark',

    allowedThemes: [

        'dark'

    ]

});


/* =========================================================
   4. GET SETTINGS ELEMENTS
   ========================================================= */

function getSettingsElements() {

    return {

        page:
            domSelect(
                '[data-page-view="settings"]'
            ),

        form:
            domSelect(
                '[data-settings-form]'
            ),

        studioName:
            domSelect(
                '[name="studio_name"]'
            ),

        ownerName:
            domSelect(
                '[name="owner_name"]'
            ),

        phone:
            domSelect(
                '[name="phone"]'
            ),

        email:
            domSelect(
                '[name="email"]'
            ),

        theme:
            domSelect(
                '[name="theme"]'
            ),

        saveButton:
            domSelect(
                '[data-action="save-settings"]'
            ),

        resetButton:
            domSelect(
                '[data-action="reset-settings"]'
            ),

        status:
            domSelect(
                '[data-settings-status]'
            ),

        error:
            domSelect(
                '[data-settings-state="error"]'
            ),

        loading:
            domSelect(
                '[data-settings-state="loading"]'
            )

    };

}


/* =========================================================
   5. DEFAULT SETTINGS
   ========================================================= */

function getDefaultSettings() {

    return {

        studioName:
            'RS Photography',

        ownerName:
            '',

        phone:
            '',

        email:
            '',

        theme:
            SETTINGS_CONFIG.defaultTheme

    };

}


/* =========================================================
   6. NORMALIZE SETTINGS
   ========================================================= */

function normalizeSettings(
    settings
) {

    const source =
        settings || {};


    const defaults =
        getDefaultSettings();


    return {

        studioName:
            String(
                source.studioName ??
                source.studio_name ??
                defaults.studioName
            ).trim(),

        ownerName:
            String(
                source.ownerName ??
                source.owner_name ??
                defaults.ownerName
            ).trim(),

        phone:
            String(
                source.phone ??
                defaults.phone
            ).trim(),

        email:
            String(
                source.email ??
                defaults.email
            ).trim(),

        theme:
            SETTINGS_CONFIG.allowedThemes.includes(
                source.theme
            )
                ? source.theme
                : defaults.theme

    };

}


/* =========================================================
   7. COPY SETTINGS
   ========================================================= */

function cloneSettings(
    settings
) {

    return {

        studioName:
            settings.studioName,

        ownerName:
            settings.ownerName,

        phone:
            settings.phone,

        email:
            settings.email,

        theme:
            settings.theme

    };

}


/* =========================================================
   8. READ FORM
   ========================================================= */

function readSettingsForm() {

    const elements =
        getSettingsElements();


    return normalizeSettings({

        studioName:
            elements.studioName?.value,

        ownerName:
            elements.ownerName?.value,

        phone:
            elements.phone?.value,

        email:
            elements.email?.value,

        theme:
            elements.theme?.value

    });

}


/* =========================================================
   9. WRITE FORM
   ========================================================= */

function writeSettingsForm(
    settings
) {

    const elements =
        getSettingsElements();


    const normalized =
        normalizeSettings(
            settings
        );


    if (elements.studioName) {

        elements.studioName.value =
            normalized.studioName;

    }


    if (elements.ownerName) {

        elements.ownerName.value =
            normalized.ownerName;

    }


    if (elements.phone) {

        elements.phone.value =
            normalized.phone;

    }


    if (elements.email) {

        elements.email.value =
            normalized.email;

    }


    if (elements.theme) {

        elements.theme.value =
            normalized.theme;

    }


    RS_SETTINGS_STATE.studioName =
        normalized.studioName;

    RS_SETTINGS_STATE.ownerName =
        normalized.ownerName;

    RS_SETTINGS_STATE.phone =
        normalized.phone;

    RS_SETTINGS_STATE.email =
        normalized.email;

    RS_SETTINGS_STATE.theme =
        normalized.theme;


    updateSettingsDirtyState();

}


/* =========================================================
   10. VALIDATE SETTINGS
   ========================================================= */

function validateSettings(
    settings
) {

    const errors = [];


    if (
        !settings.studioName
    ) {

        errors.push(
            'Studio name is required.'
        );

    }


    if (
        settings.email
    ) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                settings.email
            )
        ) {

            errors.push(
                'Please enter a valid email address.'
            );

        }

    }


    if (
        settings.phone
    ) {

        const phoneDigits =
            settings.phone.replace(
                /\D/g,
                ''
            );


        if (
            phoneDigits.length < 10
        ) {

            errors.push(
                'Please enter a valid phone number.'
            );

        }

    }


    if (
        !SETTINGS_CONFIG.allowedThemes.includes(
            settings.theme
        )
    ) {

        errors.push(
            'Selected theme is not supported.'
        );

    }


    return {

        valid:
            errors.length === 0,

        errors

    };

}


/* =========================================================
   11. DIRTY STATE
   ========================================================= */

function updateSettingsDirtyState() {

    const current =
        readSettingsForm();


    const original =
        normalizeSettings(
            RS_SETTINGS_STATE.original
        );


    const dirty =
        JSON.stringify(
            current
        )
        !==
        JSON.stringify(
            original
        );


    RS_SETTINGS_STATE.dirty =
        dirty;


    const elements =
        getSettingsElements();


    if (
        elements.saveButton
    ) {

        elements.saveButton.disabled =
            RS_SETTINGS_STATE.saving ||
            !dirty;

    }

}


/* =========================================================
   12. SETTINGS STATUS
   ========================================================= */

function setSettingsStatus(
    message,
    type = 'info'
) {

    const elements =
        getSettingsElements();


    if (
        !elements.status
    ) {

        return;

    }


    elements.status.textContent =
        message || '';


    elements.status.dataset.statusType =
        type;


    elements.status.hidden =
        !Boolean(message);

}


/* =========================================================
   13. SETTINGS ERROR
   ========================================================= */

function setSettingsError(
    message
) {

    const elements =
        getSettingsElements();


    if (
        !elements.error
    ) {

        return;

    }


    elements.error.textContent =
        message || '';


    elements.error.hidden =
        !Boolean(message);

}


/* =========================================================
   14. LOADING STATE
   ========================================================= */

function setSettingsLoading(
    loading
) {

    RS_SETTINGS_STATE.loading =
        Boolean(loading);


    const elements =
        getSettingsElements();


    if (
        elements.loading
    ) {

        elements.loading.hidden =
            !RS_SETTINGS_STATE.loading;

    }

}


/* =========================================================
   15. SAVING STATE
   ========================================================= */

function setSettingsSaving(
    saving
) {

    RS_SETTINGS_STATE.saving =
        Boolean(saving);


    const elements =
        getSettingsElements();


    if (
        elements.saveButton
    ) {

        elements.saveButton.disabled =
            RS_SETTINGS_STATE.saving ||
            !RS_SETTINGS_STATE.dirty;

    }


    if (
        elements.resetButton
    ) {

        elements.resetButton.disabled =
            RS_SETTINGS_STATE.saving;

    }

}


/* =========================================================
   16. LOAD SETTINGS
   ========================================================= */

async function loadSettings() {

    if (
        RS_SETTINGS_STATE.loading
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Settings loading skipped: user is not authenticated.'
        );


        return;

    }


    setSettingsLoading(
        true
    );


    setSettingsError(
        ''
    );


    try {

        /*
         * Until the final Supabase settings schema exists,
         * load safe defaults.
         *
         * No database table is assumed.
         */

        const defaults =
            getDefaultSettings();


        RS_SETTINGS_STATE.original =
            cloneSettings(
                defaults
            );


        writeSettingsForm(
            defaults
        );


        RS_SETTINGS_STATE.original =
            cloneSettings(
                defaults
            );


        updateSettingsDirtyState();


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        setSettingsError(
            normalizedError.message ||
            'Unable to load settings.'
        );


        debugError(
            'Settings loading failed:',
            normalizedError
        );

    } finally {

        setSettingsLoading(
            false
        );

    }

}


/* =========================================================
   17. SAVE SETTINGS
   ========================================================= */

async function saveSettings() {

    if (
        RS_SETTINGS_STATE.saving
    ) {

        return false;

    }


    const settings =
        readSettingsForm();


    const validation =
        validateSettings(
            settings
        );


    if (
        !validation.valid
    ) {

        setSettingsError(
            validation.errors.join(
                ' '
            )
        );


        return false;

    }


    setSettingsError(
        ''
    );


    setSettingsSaving(
        true
    );


    try {

        /*
         * Database write will be connected after the
         * final Supabase settings schema is established.
         *
         * For now the module safely updates local state.
         */

        RS_SETTINGS_STATE.studioName =
            settings.studioName;

        RS_SETTINGS_STATE.ownerName =
            settings.ownerName;

        RS_SETTINGS_STATE.phone =
            settings.phone;

        RS_SETTINGS_STATE.email =
            settings.email;

        RS_SETTINGS_STATE.theme =
            settings.theme;


        RS_SETTINGS_STATE.original =
            cloneSettings(
                settings
            );


        RS_SETTINGS_STATE.dirty =
            false;


        setSettingsStatus(
            'Settings saved.',
            'success'
        );


        notifyStateChange(
            'settings',
            {

                event:
                    'settings-saved',

                settings:
                    cloneSettings(
                        settings
                    )

            }
        );


        updateSettingsDirtyState();


        return true;


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        setSettingsError(
            normalizedError.message ||
            'Unable to save settings.'
        );


        debugError(
            'Settings save failed:',
            normalizedError
        );


        return false;

    } finally {

        setSettingsSaving(
            false
        );


        updateSettingsDirtyState();

    }

}


/* =========================================================
   18. RESET SETTINGS
   ========================================================= */

function resetSettings() {

    const original =
        normalizeSettings(
            RS_SETTINGS_STATE.original
        );


    writeSettingsForm(
        original
    );


    setSettingsError(
        ''
    );


    setSettingsStatus(
        'Changes discarded.',
        'info'
    );


    updateSettingsDirtyState();

}


/* =========================================================
   19. HANDLE FORM INPUT
   ========================================================= */

function handleSettingsInput() {

    setSettingsStatus(
        '',
        'info'
    );


    setSettingsError(
        ''
    );


    updateSettingsDirtyState();

}


/* =========================================================
   20. ACTION HANDLER
   ========================================================= */

function handleSettingsAction(
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

        case 'save-settings':

            event.preventDefault();

            saveSettings();

            break;


        case 'reset-settings':

            event.preventDefault();

            resetSettings();

            break;


        default:

            break;

    }

}


/* =========================================================
   21. FORM SUBMIT
   ========================================================= */

function handleSettingsSubmit(
    event
) {

    event.preventDefault();

    saveSettings();

}


/* =========================================================
   22. NAVIGATION EVENT
   ========================================================= */

function handleSettingsNavigation(
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
        detail.page !== 'settings'
    ) {

        return;

    }


    loadSettings();

}


/* =========================================================
   23. INITIALIZE FORM EVENTS
   ========================================================= */

function initializeSettingsForm() {

    const elements =
        getSettingsElements();


    if (
        elements.form
    ) {

        elements.form.addEventListener(
            'submit',
            handleSettingsSubmit
        );

        elements.form.addEventListener(
            'input',
            handleSettingsInput
        );

        elements.form.addEventListener(
            'change',
            handleSettingsInput
        );

    }

}


/* =========================================================
   24. INITIALIZE SETTINGS
   ========================================================= */

function initializeSettings() {

    if (
        RS_SETTINGS_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getSettingsElements();


    if (!elements.page) {

        debugError(
            'Settings page element was not found.'
        );


        return false;

    }


    initializeSettingsForm();


    document.addEventListener(
        'click',
        handleSettingsAction
    );


    window.addEventListener(
        'rs:state-changed',
        handleSettingsNavigation
    );


    RS_SETTINGS_INITIALIZED =
        true;


    debugLog(
        'Settings module initialized.'
    );


    if (
        elements.page.hidden === false &&
        isAuthenticated()
    ) {

        loadSettings();

    }


    return true;

}


/* =========================================================
   25. REFRESH SETTINGS
   ========================================================= */

async function refreshSettings() {

    return loadSettings();

}


/* =========================================================
   26. GET SETTINGS
   ========================================================= */

function getCurrentSettings() {

    return cloneSettings(
        readSettingsForm()
    );

}


/* =========================================================
   27. CHECK UNSAVED CHANGES
   ========================================================= */

function hasUnsavedSettingsChanges() {

    return Boolean(
        RS_SETTINGS_STATE.dirty
    );

}


/* =========================================================
   28. CLEANUP
   ========================================================= */

function destroySettings() {

    RS_SETTINGS_INITIALIZED =
        false;


    RS_SETTINGS_STATE.studioName =
        '';

    RS_SETTINGS_STATE.ownerName =
        '';

    RS_SETTINGS_STATE.phone =
        '';

    RS_SETTINGS_STATE.email =
        '';

    RS_SETTINGS_STATE.theme =
        SETTINGS_CONFIG.defaultTheme;

    RS_SETTINGS_STATE.original =
        {};

    RS_SETTINGS_STATE.dirty =
        false;

    RS_SETTINGS_STATE.saving =
        false;

    RS_SETTINGS_STATE.loading =
        false;

}


/* =========================================================
   END OF 14-SETTINGS.JS
   ========================================================= */

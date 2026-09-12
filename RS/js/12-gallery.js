
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 12 — GALLERY
   File: 12-gallery.js

   RESPONSIBILITY:
   - Gallery page
   - Gallery categories
   - Gallery filtering
   - Gallery rendering
   - Image/video selection UI
   - Upload requests
   - Delete requests
   - Gallery state

   FUTURE BACKEND:
   Supabase Storage

   IMPORTANT:
   Storage bucket and database structure are intentionally
   not hard-coded until the final storage architecturek
   is confirmed.

   DOES NOT:
   - Handle authentication
   - Handle navigation
   - Handle bookings
   - Handle contracts
   - Handle notifications
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_GALLERY_INITIALIZED = false;

let RS_GALLERY_LOADING = false;

let RS_GALLERY_UPLOADING = false;


/* =========================================================
   2. GALLERY STATE
   ========================================================= */

const RS_GALLERY_STATE = {

    items: [],

    filteredItems: [],

    category: 'all',

    search: '',

    selectedId: null,

    selectedItems: [],

    loading: false,

    uploading: false

};


/* =========================================================
   3. GALLERY CONFIGURATION
   ========================================================= */

const GALLERY_CONFIG = Object.freeze({

    categories: [

        'all',

        'weddings',

        'pre-weddings',

        'portraits',

        'events'

    ],

    acceptedImageTypes: [

        'image/jpeg',

        'image/png',

        'image/webp',

        'image/avif'

    ],

    acceptedVideoTypes: [

        'video/mp4',

        'video/webm',

        'video/quicktime'

    ],

    maxFileSize:
        50 * 1024 * 1024

});


/* =========================================================
   4. GET GALLERY ELEMENTS
   ========================================================= */

function getGalleryElements() {

    return {

        page:
            domSelect(
                '[data-page-view="gallery"]'
            ),

        grid:
            domSelect(
                '[data-gallery-grid]'
            ),

        search:
            domSelect(
                '[data-gallery-search]'
            ),

        category:
            domSelect(
                '[data-gallery-category]'
            ),

        uploadInput:
            domSelect(
                '[data-gallery-upload-input]'
            ),

        uploadButton:
            domSelect(
                '[data-action="upload-gallery"]'
            ),

        resultCount:
            domSelect(
                '[data-gallery-result-count]'
            ),

        empty:
            domSelect(
                '[data-gallery-state="empty"]'
            ),

        loading:
            domSelect(
                '[data-gallery-state="loading"]'
            ),

        error:
            domSelect(
                '[data-gallery-state="error"]'
            )

    };

}


/* =========================================================
   5. NORMALIZE GALLERY ITEM
   ========================================================= */

function normalizeGalleryItem(
    item
) {

    if (!item) {

        return null;

    }


    return {

        ...item,

        id:
            item.id ?? null,

        name:
            item.name ?? '',

        url:
            item.url ?? '',

        thumbnail_url:
            item.thumbnail_url ??
            item.url ??
            '',

        category:
            item.category ||
            'events',

        type:
            item.type ||
            detectGalleryMediaType(
                item.name
            ),

        size:
            item.size ?? null,

        created_at:
            item.created_at ?? null

    };

}


/* =========================================================
   6. DETECT MEDIA TYPE
   ========================================================= */

function detectGalleryMediaType(
    filename
) {

    const value =
        String(
            filename || ''
        )
            .toLowerCase();


    const extension =
        value.includes('.')
            ? value
                .split('.')
                .pop()
            : '';


    const videoExtensions = [

        'mp4',

        'webm',

        'mov',

        'm4v'

    ];


    if (
        videoExtensions.includes(
            extension
        )
    ) {

        return 'video';

    }


    return 'image';

}


/* =========================================================
   7. FORMAT GALLERY CATEGORY
   ========================================================= */

function formatGalleryCategory(
    category
) {

    const normalized =
        String(
            category ||
            'events'
        )
            .trim()
            .toLowerCase();


    const labels = {

        all:
            'All',

        weddings:
            'Weddings',

        'pre-weddings':
            'Pre-Weddings',

        portraits:
            'Portraits',

        events:
            'Events'

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
   8. FORMAT FILE SIZE
   ========================================================= */

function formatGalleryFileSize(
    bytes
) {

    const value =
        Number(bytes);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return '';

    }


    const units = [

        'B',

        'KB',

        'MB',

        'GB'

    ];


    let size =
        value;


    let unitIndex =
        0;


    while (
        size >= 1024 &&
        unitIndex <
        units.length - 1
    ) {

        size /=
            1024;

        unitIndex++;

    }


    return `${size.toFixed(
        size >= 10 || unitIndex === 0
            ? 0
            : 1
    )} ${units[unitIndex]}`;

}


/* =========================================================
   9. SET LOADING STATE
   ========================================================= */

function setGalleryLoading(
    loading
) {

    RS_GALLERY_LOADING =
        Boolean(loading);


    RS_GALLERY_STATE.loading =
        RS_GALLERY_LOADING;


    const elements =
        getGalleryElements();


    if (elements.loading) {

        elements.loading.hidden =
            !RS_GALLERY_LOADING;

    }


    if (elements.page) {

        elements.page.classList.toggle(
            'gallery-loading',
            RS_GALLERY_LOADING
        );

    }

}


/* =========================================================
   10. SET UPLOAD STATE
   ========================================================= */

function setGalleryUploading(
    uploading
) {

    RS_GALLERY_UPLOADING =
        Boolean(uploading);


    RS_GALLERY_STATE.uploading =
        RS_GALLERY_UPLOADING;


    const elements =
        getGalleryElements();


    if (elements.uploadButton) {

        elements.uploadButton.disabled =
            RS_GALLERY_UPLOADING;

    }


    if (elements.uploadInput) {

        elements.uploadInput.disabled =
            RS_GALLERY_UPLOADING;

    }

}


/* =========================================================
   11. SET ERROR
   ========================================================= */

function setGalleryError(
    message
) {

    const elements =
        getGalleryElements();


    if (!elements.error) {

        return;

    }


    elements.error.textContent =
        message || '';


    elements.error.hidden =
        !Boolean(message);

}


/* =========================================================
   12. LOAD GALLERY
   ========================================================= */

async function loadGallery() {

    if (
        RS_GALLERY_LOADING
    ) {

        return;

    }


    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Gallery loading skipped: user is not authenticated.'
        );


        return;

    }


    setGalleryLoading(
        true
    );


    setGalleryError(
        ''
    );


    try {

        /*
         * Gallery backend connection will be attached once
         * the final Supabase Storage structure is defined.
         *
         * For now we preserve the existing state safely.
         */

        if (
            !Array.isArray(
                RS_GALLERY_STATE.items
            )
        ) {

            RS_GALLERY_STATE.items =
                [];

        }


        applyGalleryFilters();

        renderGallery();


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        setGalleryError(
            normalizedError.message ||
            'Unable to load gallery.'
        );


        debugError(
            'Gallery loading failed:',
            normalizedError
        );

    } finally {

        setGalleryLoading(
            false
        );

    }

}


/* =========================================================
   13. SEARCH MATCH
   ========================================================= */

function galleryMatchesSearch(
    item,
    search
) {

    if (!search) {

        return true;

    }


    const searchableText = [

        item.name,

        item.category,

        item.type

    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


    return searchableText.includes(
        search
    );

}


/* =========================================================
   14. CATEGORY MATCH
   ========================================================= */

function galleryMatchesCategory(
    item,
    category
) {

    if (
        !category ||
        category === 'all'
    ) {

        return true;

    }


    return (
        String(
            item.category || ''
        )
            .toLowerCase()
        ===
        String(
            category
        )
            .toLowerCase()
    );

}


/* =========================================================
   15. APPLY FILTERS
   ========================================================= */

function applyGalleryFilters() {

    const search =
        String(
            RS_GALLERY_STATE.search || ''
        )
            .trim()
            .toLowerCase();


    const category =
        RS_GALLERY_STATE.category;


    RS_GALLERY_STATE.filteredItems =
        RS_GALLERY_STATE.items.filter(
            (item) => {

                return (

                    galleryMatchesSearch(
                        item,
                        search
                    )

                    &&

                    galleryMatchesCategory(
                        item,
                        category
                    )

                );

            }
        );


    return RS_GALLERY_STATE.filteredItems;

}


/* =========================================================
   16. CREATE IMAGE ITEM
   ========================================================= */

function createGalleryImage(
    item
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'gallery-item';


    article.dataset.galleryId =
        item.id || '';


    article.dataset.mediaType =
        'image';


    article.innerHTML = `

        <div class="gallery-media">

            <img
                src="${escapeHtml(
                    item.thumbnail_url ||
                    item.url
                )}"
                alt="${escapeHtml(
                    item.name ||
                    'Gallery image'
                )}"
                loading="lazy"
            >

            <div class="gallery-overlay">

                <button
                    type="button"
                    class="btn btn-small"
                    data-action="view-gallery-item"
                    data-gallery-id="${escapeHtml(
                        String(item.id || '')
                    )}">

                    View

                </button>


                <button
                    type="button"
                    class="btn btn-small"
                    data-action="delete-gallery-item"
                    data-gallery-id="${escapeHtml(
                        String(item.id || '')
                    )}">

                    Delete

                </button>

            </div>

        </div>


        <div class="gallery-item-info">

            <strong>

                ${escapeHtml(
                    item.name ||
                    'Untitled'
                )}

            </strong>

            <span>

                ${escapeHtml(
                    formatGalleryCategory(
                        item.category
                    )
                )}

            </span>

        </div>

    `;


    return article;

}


/* =========================================================
   17. CREATE VIDEO ITEM
   ========================================================= */

function createGalleryVideo(
    item
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'gallery-item';


    article.dataset.galleryId =
        item.id || '';


    article.dataset.mediaType =
        'video';


    article.innerHTML = `

        <div class="gallery-media">

            <video
                src="${escapeHtml(
                    item.url
                )}"
                preload="metadata"
                playsinline
            ></video>


            <span class="gallery-video-label">
                Video
            </span>


            <div class="gallery-overlay">

                <button
                    type="button"
                    class="btn btn-small"
                    data-action="view-gallery-item"
                    data-gallery-id="${escapeHtml(
                        String(item.id || '')
                    )}">

                    View

                </button>


                <button
                    type="button"
                    class="btn btn-small"
                    data-action="delete-gallery-item"
                    data-gallery-id="${escapeHtml(
                        String(item.id || '')
                    )}">

                    Delete

                </button>

            </div>

        </div>


        <div class="gallery-item-info">

            <strong>

                ${escapeHtml(
                    item.name ||
                    'Untitled Video'
                )}

            </strong>

            <span>

                ${escapeHtml(
                    formatGalleryCategory(
                        item.category
                    )
                )}

            </span>

        </div>

    `;


    return article;

}


/* =========================================================
   18. CREATE GALLERY ITEM
   ========================================================= */

function createGalleryItem(
    item
) {

    if (
        item.type === 'video'
    ) {

        return createGalleryVideo(
            item
        );

    }


    return createGalleryImage(
        item
    );

}


/* =========================================================
   19. RENDER GALLERY
   ========================================================= */

function renderGallery() {

    const elements =
        getGalleryElements();


    if (!elements.grid) {

        return;

    }


    const items =
        RS_GALLERY_STATE.filteredItems;


    elements.grid.innerHTML =
        '';


    items.forEach(
        (item) => {

            elements.grid.appendChild(
                createGalleryItem(
                    item
                )
            );

        }
    );


    if (elements.resultCount) {

        elements.resultCount.textContent =
            String(
                items.length
            );

    }


    if (elements.empty) {

        elements.empty.hidden =
            items.length !== 0;

    }

}


/* =========================================================
   20. FIND GALLERY ITEM
   ========================================================= */

function findGalleryItemById(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    return (
        RS_GALLERY_STATE.items.find(
            (item) =>
                String(
                    item.id
                )
                ===
                String(id)
        )
        ||
        null
    );

}


/* =========================================================
   21. UPDATE SEARCH
   ========================================================= */

function updateGallerySearch(
    value
) {

    RS_GALLERY_STATE.search =
        String(
            value || ''
        );


    applyGalleryFilters();

    renderGallery();

}


/* =========================================================
   22. UPDATE CATEGORY
   ========================================================= */

function updateGalleryCategory(
    value
) {

    RS_GALLERY_STATE.category =
        value || 'all';


    applyGalleryFilters();

    renderGallery();

}


/* =========================================================
   23. FILE VALIDATION
   ========================================================= */

function validateGalleryFile(
    file
) {

    if (!file) {

        return {

            valid: false,

            error:
                'No file selected.'

        };

    }


    if (
        file.size >
        GALLERY_CONFIG.maxFileSize
    ) {

        return {

            valid: false,

            error:
                'File is larger than the allowed 50 MB limit.'

        };

    }


    const acceptedTypes = [

        ...GALLERY_CONFIG.acceptedImageTypes,

        ...GALLERY_CONFIG.acceptedVideoTypes

    ];


    if (
        !acceptedTypes.includes(
            file.type
        )
    ) {

        return {

            valid: false,

            error:
                'This file type is not supported.'

        };

    }


    return {

        valid: true,

        error:
            ''

    };

}


/* =========================================================
   24. HANDLE FILE SELECTION
   ========================================================= */

function handleGalleryFileSelection(
    event
) {

    const files =
        Array.from(
            event.target.files || []
        );


    if (
        files.length === 0
    ) {

        return;

    }


    const invalidFiles =
        files
            .map(
                validateGalleryFile
            )
            .filter(
                (result) =>
                    !result.valid
            );


    if (
        invalidFiles.length > 0
    ) {

        setGalleryError(
            invalidFiles[0].error
        );


        return;

    }


    setGalleryError(
        ''
    );


    /*
     * Do not upload automatically.
     *
     * The final upload workflow will pass these files
     * through the dedicated upload layer.
     */

    notifyStateChange(
        'gallery',
        {

            event:
                'files-selected',

            files

        }
    );

}


/* =========================================================
   25. UPLOAD REQUEST
   ========================================================= */

function requestGalleryUpload() {

    const elements =
        getGalleryElements();


    if (
        !elements.uploadInput
    ) {

        debugError(
            'Gallery upload input was not found.'
        );


        return;

    }


    elements.uploadInput.click();

}


/* =========================================================
   26. DELETE REQUEST
   ========================================================= */

function requestGalleryDelete(
    id
) {

    const item =
        findGalleryItemById(
            id
        );


    if (!item) {

        debugError(
            `Gallery item not found: ${id}`
        );


        return;

    }


    notifyStateChange(
        'gallery',
        {

            event:
                'delete-requested',

            item

        }
    );

}


/* =========================================================
   27. VIEW REQUEST
   ========================================================= */

function requestGalleryView(
    id
) {

    const item =
        findGalleryItemById(
            id
        );


    if (!item) {

        debugError(
            `Gallery item not found: ${id}`
        );


        return;

    }


    RS_GALLERY_STATE.selectedId =
        item.id;


    notifyStateChange(
        'gallery',
        {

            event:
                'view-requested',

            item

        }
    );

}


/* =========================================================
   28. GALLERY ACTION HANDLER
   ========================================================= */

function handleGalleryAction(
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

        case 'upload-gallery':

            event.preventDefault();

            requestGalleryUpload();

            break;


        case 'view-gallery-item': {

            event.preventDefault();


            const id =
                button.getAttribute(
                    'data-gallery-id'
                );


            if (id) {

                requestGalleryView(
                    id
                );

            }

            break;

        }


        case 'delete-gallery-item': {

            event.preventDefault();


            const id =
                button.getAttribute(
                    'data-gallery-id'
                );


            if (id) {

                requestGalleryDelete(
                    id
                );

            }

            break;

        }


        default:

            break;

    }

}


/* =========================================================
   29. NAVIGATION EVENT
   ========================================================= */

function handleGalleryNavigation(
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
        detail.page !== 'gallery'
    ) {

        return;

    }


    loadGallery();

}


/* =========================================================
   30. INITIALIZE FILTERS
   ========================================================= */

function initializeGalleryFilters() {

    const elements =
        getGalleryElements();


    if (elements.search) {

        elements.search.addEventListener(
            'input',
            (event) => {

                updateGallerySearch(
                    event.target.value
                );

            }
        );

    }


    if (elements.category) {

        elements.category.addEventListener(
            'change',
            (event) => {

                updateGalleryCategory(
                    event.target.value
                );

            }
        );

    }


    if (elements.uploadInput) {

        elements.uploadInput.addEventListener(
            'change',
            handleGalleryFileSelection
        );

    }

}


/* =========================================================
   31. INITIALIZE GALLERY
   ========================================================= */

function initializeGallery() {

    if (
        RS_GALLERY_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getGalleryElements();


    if (!elements.page) {

        debugError(
            'Gallery page element was not found.'
        );


        return false;

    }


    initializeGalleryFilters();


    document.addEventListener(
        'click',
        handleGalleryAction
    );


    window.addEventListener(
        'rs:state-changed',
        handleGalleryNavigation
    );


    RS_GALLERY_INITIALIZED =
        true;


    debugLog(
        'Gallery module initialized.'
    );


    if (
        elements.page.hidden === false &&
        isAuthenticated()
    ) {

        loadGallery();

    }


    return true;

}


/* =========================================================
   32. REFRESH GALLERY
   ========================================================= */

async function refreshGallery() {

    return loadGallery();

}


/* =========================================================
   33. CLEAR GALLERY FILTERS
   ========================================================= */

function clearGalleryFilters() {

    RS_GALLERY_STATE.search =
        '';

    RS_GALLERY_STATE.category =
        'all';


    const elements =
        getGalleryElements();


    if (elements.search) {

        elements.search.value =
            '';

    }


    if (elements.category) {

        elements.category.value =
            'all';

    }


    applyGalleryFilters();

    renderGallery();

}


/* =========================================================
   34. CLEANUP
   ========================================================= */

function destroyGallery() {

    RS_GALLERY_INITIALIZED =
        false;

    RS_GALLERY_LOADING =
        false;

    RS_GALLERY_UPLOADING =
        false;


    RS_GALLERY_STATE.items =
        [];

    RS_GALLERY_STATE.filteredItems =
        [];

    RS_GALLERY_STATE.selectedId =
        null;

    RS_GALLERY_STATE.selectedItems =
        [];

}


/* =========================================================
   END OF 12-GALLERY.JS
   ========================================================= */

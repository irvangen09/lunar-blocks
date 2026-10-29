import { __, sprintf } from '@wordpress/i18n';

const LINK = '.lunar-gallery-item__link';
const GALLERY = '.lunar-gallery';
const ITEM = '.lunar-gallery-item';
const CAPTION = '.lunar-gallery-item__caption';
const BODY_CLASS = 'lunar-gallery-lightbox-open';
const SVG_NS = 'http://www.w3.org/2000/svg';

let dialog;
let image;
let caption;
let prevButton;
let nextButton;
let group = [];
let index = 0;

function createButton( name, label, path ) {
	const button = document.createElement( 'button' );
	button.type = 'button';
	button.className = `lunar-gallery-lightbox__${ name }`;
	button.setAttribute( 'aria-label', label );

	const svg = document.createElementNS( SVG_NS, 'svg' );
	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'aria-hidden', 'true' );
	svg.setAttribute( 'focusable', 'false' );

	const shape = document.createElementNS( SVG_NS, 'path' );
	shape.setAttribute( 'd', path );
	svg.append( shape );
	button.append( svg );

	return button;
}

function show( position ) {
	// Wrap around: stepping past either end continues from the other.
	index = ( position + group.length ) % group.length;

	const link = group[ index ];
	const thumbnail = link.querySelector( 'img' );
	const text =
		link.closest( ITEM )?.querySelector( CAPTION )?.textContent.trim() ??
		'';

	image.src = link.href;
	image.alt = thumbnail ? thumbnail.alt : '';
	caption.textContent = text;
	caption.hidden = '' === text;

	prevButton.hidden = group.length < 2;
	nextButton.hidden = group.length < 2;
}

function onKeyDown( event ) {
	// Some themes cancel Escape on the whole document, which stops the
	// browser from closing the dialog.
	if ( 'Escape' === event.key ) {
		event.preventDefault();
		dialog.close();
		return;
	}

	if ( group.length < 2 ) {
		return;
	}

	if ( 'ArrowLeft' === event.key ) {
		show( index - 1 );
	} else if ( 'ArrowRight' === event.key ) {
		show( index + 1 );
	}
}

function build() {
	if ( dialog ) {
		return;
	}

	dialog = document.createElement( 'dialog' );
	dialog.className = 'lunar-gallery-lightbox';
	dialog.setAttribute( 'aria-label', __( 'Image preview', 'lunar-blocks' ) );

	const closeButton = createButton(
		'close',
		__( 'Close', 'lunar-blocks' ),
		'M6 6l12 12M18 6L6 18'
	);
	prevButton = createButton(
		'prev',
		__( 'Previous', 'lunar-blocks' ),
		'M15 5l-7 7 7 7'
	);
	nextButton = createButton(
		'next',
		__( 'Next', 'lunar-blocks' ),
		'M9 5l7 7-7 7'
	);

	const figure = document.createElement( 'figure' );
	figure.className = 'lunar-gallery-lightbox__figure';

	image = document.createElement( 'img' );
	image.className = 'lunar-gallery-lightbox__image';
	image.alt = '';

	caption = document.createElement( 'figcaption' );
	caption.className = 'lunar-gallery-lightbox__caption';
	caption.hidden = true;

	figure.append( image, caption );
	dialog.append( closeButton, prevButton, figure, nextButton );

	closeButton.addEventListener( 'click', () => dialog.close() );
	prevButton.addEventListener( 'click', () => show( index - 1 ) );
	nextButton.addEventListener( 'click', () => show( index + 1 ) );

	// The dialog fills the screen, so a click on it directly is a click
	// outside the picture.
	dialog.addEventListener( 'click', ( event ) => {
		if ( event.target === dialog ) {
			dialog.close();
		}
	} );
	dialog.addEventListener( 'keydown', onKeyDown );
	dialog.addEventListener( 'close', () => {
		document.body.classList.remove( BODY_CLASS );
	} );

	document.body.append( dialog );
}

function open( link ) {
	build();

	// Each Gallery is its own group; previous and next never leave it.
	const gallery = link.closest( GALLERY );
	group = gallery ? Array.from( gallery.querySelectorAll( LINK ) ) : [ link ];

	show( Math.max( group.indexOf( link ), 0 ) );
	document.body.classList.add( BODY_CLASS );
	dialog.showModal();
}

// A link around an image without alt text has no name, so it takes the
// caption or its place in the gallery.
function nameLinks() {
	document.querySelectorAll( GALLERY ).forEach( ( gallery ) => {
		const links = gallery.querySelectorAll( LINK );

		links.forEach( ( link, position ) => {
			const alt =
				link.querySelector( 'img' )?.getAttribute( 'alt' ) ?? '';

			if ( '' !== alt.trim() ) {
				return;
			}

			const text =
				link
					.closest( ITEM )
					?.querySelector( CAPTION )
					?.textContent.trim() ?? '';

			link.setAttribute(
				'aria-label',
				text ||
					sprintf(
						/* translators: 1: image number, 2: number of images. */
						__( 'Image %1$d of %2$d', 'lunar-blocks' ),
						position + 1,
						links.length
					)
			);
		} );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', nameLinks );
} else {
	nameLinks();
}

// Without <dialog> support the links keep opening the full-size file.
if ( 'function' === typeof window.HTMLDialogElement?.prototype.showModal ) {
	document.addEventListener( 'click', ( event ) => {
		const isPlainClick =
			0 === event.button &&
			! event.ctrlKey &&
			! event.metaKey &&
			! event.shiftKey &&
			! event.altKey;

		const link = event.target.closest?.( LINK );

		if ( event.defaultPrevented || ! isPlainClick || ! link ) {
			return;
		}

		event.preventDefault();
		open( link );
	} );
}

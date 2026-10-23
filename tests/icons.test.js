/* global describe, test, expect */
/**
 * Block icons.
 *
 * The editor stylesheet fills SVGs with currentColor, which turns outline
 * icons into solid shapes unless the fill is reset on the element itself.
 */
const { renderToString } = require( '@wordpress/element' );
const { AccordionIcon } = require( '../src/accordion/icons' );
const { CalloutIcon } = require( '../src/callout/icons' );
const {
	CloseIcon,
	GalleryIcon,
	GalleryItemIcon,
} = require( '../src/gallery/icons' );
const { InfoListIcon } = require( '../src/info-list/icons' );
const { InfoboxIcon } = require( '../src/infobox/icons' );
const { TableIcon } = require( '../src/table/icons' );
const { TabsIcon } = require( '../src/tabs/icons' );
const { TocIcon } = require( '../src/toc/icons' );

const icons = {
	accordion: () => AccordionIcon( {} ),
	'callout, info': () => CalloutIcon( { variant: 'info' } ),
	'callout, tips': () => CalloutIcon( { variant: 'tips' } ),
	'callout, warning': () => CalloutIcon( { variant: 'warning' } ),
	'callout, important': () => CalloutIcon( { variant: 'important' } ),
	'callout, unknown variant': () => CalloutIcon( { variant: 'other' } ),
	gallery: () => GalleryIcon( {} ),
	'gallery item': () => GalleryItemIcon( {} ),
	'gallery close': () => CloseIcon( {} ),
	'info list': () => InfoListIcon( {} ),
	infobox: () => InfoboxIcon( {} ),
	table: () => TableIcon( {} ),
	tabs: () => TabsIcon( {} ),
	'table of contents': () => TocIcon( {} ),
};

describe( 'icons', () => {
	test.each( Object.entries( icons ) )(
		'%s is an outline icon hidden from assistive technology',
		( name, render ) => {
			const markup = renderToString( render() );

			expect( markup ).toContain( 'style="fill:none"' );
			expect( markup ).toContain( 'stroke="currentColor"' );
			expect( markup ).toContain( 'aria-hidden="true"' );
			expect( markup ).toContain( 'focusable="false"' );
			expect( markup ).toContain( '<path ' );
		}
	);
} );

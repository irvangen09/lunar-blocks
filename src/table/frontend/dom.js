const SVG_NS = 'http://www.w3.org/2000/svg';

export function createElement( tag, className ) {
	const element = document.createElement( tag );

	element.className = className;

	return element;
}

// Each entry is [ path data, optional class name ].
export function createIcon( paths ) {
	const svg = document.createElementNS( SVG_NS, 'svg' );

	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'fill', 'none' );
	svg.setAttribute( 'stroke', 'currentColor' );
	svg.setAttribute( 'stroke-width', '2' );
	svg.setAttribute( 'stroke-linecap', 'round' );
	svg.setAttribute( 'stroke-linejoin', 'round' );
	svg.setAttribute( 'aria-hidden', 'true' );
	svg.setAttribute( 'focusable', 'false' );

	paths.forEach( ( [ d, name ] ) => {
		const path = document.createElementNS( SVG_NS, 'path' );

		path.setAttribute( 'd', d );

		if ( name ) {
			path.setAttribute( 'class', name );
		}

		svg.appendChild( path );
	} );

	return svg;
}

export function getBodyRows( tableEl ) {
	return tableEl.tBodies[ 0 ] ? [ ...tableEl.tBodies[ 0 ].rows ] : [];
}

export function isDividerRow( row ) {
	return row.classList.contains( 'moon-table__row--divider' );
}

// A divider heads the rows that follow it. Rows before the first
// divider form a section without a heading.
export function toSections( rows ) {
	const sections = [ { divider: null, rows: [] } ];

	rows.forEach( ( row ) => {
		if ( isDividerRow( row ) ) {
			sections.push( { divider: row, rows: [] } );
		} else {
			sections[ sections.length - 1 ].rows.push( row );
		}
	} );

	return sections;
}

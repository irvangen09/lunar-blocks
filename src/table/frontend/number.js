export function parseLeadingNumber( text ) {
	const match = String( text )
		.trim()
		.match( /^([+\-−]?)\s*(\d[\d.,]*)/ );

	if ( ! match ) {
		return null;
	}

	const sign = '+' === match[ 1 ] || '' === match[ 1 ] ? 1 : -1;

	// A trailing separator belongs to the text after the number ("5.").
	const digits = match[ 2 ].replace( /[.,]+$/, '' );
	const lastDot = digits.lastIndexOf( '.' );
	const lastComma = digits.lastIndexOf( ',' );
	let normalized;

	if ( -1 !== lastDot && -1 !== lastComma ) {
		const decimal = lastDot > lastComma ? '.' : ',';
		const group = '.' === decimal ? ',' : '.';

		normalized = digits.split( group ).join( '' ).replace( decimal, '.' );
	} else if ( /^[1-9]\d{0,2}([.,]\d{3})+$/.test( digits ) ) {
		normalized = digits.replace( /[.,]/g, '' );
	} else {
		normalized = digits.replace( ',', '.' );
	}

	const value = parseFloat( normalized );

	return Number.isNaN( value ) ? null : sign * value;
}

// Text that stands for "no value": it sorts last, like an empty cell.
export function isNoValue( text ) {
	return '' === text || /^(n\/a|—|-)$/i.test( text );
}

// A column sorts by amount when every value it has starts with a number.
// A column of words with one number in it still sorts as text.
export function isNumericColumn( texts ) {
	const filled = texts.filter( ( text ) => ! isNoValue( text ) );

	return (
		filled.length > 0 &&
		filled.every( ( text ) => null !== parseLeadingNumber( text ) )
	);
}

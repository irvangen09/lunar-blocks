/* global describe, test, expect, beforeEach, afterEach, jest */
/**
 * The Settings screen, run in a simulated page with the REST request replaced.
 * It checks what a keyboard or screen reader user meets: button names, focus
 * after saving, and edits made while a save is still running.
 */
// Each test loads the whole screen and its WordPress components again. On a
// cold cache (a first run, or a slower machine) that can take longer than the
// default five seconds, which is not a sign of a problem.
jest.setTimeout( 30000 );

// The request is replaced by a function the test controls. The screen is loaded
// again for each test in its own module registry, so the stand-in cannot be a
// plain automock (each registry would get its own copy).
const mockApiFetch = jest.fn();

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: ( ...args ) => mockApiFetch( ...args ),
} ) );

const apiFetch = mockApiFetch;

// Each screen is taken down after its test, or its timers would fire in the
// next one.
const mockRoots = [];

jest.mock( '@wordpress/element', () => {
	const actual = jest.requireActual( '@wordpress/element' );

	return {
		...actual,
		createRoot: ( ...args ) => {
			const root = actual.createRoot( ...args );

			mockRoots.push( root );

			return root;
		},
	};
} );

const OPTION = 'lunar_blocks_settings';
const BLOCKS = [
	{ name: 'lunar-blocks/accordion', title: 'Accordion' },
	{ name: 'lunar-blocks/callout', title: 'Callout' },
];
const STORED = {
	disabled_blocks: [],
	appearance: { primary: '', surface: '', border: '#cccccc' },
};

function response( settings ) {
	return { [ OPTION ]: settings };
}

// A request the test settles by hand, to hold a save in flight.
function deferred() {
	const handle = {};

	handle.promise = new Promise( ( resolve, reject ) => {
		handle.resolve = resolve;
		handle.reject = reject;
	} );

	return handle;
}

// `act` must come from the same copy of React that draws the screen, so it is
// taken from the registry the screen is loaded in.
let act;

async function flush() {
	// One turn of the event loop, not only of the promises: the tab list
	// updates itself in a timer.
	await act( async () => {
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	} );
}

// Waits, turn by turn, until the screen reaches the wanted state. A fixed
// number of turns is not enough when the machine is busy.
async function waitFor( condition ) {
	for ( let turn = 0; turn < 50 && ! condition(); turn++ ) {
		await flush();
	}
}

async function openSettings( postHandler ) {
	apiFetch.mockImplementation( ( { method } ) =>
		'POST' === method
			? postHandler()
			: Promise.resolve( response( STORED ) )
	);

	document.body.innerHTML = '<div id="lunar-blocks-settings"></div>';
	window.lunarBlocksSettings = { option: OPTION, blocks: BLOCKS };

	let rendering;

	jest.isolateModules( () => {
		// A copy of React that WordPress packages share; only its test helper
		// is needed here.
		// eslint-disable-next-line import/no-extraneous-dependencies
		act = require( 'react' ).act;
		rendering = act( async () => {
			require( '../src/admin/index' );
		} );
	} );

	await rendering;
	await flush();
	await waitFor( () => toggle( 'Accordion' ) );
}

const saveButton = () =>
	[ ...document.querySelectorAll( 'button' ) ].find(
		( b ) => 'Save Changes' === b.textContent.trim()
	);

const toggle = ( title ) =>
	[ ...document.querySelectorAll( 'input[type="checkbox"]' ) ].find(
		( input ) =>
			input.closest( '.components-base-control' )?.textContent === title
	);

async function click( element ) {
	await act( async () => {
		element.click();
	} );
}

async function openAppearance() {
	const tab = [ ...document.querySelectorAll( '[role="tab"]' ) ].find(
		( t ) => 'Appearance' === t.textContent.trim()
	);

	await click( tab );
	await flush();
}

beforeEach( () => {
	globalThis.IS_REACT_ACT_ENVIRONMENT = true;
	apiFetch.mockReset();
} );

afterEach( async () => {
	await act( async () => {
		mockRoots.splice( 0 ).forEach( ( root ) => root.unmount() );
	} );
	document.body.innerHTML = '';
	delete window.lunarBlocksSettings;
} );

describe( 'the Settings screen', () => {
	test( 'loads the stored settings and keeps Save off until something changes', async () => {
		await openSettings( () => Promise.resolve( {} ) );

		expect( toggle( 'Accordion' ).checked ).toBe( true );
		expect(
			saveButton().disabled ||
				saveButton().getAttribute( 'aria-disabled' )
		).toBeTruthy();

		await click( toggle( 'Accordion' ) );

		expect( toggle( 'Accordion' ).checked ).toBe( false );
		expect( saveButton().disabled ).toBe( false );
		expect( saveButton().getAttribute( 'aria-disabled' ) ).not.toBe(
			'true'
		);
	} );
} );

describe( 'the color buttons', () => {
	test( 'each says which color it is for, so no two share a name', async () => {
		await openSettings( () => Promise.resolve( {} ) );
		await openAppearance();

		const toggles = [
			...document.querySelectorAll( 'button[aria-expanded]' ),
		];
		const names = toggles.map(
			( b ) => b.getAttribute( 'aria-label' ) || b.textContent.trim()
		);

		expect( toggles ).toHaveLength( 3 );
		expect( new Set( names ).size ).toBe( 3 );
		expect( names[ 0 ] ).toContain( 'Primary' );
		expect( names[ 1 ] ).toContain( 'Surface' );
		expect( names[ 2 ] ).toContain( 'Border' );
	} );

	test( 'the name still contains the text that is shown on the button', async () => {
		await openSettings( () => Promise.resolve( {} ) );
		await openAppearance();

		[ ...document.querySelectorAll( 'button[aria-expanded]' ) ].forEach(
			( button ) => {
				const shown = button.textContent.trim();
				const name = button.getAttribute( 'aria-label' ) || shown;

				expect( shown.length ).toBeGreaterThan( 0 );
				expect( name ).toContain( shown );
			}
		);
	} );

	test( 'each Reset button says which color it resets', async () => {
		await openSettings( () => Promise.resolve( {} ) );
		await openAppearance();

		const resets = [ ...document.querySelectorAll( 'button' ) ].filter(
			( b ) => b.textContent.trim().startsWith( 'Reset' )
		);
		const names = resets.map(
			( b ) => b.getAttribute( 'aria-label' ) || b.textContent.trim()
		);

		expect( resets ).toHaveLength( 3 );
		expect( new Set( names ).size ).toBe( 3 );
		names.forEach( ( name ) => expect( name ).toContain( 'Reset' ) );
	} );
} );

describe( 'saving', () => {
	test( 'the Save button stays focusable after a save', async () => {
		const post = deferred();

		await openSettings( () => post.promise );
		await click( toggle( 'Accordion' ) );

		const button = saveButton();

		await act( async () => {
			button.focus();
		} );
		await click( button );

		// While the save runs and after it, a real disabled button would drop
		// the keyboard focus. It is only marked as unavailable instead.
		expect( saveButton().disabled ).toBe( false );
		expect( saveButton().getAttribute( 'aria-disabled' ) ).toBe( 'true' );

		post.resolve(
			response( {
				...STORED,
				disabled_blocks: [ 'lunar-blocks/accordion' ],
			} )
		);
		await waitFor( () =>
			document.body.textContent.includes( 'Settings saved.' )
		);

		expect( document.activeElement ).toBe( saveButton() );
		expect( saveButton().disabled ).toBe( false );
		expect( saveButton().getAttribute( 'aria-disabled' ) ).toBe( 'true' );

		// Lets the tab list finish its own timers before the test ends.
		await flush();
	} );

	test( 'a click on the Save button does nothing while there is nothing to save', async () => {
		await openSettings( () => Promise.resolve( {} ) );

		await click( saveButton() );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch.mock.calls[ 0 ][ 0 ].method ).toBeUndefined();
	} );

	test( 'sends every key of the option', async () => {
		const post = deferred();

		await openSettings( () => post.promise );
		await click( toggle( 'Callout' ) );
		await click( saveButton() );

		const sent = apiFetch.mock.calls.find(
			( [ { method } ] ) => 'POST' === method
		)[ 0 ];

		expect( sent.data[ OPTION ] ).toEqual( {
			...STORED,
			disabled_blocks: [ 'lunar-blocks/callout' ],
		} );
	} );

	test( 'an edit made while the save runs is kept and can be saved next', async () => {
		const post = deferred();

		await openSettings( () => post.promise );
		await click( toggle( 'Accordion' ) );
		await click( saveButton() );

		// The save is still running when the second block is turned off.
		await click( toggle( 'Callout' ) );

		post.resolve(
			response( {
				...STORED,
				disabled_blocks: [ 'lunar-blocks/accordion' ],
			} )
		);
		await waitFor( () =>
			document.body.textContent.includes( 'Settings saved.' )
		);

		expect( toggle( 'Accordion' ).checked ).toBe( false );
		expect( toggle( 'Callout' ).checked ).toBe( false );
		expect( saveButton().disabled ).toBe( false );
		expect( saveButton().getAttribute( 'aria-disabled' ) ).not.toBe(
			'true'
		);
	} );

	test( 'a save with no edits meanwhile shows the saved copy and turns Save off', async () => {
		const post = deferred();

		await openSettings( () => post.promise );
		await click( toggle( 'Accordion' ) );
		await click( saveButton() );

		post.resolve(
			response( {
				...STORED,
				disabled_blocks: [ 'lunar-blocks/accordion' ],
			} )
		);
		await waitFor( () =>
			document.body.textContent.includes( 'Settings saved.' )
		);

		expect( toggle( 'Accordion' ).checked ).toBe( false );
		expect(
			saveButton().disabled ||
				'true' === saveButton().getAttribute( 'aria-disabled' )
		).toBe( true );
		expect( document.body.textContent ).toContain( 'Settings saved.' );
	} );
} );

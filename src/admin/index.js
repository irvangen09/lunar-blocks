import {
	createRoot,
	useCallback,
	useEffect,
	useState,
} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Button, Notice, Spinner, TabPanel } from '@wordpress/components';

import AppearanceTab from './appearance-tab';
import BlocksTab from './blocks-tab';
import './style.scss';

function SettingsApp( { option, blocks } ) {
	const [ settings, setSettings ] = useState( null );
	const [ saved, setSaved ] = useState( null );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	// `submitted` is the copy a save sent. If the form changed while the save
	// ran, those newer edits stay on screen and can be saved next; only an
	// untouched form takes the copy the server sent back.
	const applyResponse = useCallback(
		( response, submitted = null ) => {
			const next = response[ option ];

			setSaved( next );
			setSettings( ( current ) =>
				null !== submitted && current !== submitted ? current : next
			);
		},
		[ option ]
	);

	const showError = useCallback(
		( error ) => setNotice( { status: 'error', message: error.message } ),
		[]
	);

	useEffect( () => {
		apiFetch( { path: '/wp/v2/settings' } )
			.then( applyResponse )
			.catch( showError );
	}, [ applyResponse, showError ] );

	const update = ( key ) => ( value ) =>
		setSettings( ( current ) => ( { ...current, [ key ]: value } ) );

	const save = () => {
		const submitted = settings;

		setIsSaving( true );
		setNotice( null );

		// The endpoint replaces the whole option, so send every key.
		apiFetch( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: { [ option ]: settings },
		} )
			.then( ( response ) => {
				applyResponse( response, submitted );
				setNotice( {
					status: 'success',
					message: __( 'Settings saved.', 'lunar-blocks' ),
				} );
			} )
			.catch( showError )
			.finally( () => setIsSaving( false ) );
	};

	const isDirty = JSON.stringify( settings ) !== JSON.stringify( saved );

	// Leaving with unsaved changes asks the browser to confirm.
	useEffect( () => {
		if ( ! isDirty ) {
			return undefined;
		}

		const warn = ( event ) => event.preventDefault();

		window.addEventListener( 'beforeunload', warn );

		return () => window.removeEventListener( 'beforeunload', warn );
	}, [ isDirty ] );

	return (
		<div className="lunar-settings">
			{ notice && (
				<Notice
					status={ notice.status }
					onRemove={ () => setNotice( null ) }
				>
					{ notice.message }
				</Notice>
			) }

			{ settings === null && ! notice && <Spinner /> }

			{ settings !== null && (
				<>
					<TabPanel
						tabs={ [
							{
								name: 'blocks',
								title: __( 'Blocks', 'lunar-blocks' ),
							},
							{
								name: 'appearance',
								title: __( 'Appearance', 'lunar-blocks' ),
							},
						] }
					>
						{ ( tab ) =>
							tab.name === 'blocks' ? (
								<BlocksTab
									blocks={ blocks }
									disabled={ settings.disabled_blocks }
									onChange={ update( 'disabled_blocks' ) }
								/>
							) : (
								<AppearanceTab
									colors={ settings.appearance }
									onChange={ update( 'appearance' ) }
								/>
							)
						}
					</TabPanel>

					<div className="lunar-settings__footer">
						<Button
							variant="primary"
							isBusy={ isSaving }
							disabled={ ! isDirty || isSaving }
							// A disabled button would drop the keyboard focus
							// after a save; this only marks it unavailable.
							accessibleWhenDisabled
							onClick={ save }
						>
							{ __( 'Save Changes', 'lunar-blocks' ) }
						</Button>
					</div>
				</>
			) }
		</div>
	);
}

const root = document.getElementById( 'lunar-blocks-settings' );
const data = window.lunarBlocksSettings;

if ( root && data ) {
	createRoot( root ).render(
		<SettingsApp option={ data.option } blocks={ data.blocks } />
	);
}

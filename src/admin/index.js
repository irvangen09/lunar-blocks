import { createRoot, useState, useEffect } from '@wordpress/element';
import {
	Card,
	CardHeader,
	CardBody,
	CheckboxControl,
	Button,
	Spinner,
	Notice,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';

import './style.scss';

/**
 * Root component for the "Lunar Blocks" settings page.
 *
 * Fetches the current per-block enable/disable state from
 * `lunar-blocks/v1/blocks` on mount, lets the user flip checkboxes
 * locally, then submits only the list of enabled slugs back to the
 * same endpoint on save. The endpoint owns the conversion to the
 * stored disabled-slug list (see Lunar\Blocks\Settings::update_blocks()),
 * so this component never needs to know about that storage format.
 */
function SettingsApp() {
	const [ blocks, setBlocks ] = useState( null );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );
	const [ loadError, setLoadError ] = useState( false );

	useEffect( () => {
		apiFetch( { path: '/lunar-blocks/v1/blocks' } )
			.then( setBlocks )
			.catch( () => setLoadError( true ) );
	}, [] );

	function toggleBlock( slug, enabled ) {
		setBlocks( ( current ) =>
			current.map( ( block ) =>
				block.slug === slug ? { ...block, enabled } : block
			)
		);
	}

	function save() {
		setIsSaving( true );
		setNotice( null );

		const enabled = blocks
			.filter( ( block ) => block.enabled )
			.map( ( block ) => block.slug );

		apiFetch( {
			path: '/lunar-blocks/v1/blocks',
			method: 'POST',
			data: { enabled },
		} )
			.then( ( updated ) => {
				setBlocks( updated );
				setNotice( {
					status: 'success',
					message: __( 'Settings saved.', 'lunar-blocks' ),
				} );
			} )
			.catch( () => {
				setNotice( {
					status: 'error',
					message: __(
						'Could not save settings. Please try again.',
						'lunar-blocks'
					),
				} );
			} )
			.finally( () => setIsSaving( false ) );
	}

	if ( loadError ) {
		return (
			<div className="lunar-blocks-settings__loading">
				<Notice status="error" isDismissible={ false }>
					{ __(
						'Could not load block settings. Please reload the page.',
						'lunar-blocks'
					) }
				</Notice>
			</div>
		);
	}

	if ( null === blocks ) {
		return (
			<div className="lunar-blocks-settings__loading">
				<Spinner />
			</div>
		);
	}

	return (
		<Card className="lunar-blocks-settings">
			<CardHeader>
				<h1>{ __( 'Lunar Blocks', 'lunar-blocks' ) }</h1>
			</CardHeader>
			<CardBody>
				<p>
					{ __(
						'Disabled blocks are not registered at all: they are removed from the block inserter and their CSS/JavaScript are never loaded on the front end.',
						'lunar-blocks'
					) }
				</p>

				{ notice && (
					<Notice status={ notice.status } isDismissible={ false }>
						{ notice.message }
					</Notice>
				) }

				{ blocks.map( ( block ) => (
					<div className="lunar-blocks-settings__row" key={ block.slug }>
						<CheckboxControl
							label={ block.title }
							checked={ block.enabled }
							onChange={ ( enabled ) =>
								toggleBlock( block.slug, enabled )
							}
						/>
						{ block.children.length > 0 && (
							<p className="lunar-blocks-settings__children">
								{ sprintf(
									/* translators: %s: comma-separated list of child block titles, e.g. "Accordion Item". */
									__(
										'Includes: %s (follows this toggle automatically).',
										'lunar-blocks'
									),
									block.children.join( ', ' )
								) }
							</p>
						) }
					</div>
				) ) }

				<Button
					variant="primary"
					isBusy={ isSaving }
					disabled={ isSaving }
					onClick={ save }
				>
					{ __( 'Save Changes', 'lunar-blocks' ) }
				</Button>
			</CardBody>
		</Card>
	);
}

const root = document.getElementById( 'lunar-blocks-settings-root' );

if ( root ) {
	createRoot( root ).render( <SettingsApp /> );
}
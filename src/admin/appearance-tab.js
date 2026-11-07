import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	Card,
	CardBody,
	ColorIndicator,
	ColorPicker,
	Dropdown,
} from '@wordpress/components';

// Shown in the picker while no override is set; nothing is saved until the user picks.
const PICKER_START_COLOR = '#757575';

export default function AppearanceTab( { colors, onChange } ) {
	const fields = [
		{
			key: 'primary',
			label: __( 'Primary', 'lunar-blocks' ),
			help: __(
				'Accent for active items, indicators and icons.',
				'lunar-blocks'
			),
		},
		{
			key: 'surface',
			label: __( 'Surface', 'lunar-blocks' ),
			help: __( 'Background of panels, cards and code.', 'lunar-blocks' ),
		},
		{
			key: 'border',
			label: __( 'Border', 'lunar-blocks' ),
			help: __( 'Lines and dividers.', 'lunar-blocks' ),
		},
	];

	const setColor = ( key, value ) =>
		onChange( { ...colors, [ key ]: value } );

	const shown = ( key ) =>
		colors[ key ] || __( 'Theme default', 'lunar-blocks' );

	return (
		<>
			<p>
				{ __(
					'Colors you leave unset follow your theme. Make sure a color you choose has enough contrast with your theme.',
					'lunar-blocks'
				) }
			</p>
			<Card>
				<CardBody className="lunar-settings__colors">
					{ fields.map( ( { key, label, help } ) => (
						<div className="lunar-settings__color" key={ key }>
							<div className="lunar-settings__color-label">
								<strong>{ label }</strong>
								<span>{ help }</span>
							</div>
							<Dropdown
								popoverProps={ { placement: 'bottom-start' } }
								renderToggle={ ( { isOpen, onToggle } ) => (
									<Button
										variant="secondary"
										aria-expanded={ isOpen }
										aria-label={ sprintf(
											/* translators: 1: color name, such as Primary. 2: the color that is set, or "Theme default". */
											__(
												'%1$s color: %2$s',
												'lunar-blocks'
											),
											label,
											shown( key )
										) }
										onClick={ onToggle }
									>
										<ColorIndicator
											colorValue={ colors[ key ] }
										/>
										<span>{ shown( key ) }</span>
									</Button>
								) }
								renderContent={ () => (
									<ColorPicker
										color={
											colors[ key ] || PICKER_START_COLOR
										}
										onChange={ ( value ) =>
											setColor( key, value )
										}
									/>
								) }
							/>
							<Button
								variant="tertiary"
								disabled={ ! colors[ key ] }
								aria-label={ sprintf(
									/* translators: %s: color name, such as Primary. */
									__( 'Reset %s', 'lunar-blocks' ),
									label
								) }
								onClick={ () => setColor( key, '' ) }
							>
								{ __( 'Reset', 'lunar-blocks' ) }
							</Button>
						</div>
					) ) }
				</CardBody>
			</Card>
		</>
	);
}

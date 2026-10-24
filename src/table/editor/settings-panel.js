import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

import {
	PRESET_DEFAULT,
	PRESET_1,
	PRESET_2,
	PRESET_3,
	PRESET_4,
	getImageWidth,
	isCardPreset,
} from '../utils';

const PRESET_OPTIONS = [
	{ label: __( 'Default', 'moon-blocks' ), value: PRESET_DEFAULT },
	{ label: __( 'Preset 1', 'moon-blocks' ), value: PRESET_1 },
	{ label: __( 'Preset 2', 'moon-blocks' ), value: PRESET_2 },
	{ label: __( 'Preset 3', 'moon-blocks' ), value: PRESET_3 },
	{ label: __( 'Preset 4', 'moon-blocks' ), value: PRESET_4 },
];

// Presets lay columns out by role, so the Inspector says which column
// does what.
const PRESET_HELP = {
	[ PRESET_DEFAULT ]: __(
		'A plain table that scrolls sideways on small screens.',
		'moon-blocks'
	),
	[ PRESET_1 ]: __(
		'A table with a flat header. On small screens each row becomes a card. An image first column becomes the card image and the next column its title.',
		'moon-blocks'
	),
	[ PRESET_2 ]: __(
		'A grid of cards. An image first column becomes the card image and the next column its title. The other columns become rows.',
		'moon-blocks'
	),
	[ PRESET_3 ]: __(
		'A list of cards with a checklist. An image first column becomes the card image and the next column its name. The next two text columns become badges, and the first is split at commas. The rest become fields.',
		'moon-blocks'
	),
	[ PRESET_4 ]: __(
		'A list of cards with a checklist. An image first column becomes the card image and the next column its name. The other columns become fields.',
		'moon-blocks'
	),
};

function CardToggles( { showCardNote, showCardHighlight, setAttributes } ) {
	return (
		<>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Note in card header', 'moon-blocks' ) }
				help={ __(
					'Shows the first column after the title as a small note, such as a level.',
					'moon-blocks'
				) }
				checked={ showCardNote }
				onChange={ ( value ) =>
					setAttributes( { showCardNote: value } )
				}
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Highlight band', 'moon-blocks' ) }
				help={ __(
					'Shows the last column as a highlighted band at the bottom of the card.',
					'moon-blocks'
				) }
				checked={ showCardHighlight }
				onChange={ ( value ) =>
					setAttributes( { showCardHighlight: value } )
				}
			/>
		</>
	);
}

function ImageWidthControl( { column, draft, onDraft, onWidth } ) {
	return (
		<TextControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ __( 'Image width — focused column (px)', 'moon-blocks' ) }
			help={ __(
				'The focused column is whichever cell you last clicked.',
				'moon-blocks'
			) }
			type="number"
			min="1"
			value={ draft ?? String( getImageWidth( column ) ) }
			onChange={ ( value ) => {
				onDraft( value );

				const width = parseInt( value, 10 );

				if ( width > 0 ) {
					onWidth( width );
				}
			} }
			onBlur={ () => onDraft( null ) }
		/>
	);
}

// widthDraft lets the width field be emptied while typing without
// snapping back to the default.
export default function SettingsPanel( {
	attributes,
	setAttributes,
	focusedColumn,
	widthDraft,
	onWidthDraft,
	onImageWidth,
} ) {
	const { preset, enableSort, enableFilter } = attributes;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Table Settings', 'moon-blocks' ) }>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Preset', 'moon-blocks' ) }
					help={ PRESET_HELP[ preset ] }
					value={ preset }
					options={ PRESET_OPTIONS }
					onChange={ ( value ) => setAttributes( { preset: value } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Sortable', 'moon-blocks' ) }
					checked={ enableSort }
					onChange={ ( value ) =>
						setAttributes( { enableSort: value } )
					}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Searchable', 'moon-blocks' ) }
					checked={ enableFilter }
					onChange={ ( value ) =>
						setAttributes( { enableFilter: value } )
					}
				/>

				{ isCardPreset( preset ) && (
					<CardToggles
						showCardNote={ attributes.showCardNote }
						showCardHighlight={ attributes.showCardHighlight }
						setAttributes={ setAttributes }
					/>
				) }

				{ focusedColumn && 'image' === focusedColumn.type && (
					<ImageWidthControl
						column={ focusedColumn }
						draft={ widthDraft }
						onDraft={ onWidthDraft }
						onWidth={ onImageWidth }
					/>
				) }
			</PanelBody>
		</InspectorControls>
	);
}

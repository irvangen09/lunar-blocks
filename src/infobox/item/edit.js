import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RadioControl, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { applyFilters } from '@wordpress/hooks';

export default function Edit( { attributes, setAttributes } ) {
	const { mode, label, fieldSourceId, fieldSourceLabel, value } = attributes;
	const isLinked = mode === 'linked';

	// blockProps must be attached to a single stable wrapper element (not
	// directly on either RichText below), since this block has two sibling
	// RichText fields (Label and Value). Attaching it directly to the Label
	// RichText makes WordPress treat Label as the block's primary focus
	// anchor, causing focus to jump back to Label every time the author
	// types in Value. The wrapper uses "display: contents" (see editor.scss)
	// so it doesn't break the dt/dd grid layout in .lunar-infobox__fields —
	// this wrapper only exists in the editor; save.js (frontend) renders
	// dt/dd directly with no wrapper at all.
	const blockProps = useBlockProps( {
		className: 'lunar-infobox-item',
	} );

	// Generic extension point (see LUNAR_BLOCKS_WIKI_INTEGRATION_CONTRACT.md).
	// Lunar Blocks has no knowledge of what this maps to (a taxonomy, or
	// anything else) — a provider plugin registers it, or it stays null.
	const fieldSource = applyFilters( 'lunarBlocks.infobox.fieldSource', null );

	const { fieldTerms, isLoadingTerms } = useSelect(
		( select ) => {
			if ( ! fieldSource || ! fieldSource.taxonomy ) {
				return { fieldTerms: [], isLoadingTerms: false };
			}

			const restBase = fieldSource.restBase || fieldSource.taxonomy;
			const query = { per_page: -1, hide_empty: false };
			const { getEntityRecords, isResolving } = select( coreStore );

			return {
				fieldTerms: getEntityRecords( 'taxonomy', restBase, query ) || [],
				isLoadingTerms: isResolving( 'getEntityRecords', [ 'taxonomy', restBase, query ] ),
			};
		},
		[ fieldSource ]
	);

	const fieldOptions = [
		{ label: __( '— Select —', 'lunar-blocks' ), value: 0 },
		...fieldTerms.map( ( term ) => ( { label: term.name, value: term.id } ) ),
	];

	const handleFieldChange = ( newValue ) => {
		const newTermId = Number( newValue );
		const matchedTerm = fieldTerms.find( ( term ) => term.id === newTermId );
		setAttributes( {
			fieldSourceId: newTermId,
			fieldSourceLabel: matchedTerm ? matchedTerm.name : '',
		} );
	};

	const displayLabel = fieldSourceLabel || __( '— Select a field —', 'lunar-blocks' );
	const fieldSelectLabel = fieldSource?.label || __( 'Field', 'lunar-blocks' );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'lunar-blocks' ) }>
					<RadioControl
						label={ __( 'Field Mode', 'lunar-blocks' ) }
						selected={ mode }
						options={ [
							{ label: __( 'Custom (manual label)', 'lunar-blocks' ), value: 'custom' },
							{
								label: __( 'Linked (synced to filters)', 'lunar-blocks' ),
								value: 'linked',
							},
						] }
						onChange={ ( newMode ) => setAttributes( { mode: newMode } ) }
					/>
					{ isLinked && fieldSource && (
						<SelectControl
							label={ fieldSelectLabel }
							value={ fieldSourceId }
							options={ fieldOptions }
							onChange={ handleFieldChange }
							help={
								isLoadingTerms
									? __( 'Loading fields…', 'lunar-blocks' )
									: undefined
							}
						/>
					) }
					{ isLinked && ! fieldSource && (
						<p>{ __( 'No field source is currently available.', 'lunar-blocks' ) }</p>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ isLinked ? (
					<dt className="lunar-infobox-item__label lunar-infobox-item__label--linked">
						{ displayLabel }
					</dt>
				) : (
					<RichText
						tagName="dt"
						className="lunar-infobox-item__label"
						placeholder={ __( 'Label', 'lunar-blocks' ) }
						value={ label }
						onChange={ ( newLabel ) => setAttributes( { label: newLabel } ) }
						allowedFormats={ [] }
					/>
				) }
				<RichText
					tagName="dd"
					className="lunar-infobox-item__value"
					placeholder={ __( 'Value', 'lunar-blocks' ) }
					value={ value }
					onChange={ ( newValue ) => setAttributes( { value: newValue } ) }
				/>
			</div>
		</>
	);
}
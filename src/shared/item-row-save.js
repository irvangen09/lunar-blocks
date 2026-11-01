import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_PATTERN } from './icon';

// Markup for a row made of an optional icon, a label and a value. The class
// names are built from the block's own class, as in item-row-edit.js. This is
// a plain function that save() calls, because useBlockProps.save() must run
// while save() runs.
export default function itemRowSave( { icon, label, value }, blockClass ) {
	const blockProps = useBlockProps.save( {
		className: blockClass,
	} );

	return (
		<div { ...blockProps }>
			<dt className={ `${ blockClass }__label` }>
				{ ICON_PATTERN.test( icon ) && (
					<span
						className={ `${ blockClass }__icon dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }
				<RichText.Content
					tagName="span"
					className={ `${ blockClass }__label-text` }
					value={ label }
				/>
			</dt>
			<RichText.Content
				tagName="dd"
				className={ `${ blockClass }__value` }
				value={ value }
			/>
		</div>
	);
}

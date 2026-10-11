import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_PATTERN } from '../../shared/icon';

export default function save( { attributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'moon-infobox-item',
	} );

	return (
		<div { ...blockProps }>
			<dt className="moon-infobox-item__label">
				{ ICON_PATTERN.test( icon ) && (
					<span
						className={ `moon-infobox-item__icon dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }
				<RichText.Content
					tagName="span"
					className="moon-infobox-item__label-text"
					value={ label }
				/>
			</dt>
			<RichText.Content
				tagName="dd"
				className="moon-infobox-item__value"
				value={ value }
			/>
		</div>
	);
}

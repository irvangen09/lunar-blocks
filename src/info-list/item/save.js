import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_PATTERN } from '../../shared/icon';

export default function save( { attributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'moon-info-list-item',
	} );

	return (
		<div { ...blockProps }>
			<dt className="moon-info-list-item__label">
				{ ICON_PATTERN.test( icon ) && (
					<span
						className={ `moon-info-list-item__icon dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }
				<RichText.Content
					tagName="span"
					className="moon-info-list-item__label-text"
					value={ label }
				/>
			</dt>
			<RichText.Content
				tagName="dd"
				className="moon-info-list-item__value"
				value={ value }
			/>
		</div>
	);
}

import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_PATTERN } from '../../../shared/icon';

export default function save( { attributes } ) {
	const { icon, text } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'moon-info-list-requirement',
	} );

	return (
		<li { ...blockProps }>
			{ ICON_PATTERN.test( icon ) && (
				<span
					className={ `moon-info-list-requirement__icon dashicons ${ icon }` }
					aria-hidden="true"
				/>
			) }
			<RichText.Content
				tagName="span"
				className="moon-info-list-requirement__text"
				value={ text }
			/>
		</li>
	);
}

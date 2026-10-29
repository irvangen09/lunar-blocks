import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { title, showCount, countText } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'lunar-info-list-requirements',
	} );

	const listProps = useInnerBlocksProps.save( {
		className: 'lunar-info-list-requirements__list',
	} );

	return (
		<div { ...blockProps }>
			<dt className="lunar-info-list-requirements__header">
				{ ! RichText.isEmpty( title ) && (
					<RichText.Content
						tagName="span"
						className="lunar-info-list-requirements__title"
						value={ title }
					/>
				) }
				{ showCount && '' !== countText && (
					<span className="lunar-info-list-requirements__count">
						{ countText }
					</span>
				) }
			</dt>
			<dd className="lunar-info-list-requirements__body">
				<ul { ...listProps } />
			</dd>
		</div>
	);
}

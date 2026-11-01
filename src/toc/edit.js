import { __ } from '@wordpress/i18n';
import { PlainText, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { MIN_ENTRIES, buildTree, collect } from './headings';
import List from './toc-list';

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;
	const blockProps = useBlockProps( { className: 'lunar-toc' } );

	const blocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks(),
		[]
	);
	const entries = collect( blocks );

	return (
		<div { ...blockProps }>
			<div className="lunar-toc__header">
				<PlainText
					className="lunar-toc__title"
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					onKeyDown={ ( event ) => {
						if ( 'Enter' === event.key ) {
							event.preventDefault();
						}
					} }
					placeholder={ __( 'Table of contents', 'lunar-blocks' ) }
					aria-label={ __( 'Title', 'lunar-blocks' ) }
				/>
			</div>
			{ entries.length >= MIN_ENTRIES ? (
				<nav className="lunar-toc__nav">
					<List nodes={ buildTree( entries ) } />
				</nav>
			) : (
				<p className="lunar-toc__notice">
					{ __(
						'The table of contents appears on the page once it has at least two headings.',
						'lunar-blocks'
					) }
				</p>
			) }
		</div>
	);
}

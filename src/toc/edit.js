/**
 * Editor-only placeholder — not a live preview of the actual table of
 * contents. Rendering the real list here would require ServerSideRender,
 * which adds a network round-trip for a preview that render.php already
 * regenerates correctly on the front end.
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps, PlainText } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-toc',
	} );

	return (
		<div { ...blockProps }>
			<div className="lunar-toc__header">
				<span className="lunar-toc__icon" aria-hidden="true">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<line x1="4" y1="6" x2="20" y2="6" />
						<line x1="4" y1="12" x2="20" y2="12" />
						<line x1="4" y1="18" x2="14" y2="18" />
					</svg>
				</span>
				<PlainText
					tagName="span"
					className="lunar-toc__title"
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					placeholder={ __( 'Table of Contents', 'lunar-blocks' ) }
				/>
			</div>

			<p className="lunar-toc__placeholder-note">
				{ __(
					'The table of contents is generated automatically from the article\u2019s headings when the page is displayed.',
					'lunar-blocks'
				) }
			</p>
		</div>
	);
}
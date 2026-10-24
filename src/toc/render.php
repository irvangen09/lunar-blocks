<?php
/**
 * Server-side render of the TOC block.
 *
 * @var array $attributes Block attributes.
 */

use MoonBlocks\Blocks\Toc\HeadingCollector;
use MoonBlocks\Blocks\Toc\TocRenderer;

defined( 'ABSPATH' ) || exit;

$moon_blocks_toc_post_id = (int) get_the_ID();

if ( $moon_blocks_toc_post_id <= 0 ) {
	return;
}

// Every value is escaped inside TocRenderer, and the wrapper attributes by WordPress.
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
echo TocRenderer::render(
	( new HeadingCollector() )->get( $moon_blocks_toc_post_id ),
	(string) ( $attributes['title'] ?? '' ),
	get_block_wrapper_attributes( array( 'class' => 'moon-toc' ) )
);
// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped

<?php
/**
 * Server-side render of the TOC block.
 *
 * @var array $attributes Block attributes.
 */

use LunarBlocks\Blocks\Toc\HeadingCollector;
use LunarBlocks\Blocks\Toc\TocRenderer;

defined( 'ABSPATH' ) || exit;

$lunar_blocks_toc_post_id = (int) get_the_ID();

if ( $lunar_blocks_toc_post_id <= 0 ) {
	return;
}

// Every value is escaped inside TocRenderer, and the wrapper attributes by WordPress.
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
echo TocRenderer::render(
	( new HeadingCollector() )->get( $lunar_blocks_toc_post_id ),
	(string) ( $attributes['title'] ?? '' ),
	get_block_wrapper_attributes( array( 'class' => 'lunar-toc' ) )
);
// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped

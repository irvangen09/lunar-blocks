<?php
/**
 * Extracts the title text from Accordion Item markup — shared by
 * Heading_Injector (injecting an id into render_block output) and
 * TOC_Builder (reading the text from parse_blocks() innerHTML).
 * This regex used to be duplicated identically in both files; it was
 * pulled out here so there's only one place to update if the CSS
 * class "lunar-accordion-item__title" ever changes.
 *
 * @package Lunar\Services
 */

namespace Lunar\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Accordion_Item_Title
 */
class Accordion_Item_Title {

	/**
	 * Extracts the title text from markup containing a heading with
	 * the class "lunar-accordion-item__title".
	 *
	 * Can't use the block's "title" attribute directly — it's sourced
	 * from rich-text/HTML, so it isn't available as a plain attrs
	 * value either via parse_blocks() (TOC_Builder) or via the
	 * render_block_* filter (Heading_Injector).
	 *
	 * @param string $html Markup to scan (block innerHTML or rendered output).
	 * @return string Title text (tags stripped), or an empty string if not found.
	 */
	public static function extract( string $html ): string {
		if ( ! preg_match( '/<h[1-6][^>]*class="[^"]*lunar-accordion-item__title[^"]*"[^>]*>(.*?)<\/h[1-6]>/s', $html, $matches ) ) {
			return '';
		}

		return trim( wp_strip_all_tags( $matches[1] ) );
	}
}

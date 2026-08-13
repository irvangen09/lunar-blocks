<?php
/**
 * Extracts the name text from Infobox markup — shared by
 * Heading_Injector (injecting an id into render_block output) and
 * TOC_Builder (reading the text from parse_blocks() innerHTML).
 *
 * @package Lunar\Services
 */

namespace Lunar\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Infobox_Title
 */
class Infobox_Title {

	/**
	 * Extracts the name text from markup containing a heading with
	 * the class "lunar-infobox__name".
	 *
	 * Only matches an actual heading tag (h1–h6) — when an Infobox's
	 * Heading Level is set to "None", its name renders as a plain
	 * paragraph instead, which this intentionally does not match, so
	 * it's naturally excluded without any extra "none" check.
	 *
	 * Can't use the block's "name" attribute directly — it's sourced
	 * from rich-text/HTML, so it isn't available as a plain attrs
	 * value either via parse_blocks() (TOC_Builder) or via the
	 * render_block_* filter (Heading_Injector).
	 *
	 * @param string $html Markup to scan (block innerHTML or rendered output).
	 * @return string Name text (tags stripped), or an empty string if not found.
	 */
	public static function extract( string $html ): string {
		if ( ! preg_match( '/<h[1-6][^>]*class="[^"]*lunar-infobox__name[^"]*"[^>]*>(.*?)<\/h[1-6]>/s', $html, $matches ) ) {
			return '';
		}

		return trim( wp_strip_all_tags( $matches[1] ) );
	}
}
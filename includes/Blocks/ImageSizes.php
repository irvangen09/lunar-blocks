<?php

namespace MoonBlocks\Blocks;

use WP_Block;
use WP_HTML_Tag_Processor;

/**
 * Writes the width that block images are drawn at into their sizes attribute.
 *
 * WordPress sizes an image that loads eagerly as if it filled the screen, so
 * the browser fetches the largest file even for a small thumbnail. The block
 * knows how wide its images are, so it tells the browser.
 */
class ImageSizes {

	private const INFOBOX_IMAGE_WIDTH = 192;

	// Matches $moon-breakpoint-mobile in the stylesheets.
	private const MOBILE_BREAKPOINT = 781;

	public function register(): void {
		add_filter( 'render_block_moon-blocks/gallery', array( $this, 'size_gallery' ), 10, 3 );
		add_filter( 'render_block_moon-blocks/infobox', array( $this, 'size_infobox' ) );
		add_filter( 'render_block_moon-blocks/table', array( $this, 'size_table' ) );
	}

	/**
	 * Gallery images fill one grid column: two columns on small screens.
	 *
	 * @param string   $content Rendered block.
	 * @param array    $parsed  Parsed block.
	 * @param WP_Block $block   Block instance.
	 */
	public function size_gallery( $content, $parsed = array(), $block = null ) {
		$columns = $block instanceof WP_Block ? (int) ( $block->attributes['columns'] ?? 3 ) : 3;
		$columns = max( 2, min( 4, $columns ) );
		$sizes   = sprintf( '(max-width: %dpx) 50vw, %dvw', self::MOBILE_BREAKPOINT, (int) floor( 100 / $columns ) );

		return $this->apply( (string) $content, 'moon-gallery-item__image', static fn() => $sizes );
	}

	/**
	 * The infobox image never grows past its frame.
	 *
	 * @param string $content Rendered block.
	 */
	public function size_infobox( $content ) {
		$sizes = self::INFOBOX_IMAGE_WIDTH . 'px';

		return $this->apply( (string) $content, 'moon-infobox__image', static fn() => $sizes );
	}

	/**
	 * Table images are drawn at the width stored in their inline style.
	 *
	 * @param string $content Rendered block.
	 */
	public function size_table( $content ) {
		return $this->apply(
			(string) $content,
			'moon-table__image',
			static function ( string $style ): string {
				return 1 === preg_match( '/--moon-table-image-width:\s*(\d+)px/', $style, $match ) ? $match[1] . 'px' : '';
			}
		);
	}

	/**
	 * Adds sizes to every image with the class, unless it already has one.
	 *
	 * @param string   $html       Rendered block.
	 * @param string   $class_name Image class.
	 * @param callable $resolve    Receives the style attribute, returns the sizes value or ''.
	 */
	private function apply( string $html, string $class_name, callable $resolve ): string {
		$tags = new WP_HTML_Tag_Processor( $html );

		while ( $tags->next_tag(
			array(
				'tag_name'   => 'img',
				'class_name' => $class_name,
			)
		) ) {
			if ( null !== $tags->get_attribute( 'sizes' ) ) {
				continue;
			}

			$sizes = $resolve( (string) $tags->get_attribute( 'style' ) );

			if ( '' !== $sizes ) {
				$tags->set_attribute( 'sizes', $sizes );
			}
		}

		return $tags->get_updated_html();
	}
}

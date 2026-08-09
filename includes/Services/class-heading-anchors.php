<?php
/**
 * Shared service that generates a unique slug/ID from heading text,
 * used in three places:
 * 1. Injecting an id into real headings in the article body.
 * 2. Injecting an id into Accordion Item titles.
 * 3. Building matching links for the table of contents.
 *
 * Each consumer creates its own instance (not a global singleton) —
 * what matters is that the algorithm and processing order stay
 * consistent, not that state is shared directly between consumers.
 *
 * @package Lunar\Services
 */

namespace Lunar\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Heading_Anchors
 */
class Heading_Anchors {

	/**
	 * Slugs already used in the current run (one page/request), so
	 * headings with identical text don't produce colliding ids.
	 *
	 * @var string[]
	 */
	private array $used_slugs = array();

	/**
	 * Resets the slug list — called before processing a single
	 * article, so nothing carries over from a previous run.
	 */
	public function reset(): void {
		$this->used_slugs = array();
	}

	/**
	 * Registers an anchor that was already set manually (e.g. the
	 * Heading block's built-in "HTML Anchor" field), so auto-generated
	 * anchors on other headings don't happen to collide with it.
	 *
	 * @param string $anchor Manually-set anchor.
	 * @return string Final anchor (identical, unless it turns out to
	 *                collide with one already used — then a unique
	 *                variant is generated instead).
	 */
	public function use_manual( string $anchor ): string {
		$anchor = sanitize_title( $anchor );

		if ( '' === $anchor ) {
			return $this->generate( '' );
		}

		if ( ! in_array( $anchor, $this->used_slugs, true ) ) {
			$this->used_slugs[] = $anchor;
			return $anchor;
		}

		return $this->generate( $anchor );
	}

	/**
	 * Generates a unique slug from heading text.
	 *
	 * @param string $text Heading text (may contain HTML, will be stripped).
	 * @return string Unique slug, ready to use as an id/#fragment.
	 */
	public function generate( string $text ): string {
		$base = sanitize_title( wp_strip_all_tags( $text ) );

		if ( '' === $base ) {
			$base = 'section';
		}

		$slug   = $base;
		$suffix = 2;

		while ( in_array( $slug, $this->used_slugs, true ) ) {
			$slug = $base . '-' . $suffix;
			++$suffix;
		}

		$this->used_slugs[] = $slug;

		return $slug;
	}
}
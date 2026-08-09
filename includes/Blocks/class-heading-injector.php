<?php
/**
 * Injects an `id` attribute into real headings in the article body
 * (core/heading) and Accordion Item titles, so the links built by
 * TOC_Builder can actually jump to the intended section.
 *
 * Uses the exact same algorithm and processing order as TOC_Builder
 * (see class-toc-builder.php) — the two run independently, but because
 * they process headings in the same document order with a
 * Heading_Anchors instance reset at the same point (the start of
 * 'the_content'), the ids they produce always match.
 *
 * Only does work on singular posts that actually contain a TOC block —
 * without one on the page there's nothing to link to, so the filters
 * skip their work rather than rewriting every heading's markup
 * site-wide as an unconditional side effect of the plugin being active.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

use Lunar\Services\Heading_Anchors;
use Lunar\Services\Accordion_Item_Title;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Heading_Injector
 */
class Heading_Injector {

	/**
	 * Heading_Anchors instance shared across a single page render
	 * (reset every time 'the_content' starts).
	 *
	 * @var Heading_Anchors
	 */
	private Heading_Anchors $anchors;

	public function __construct() {
		$this->anchors = new Heading_Anchors();
	}

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		// Priority 8 — before do_blocks() (priority 9) starts rendering
		// blocks, so the anchor tracker is always clean at the start of
		// every 'the_content' call (e.g. multiple posts on an archive page).
		add_filter( 'the_content', array( $this, 'reset_anchors' ), 8 );

		add_filter( 'render_block_core/heading', array( $this, 'inject_heading_anchor' ), 10, 2 );
		add_filter( 'render_block_lunar-blocks/accordion-item', array( $this, 'inject_accordion_item_anchor' ), 10, 2 );
	}

	/**
	 * Checks whether the current singular post actually contains a TOC
	 * block. Checked independently in every callback (rather than once
	 * and cached) because the render_block_* filters can fire for
	 * headings rendered outside the main 'the_content' stream within
	 * the same request (e.g. a widget) — a cached decision from an
	 * earlier post could otherwise leak into unrelated content there.
	 */
	private function is_needed(): bool {
		return is_singular() && has_block( 'lunar-blocks/toc', get_the_ID() );
	}

	/**
	 * Resets the anchor tracker. Returned unchanged (passthrough) —
	 * this function only piggybacks on the 'the_content' filter for its
	 * side effect.
	 *
	 * @param string $content Content, left unchanged by this function.
	 * @return string
	 */
	public function reset_anchors( string $content ): string {
		if ( $this->is_needed() ) {
			$this->anchors->reset();
		}

		return $content;
	}

	/**
	 * Injects an id into rendered <h2>-<h6> markup from core/heading,
	 * but only if it doesn't already have one (e.g. from a manual HTML
	 * Anchor that WordPress itself already rendered).
	 *
	 * @param string $block_content Rendered heading markup.
	 * @param array  $block Block data (attrs, etc).
	 * @return string
	 */
	public function inject_heading_anchor( string $block_content, array $block ): string {
		if ( ! $this->is_needed() || '' === trim( $block_content ) ) {
			return $block_content;
		}

		$manual_anchor = $block['attrs']['anchor'] ?? '';

		if ( '' !== $manual_anchor ) {
			// Already has an id from a manual HTML Anchor (WordPress
			// core already rendered this id) — just register it so no
			// other heading reuses it; no need to inject again.
			$this->anchors->use_manual( $manual_anchor );
			return $block_content;
		}

		if ( false !== strpos( $block_content, ' id=' ) ) {
			// Just in case an id already exists from some other source.
			return $block_content;
		}

		$text = trim( wp_strip_all_tags( $block_content ) );

		if ( '' === $text ) {
			return $block_content;
		}

		$anchor = $this->anchors->generate( $text );

		return (string) preg_replace(
			'/<h([1-6])\b/',
			'<h$1 id="' . esc_attr( $anchor ) . '"',
			$block_content,
			1
		);
	}

	/**
	 * Injects an id into an Accordion Item title, the same way.
	 * Accordion Item has no manual HTML Anchor option, so it always
	 * auto-generates (unless headingLevel is "none" — no heading at
	 * all to inject into).
	 *
	 * @param string $block_content Rendered Accordion Item markup.
	 * @param array  $block Block data (attrs, etc).
	 * @return string
	 */
	public function inject_accordion_item_anchor( string $block_content, array $block ): string {
		if ( ! $this->is_needed() ) {
			return $block_content;
		}

		$heading_level = $block['attrs']['headingLevel'] ?? 'h2';

		if ( 'none' === $heading_level ) {
			return $block_content;
		}

		// Can't use $block['attrs']['title'] — that attribute is
		// sourced from HTML (rich-text), so it isn't available as a
		// plain attrs value via the render_block_* filter (the same
		// issue TOC_Builder has). Extract it directly from the
		// already-rendered markup instead.
		$text = Accordion_Item_Title::extract( $block_content );

		if ( '' === $text ) {
			return $block_content;
		}

		$anchor = $this->anchors->generate( $text );

		// Target the heading tag with the "lunar-accordion-item__title"
		// class specifically — not just the first heading tag found —
		// so this doesn't misfire if the Accordion Item's free-form
		// content happens to contain another heading.
		return (string) preg_replace(
			'/(<h[1-6][^>]*class="[^"]*lunar-accordion-item__title[^"]*"[^>]*)(>)/',
			'$1 id="' . esc_attr( $anchor ) . '"$2',
			$block_content,
			1
		);
	}
}
<?php
/**
 * Core logic for the TOC block — scans post_content for headings
 * (including Accordion Item titles), then builds a nested structure
 * based on heading level.
 *
 * Kept separate from render.php (rather than a global function inside
 * it) so there's no risk of a "Cannot redeclare function" fatal if
 * this block is rendered more than once in a single request.
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
 * Class TOC_Builder
 */
class TOC_Builder {

	/**
	 * Gets every heading in a post, each with a unique anchor.
	 *
	 * @param int $post_id Post ID to scan.
	 * @return array<int, array{level:int, text:string, anchor:string}>
	 */
	public function get_headings( int $post_id ): array {
		$post_content = get_post_field( 'post_content', $post_id );

		if ( ! is_string( $post_content ) || '' === $post_content ) {
			return array();
		}

		$blocks = parse_blocks( $post_content );
		$raw    = array();

		$this->collect_headings( $blocks, $raw );

		if ( empty( $raw ) ) {
			return array();
		}

		$anchors = new Heading_Anchors();
		$anchors->reset();

		foreach ( $raw as &$heading ) {
			$manual_anchor = $heading['manual_anchor'] ?? '';

			$heading['anchor'] = ( '' !== $manual_anchor )
				? $anchors->use_manual( $manual_anchor )
				: $anchors->generate( $heading['text'] );

			unset( $heading['manual_anchor'] );
		}
		unset( $heading );

		return $raw;
	}

	/**
	 * Recursively scans the block array returned by parse_blocks().
	 *
	 * Recognizes 2 heading sources:
	 * - Regular "core/heading" blocks, wherever they appear (including
	 *   nested inside Accordion/Tabs/Steps).
	 * - "lunar-blocks/accordion-item" titles (unless headingLevel is
	 *   "none") — this title isn't a separate Heading block, it's an
	 *   attribute on the block itself.
	 *
	 * Infobox needs no special exclusion here — by structure, it can't
	 * contain "core/heading" or "accordion-item" (its fields are
	 * rich-text, not InnerBlocks).
	 *
	 * @param array $blocks Block array (from parse_blocks() or innerBlocks).
	 * @param array $results Collected by reference, not by return value.
	 */
	private function collect_headings( array $blocks, array &$results ): void {
		foreach ( $blocks as $block ) {
			$block_name = $block['blockName'] ?? '';

			if ( 'core/heading' === $block_name ) {
				$text = trim( wp_strip_all_tags( $block['innerHTML'] ?? '' ) );

				if ( '' !== $text ) {
					$results[] = array(
						'level'         => (int) ( $block['attrs']['level'] ?? 2 ),
						'text'          => $text,
						'manual_anchor' => $block['attrs']['anchor'] ?? '',
					);
				}
			} elseif ( 'lunar-blocks/accordion-item' === $block_name ) {
				$heading_level = $block['attrs']['headingLevel'] ?? 'h2';

				if ( 'none' !== $heading_level ) {
					$text = Accordion_Item_Title::extract( $block['innerHTML'] ?? '' );

					if ( '' !== $text ) {
						$results[] = array(
							'level' => (int) substr( $heading_level, 1 ),
							'text'  => $text,
						);
					}
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->collect_headings( $block['innerBlocks'], $results );
			}
		}
	}

	/**
	 * Turns a flat list of headings into a nested tree based on level —
	 * an H3 automatically becomes a child of the preceding H2, etc.
	 *
	 * @param array $headings Result of get_headings().
	 * @return array Tree structure: each node has 'text', 'anchor', 'children'.
	 */
	public function build_tree( array $headings ): array {
		$root = array();

		// Sentinel level 0 at the bottom of the stack — lower than any
		// real heading (minimum H2), so the "while deeper level" logic
		// works uniformly without a special case for the first item.
		$stack   = array();
		$stack[] = array(
			'level'    => 0,
			'children' => &$root,
		);

		foreach ( $headings as $heading ) {
			while ( count( $stack ) > 1 && $stack[ count( $stack ) - 1 ]['level'] >= $heading['level'] ) {
				array_pop( $stack );
			}

			$top_index = count( $stack ) - 1;

			$stack[ $top_index ]['children'][] = array(
				'text'     => $heading['text'],
				'anchor'   => $heading['anchor'],
				'children' => array(),
			);

			$new_index = count( $stack[ $top_index ]['children'] ) - 1;

			$stack[] = array(
				'level'    => $heading['level'],
				'children' => &$stack[ $top_index ]['children'][ $new_index ]['children'],
			);
		}

		return $root;
	}

	/**
	 * Renders a tree structure into nested <ul><li> HTML.
	 *
	 * @param array $nodes Tree structure from build_tree().
	 * @return string
	 */
	public function render_tree( array $nodes ): string {
		if ( empty( $nodes ) ) {
			return '';
		}

		$html = '<ul class="lunar-toc__list">';

		foreach ( $nodes as $node ) {
			$html .= '<li class="lunar-toc__item">';
			$html .= '<a href="#' . esc_attr( $node['anchor'] ) . '">' . esc_html( $node['text'] ) . '</a>';
			$html .= $this->render_tree( $node['children'] );
			$html .= '</li>';
		}

		$html .= '</ul>';

		return $html;
	}
}
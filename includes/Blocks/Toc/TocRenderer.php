<?php

namespace LunarBlocks\Blocks\Toc;

/**
 * Builds the TOC markup from the collected entries. Every value is escaped here.
 */
class TocRenderer {

	/**
	 * Returns the markup, or an empty string when there are too few headings.
	 *
	 * @param array<int, array{type: string, level: int, text: string, id: string}> $entries            Collected entries.
	 * @param string                                                                $title              Title set on the block, may be empty.
	 * @param string                                                                $wrapper_attributes Escaped attributes for the root element.
	 */
	public static function render( array $entries, string $title, string $wrapper_attributes ): string {
		if ( count( $entries ) < Toc::MIN_ENTRIES ) {
			return '';
		}

		$title = '' !== trim( $title ) ? trim( $title ) : __( 'Table of contents', 'lunar-blocks' );

		$html  = '<details ' . $wrapper_attributes . '>';
		$html .= '<summary class="lunar-toc__header">';
		$html .= '<span class="lunar-toc__title">' . esc_html( $title ) . '</span>';
		$html .= '<span class="lunar-toc__toggle" aria-hidden="true"></span>';
		$html .= '</summary>';
		$html .= '<nav class="lunar-toc__nav" aria-label="' . esc_attr( $title ) . '">';
		$html .= self::render_list( self::build_tree( $entries ), 0 );
		$html .= '</nav>';
		$html .= '</details>';

		return $html;
	}

	/**
	 * Nests entries by level, relative to the entry before: an H3 sits under the
	 * H2 above it, and a heading that skips a level becomes a direct child. The
	 * first entry is the top level whatever its level is.
	 *
	 * @param array $entries Collected entries.
	 * @return array<int, object{entry: array, children: array}>
	 */
	private static function build_tree( array $entries ): array {
		$root  = array();
		$stack = array();

		foreach ( $entries as $entry ) {
			$node = (object) array(
				'entry'    => $entry,
				'children' => array(),
			);

			while ( ! empty( $stack ) && end( $stack )->entry['level'] >= $entry['level'] ) {
				array_pop( $stack );
			}

			if ( empty( $stack ) ) {
				$root[] = $node;
			} else {
				end( $stack )->children[] = $node;
			}

			$stack[] = $node;
		}

		return $root;
	}

	private static function render_list( array $nodes, int $depth ): string {
		$class = 'lunar-toc__list' . ( $depth > 0 ? ' lunar-toc__list--sub' : '' );
		$html  = '<ul class="' . esc_attr( $class ) . '" role="list">';

		foreach ( $nodes as $node ) {
			$html .= '<li class="lunar-toc__item">';
			$html .= '<a class="lunar-toc__link" href="#' . esc_attr( $node->entry['id'] ) . '">';
			$html .= '<span class="lunar-toc__marker" aria-hidden="true"></span>';
			$html .= '<span class="lunar-toc__text">' . esc_html( $node->entry['text'] ) . '</span>';
			$html .= '</a>';

			if ( ! empty( $node->children ) ) {
				$html .= self::render_list( $node->children, $depth + 1 );
			}

			$html .= '</li>';
		}

		return $html . '</ul>';
	}
}

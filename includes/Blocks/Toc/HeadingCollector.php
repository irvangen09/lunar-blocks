<?php

namespace MoonBlocks\Blocks\Toc;

use WP_HTML_Tag_Processor;

/**
 * Finds the headings of a post by reading its raw block markup, and gives each
 * one an id. The result is the single source of ids: the TOC links to them and
 * HeadingAnchorInjector writes them onto the headings.
 *
 * Each entry is array{type: string, level: int, text: string, id: string}.
 */
class HeadingCollector {

	public const TYPE_HEADING   = 'heading';
	public const TYPE_ACCORDION = 'accordion';

	private const TRANSIENT_PREFIX = 'moon_blocks_toc_';

	private const CACHE_LIFETIME = DAY_IN_SECONDS;

	/**
	 * Blocks whose contents never reach the TOC.
	 */
	private const SKIPPED_BLOCKS = array( 'moon-blocks/infobox' );

	/**
	 * Returns the entries of a post, from cache when the content has not changed.
	 *
	 * @param int $post_id Post ID.
	 * @return array<int, array{type: string, level: int, text: string, id: string}>
	 */
	public function get( int $post_id ): array {
		$content = $this->get_content( $post_id );

		if ( ! str_contains( $content, '<!-- wp:' ) ) {
			return array();
		}

		$hash   = md5( $content );
		$key    = $this->cache_key( $post_id );
		$cached = get_transient( $key );

		if ( is_array( $cached ) && ( $cached['hash'] ?? null ) === $hash && is_array( $cached['entries'] ?? null ) ) {
			return $cached['entries'];
		}

		$entries = $this->collect( parse_blocks( $content ) );

		set_transient(
			$key,
			array(
				'hash'    => $hash,
				'entries' => $entries,
			),
			self::CACHE_LIFETIME
		);

		return $entries;
	}

	/**
	 * Drops the cached entries of a post.
	 *
	 * @param int $post_id Post ID.
	 */
	public function clear( int $post_id ): void {
		delete_transient( $this->cache_key( $post_id ) );
	}

	/**
	 * Describes a parsed block as a TOC entry without an id, or returns null when
	 * the block does not belong in the TOC. The injector uses this too, so both
	 * sides decide with the same code.
	 *
	 * @param array $block Parsed block.
	 * @return array{type: string, level: int, text: string}|null
	 */
	public static function describe( array $block ): ?array {
		$name = $block['blockName'] ?? '';

		if ( 'core/heading' === $name ) {
			$level = (int) ( $block['attrs']['level'] ?? 2 );
			$text  = AnchorSlugger::plain_text( (string) ( $block['innerHTML'] ?? '' ) );
			$type  = self::TYPE_HEADING;
		} elseif ( 'moon-blocks/accordion-item' === $name ) {
			$tag = (string) ( $block['attrs']['headingLevel'] ?? 'h3' );

			// "none" renders the title as a span, which is not a heading.
			if ( 1 !== preg_match( '/^h([2-6])$/', $tag, $level_match ) ) {
				return null;
			}

			$level = (int) $level_match[1];
			$head  = (string) ( $block['innerContent'][0] ?? '' );
			$text  = '';
			$type  = self::TYPE_ACCORDION;

			if ( 1 === preg_match( '~<(h[2-6])\b[^>]*\bmoon-accordion-item__title\b[^>]*>(.*?)</\1>~is', $head, $title_match ) ) {
				$text = AnchorSlugger::plain_text( $title_match[2] );
			}
		} else {
			return null;
		}

		if ( $level < 2 || $level > 6 || '' === $text ) {
			return null;
		}

		return array(
			'type'  => $type,
			'level' => $level,
			'text'  => $text,
		);
	}

	/**
	 * Whether two descriptions are the same heading.
	 *
	 * @param array $a First description.
	 * @param array $b Second description.
	 */
	public static function is_same( array $a, array $b ): bool {
		return $a['type'] === $b['type'] && $a['level'] === $b['level'] && $a['text'] === $b['text'];
	}

	/**
	 * The id an author already gave a block with "HTML anchor", or an empty
	 * string. Gutenberg keeps the anchor in the saved markup, not in the block
	 * comment, so the first tag of the block is read; the comment attribute is
	 * only a fallback.
	 *
	 * @param array $block Parsed block.
	 */
	private static function existing_id( array $block ): string {
		$html = $block['innerContent'][0] ?? '';

		if ( is_string( $html ) && str_starts_with( ltrim( $html ), '<' ) ) {
			$tags = new WP_HTML_Tag_Processor( $html );

			if ( $tags->next_tag() ) {
				$id = $tags->get_attribute( 'id' );

				if ( is_string( $id ) && '' !== $id ) {
					return $id;
				}
			}
		}

		$anchor = $block['attrs']['anchor'] ?? '';

		return is_string( $anchor ) ? $anchor : '';
	}

	private function collect( array $blocks ): array {
		$slugger = new AnchorSlugger();

		// Hand-typed anchors anywhere in the post are reserved first, so a
		// generated id never takes one that appears later in the post.
		$this->reserve_anchors( $blocks, $slugger );

		$entries = array();
		$this->walk( $blocks, $slugger, $entries );

		return $entries;
	}

	private function reserve_anchors( array $blocks, AnchorSlugger $slugger ): void {
		foreach ( $blocks as $block ) {
			$slugger->reserve( self::existing_id( $block ) );

			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->reserve_anchors( $block['innerBlocks'], $slugger );
			}
		}
	}

	private function walk( array $blocks, AnchorSlugger $slugger, array &$entries ): void {
		foreach ( $blocks as $block ) {
			if ( in_array( $block['blockName'] ?? '', self::SKIPPED_BLOCKS, true ) ) {
				continue;
			}

			$description = self::describe( $block );

			if ( null !== $description ) {
				$anchor = self::existing_id( $block );

				$description['id'] = '' !== $anchor ? $anchor : $slugger->make( $description['text'] );

				$entries[] = $description;
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->walk( $block['innerBlocks'], $slugger, $entries );
			}
		}
	}

	/**
	 * The raw content of a post, or an empty string when the visitor may not
	 * read it. In a preview the global post is the unsaved revision, so it wins
	 * over the stored post with the same ID.
	 *
	 * @param int $post_id Post ID.
	 */
	private function get_content( int $post_id ): string {
		$current = get_post();
		$post    = ( $current instanceof \WP_Post && $post_id === $current->ID ) ? $current : get_post( $post_id );

		if ( ! $post instanceof \WP_Post || ! $this->can_read( $post ) ) {
			return '';
		}

		return (string) $post->post_content;
	}

	/**
	 * Whether the visitor may see the content of a post. The TOC can sit in a
	 * template, outside the post content, where WordPress has not checked this.
	 *
	 * @param \WP_Post $post Post.
	 */
	private function can_read( \WP_Post $post ): bool {
		if ( post_password_required( $post ) ) {
			return false;
		}

		$status = get_post_status_object( get_post_status( $post ) );

		if ( $status && $status->public ) {
			return true;
		}

		return current_user_can( 'read_post', $post->ID );
	}

	private function cache_key( int $post_id ): string {
		return self::TRANSIENT_PREFIX . $post_id . '_' . preg_replace( '/[^0-9a-z]/i', '', MOON_BLOCKS_VERSION );
	}
}

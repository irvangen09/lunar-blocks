<?php

namespace MoonBlocks\Blocks\Toc;

use WP_HTML_Tag_Processor;

/**
 * Writes the ids chosen by HeadingCollector onto the headings of the post being
 * displayed, so the links in the TOC have something to land on.
 *
 * Matching happens in render_block_data, which runs in document order and parent
 * before children, the same order the collector walks the post. The claimed id
 * travels on the parsed block to the render_block filter that writes it.
 */
class HeadingAnchorInjector {

	private const ID_KEY = 'moonTocId';

	private HeadingCollector $collector;

	/**
	 * One state per the_content run, so a post inside another post (a query
	 * loop, say) does not disturb the outer run.
	 *
	 * @var array<int, array<int, array{entry: array, claimed: bool}>>
	 */
	private array $stack = array();

	public function __construct( HeadingCollector $collector ) {
		$this->collector = $collector;
	}

	public function register(): void {
		add_filter( 'the_content', array( $this, 'begin' ), 8 );
		add_filter( 'the_content', array( $this, 'end' ), 99999 );
		add_filter( 'render_block_data', array( $this, 'claim' ), 10, 1 );
		add_filter( 'render_block_core/heading', array( $this, 'write' ), 10, 2 );
		add_filter( 'render_block_moon-blocks/accordion-item', array( $this, 'write' ), 10, 2 );
	}

	/**
	 * Starts a run for the post being displayed.
	 *
	 * @param string $content Post content.
	 */
	public function begin( $content ) {
		$post_id = (int) get_the_ID();
		$entries = $post_id > 0 ? $this->collector->get( $post_id ) : array();
		$state   = array();

		// Without a TOC to link to there is nothing to anchor.
		if ( count( $entries ) >= Toc::MIN_ENTRIES ) {
			foreach ( $entries as $entry ) {
				$state[] = array(
					'entry'   => $entry,
					'claimed' => false,
				);
			}
		}

		$this->stack[] = $state;

		return $content;
	}

	/**
	 * Ends the run started by begin().
	 *
	 * @param string $content Post content.
	 */
	public function end( $content ) {
		array_pop( $this->stack );

		return $content;
	}

	/**
	 * Gives the next matching, still unclaimed entry to a heading about to render.
	 *
	 * @param array $parsed_block Parsed block.
	 * @return array
	 */
	public function claim( $parsed_block ) {
		if ( empty( $this->stack ) || ! is_array( $parsed_block ) ) {
			return $parsed_block;
		}

		$description = HeadingCollector::describe( $parsed_block );

		if ( null === $description ) {
			return $parsed_block;
		}

		$last = array_key_last( $this->stack );

		foreach ( $this->stack[ $last ] as $index => $slot ) {
			if ( ! $slot['claimed'] && HeadingCollector::is_same( $slot['entry'], $description ) ) {
				$this->stack[ $last ][ $index ]['claimed'] = true;

				$parsed_block['attrs'][ self::ID_KEY ] = $slot['entry']['id'];
				break;
			}
		}

		return $parsed_block;
	}

	/**
	 * Writes the claimed id onto the first tag of the rendered block, unless the
	 * author already gave it one.
	 *
	 * @param string $block_content Rendered block.
	 * @param array  $parsed_block  Parsed block.
	 */
	public function write( $block_content, $parsed_block ) {
		$id = $parsed_block['attrs'][ self::ID_KEY ] ?? '';

		if ( ! is_string( $id ) || '' === $id || ! is_string( $block_content ) ) {
			return $block_content;
		}

		$tags = new WP_HTML_Tag_Processor( $block_content );

		if ( ! $tags->next_tag() || null !== $tags->get_attribute( 'id' ) ) {
			return $block_content;
		}

		$tags->set_attribute( 'id', $id );

		return $tags->get_updated_html();
	}
}

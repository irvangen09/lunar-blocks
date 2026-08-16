<?php
/**
 * Watches for lunar-blocks/infobox-item blocks in post_content and,
 * whenever a post is saved, announces each one's field data through a
 * public action hook, so other plugins can react to it — Lunar Blocks
 * doesn't know or care whether anything is listening.
 *
 * Hooks both save_post (fires for Classic Editor / Ajax saves, and
 * also for REST-originated saves) and rest_after_insert_{post_type}
 * for every REST-visible post type, so the sync is consistent
 * regardless of which path a given site/editor actually uses. A post
 * is only processed once per request, so a save that happens to fire
 * both hooks doesn't announce the same field data twice.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Infobox_Sync
 */
class Infobox_Sync {

	private const TARGET_BLOCK = 'lunar-blocks/infobox-item';

	/**
	 * Post IDs already synced in the current request.
	 *
	 * @var array<int, true>
	 */
	private array $processed = array();

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		add_action( 'save_post', array( $this, 'handle_save_post' ), 10, 2 );
		add_action( 'rest_api_init', array( $this, 'register_rest_hooks' ) );
	}

	/**
	 * Adds a rest_after_insert_{post_type} listener for every
	 * REST-visible post type. Deferred to rest_api_init (rather than
	 * registered unconditionally) since these hooks are only ever
	 * relevant during a REST request anyway, and post types are
	 * already fully registered by this point.
	 */
	public function register_rest_hooks(): void {
		foreach ( get_post_types( array( 'show_in_rest' => true ), 'names' ) as $post_type ) {
			add_action( "rest_after_insert_{$post_type}", array( $this, 'handle_rest_after_insert' ) );
		}
	}

	/**
	 * save_post callback.
	 *
	 * @param int      $post_id Post ID being saved.
	 * @param \WP_Post $post    Post object being saved.
	 */
	public function handle_save_post( int $post_id, \WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		$this->maybe_sync( $post );
	}

	/**
	 * rest_after_insert_{post_type} callback.
	 *
	 * @param \WP_Post $post Post object that was just inserted/updated.
	 */
	public function handle_rest_after_insert( \WP_Post $post ): void {
		if ( wp_is_post_revision( $post->ID ) || wp_is_post_autosave( $post->ID ) ) {
			return;
		}

		$this->maybe_sync( $post );
	}

	/**
	 * Parses the post's content once per request and fires the action
	 * for every Infobox Item block found in it.
	 *
	 * @param \WP_Post $post Post object.
	 */
	private function maybe_sync( \WP_Post $post ): void {
		if ( isset( $this->processed[ $post->ID ] ) ) {
			return;
		}

		if ( ! is_string( $post->post_content ) || false === strpos( $post->post_content, self::TARGET_BLOCK ) ) {
			return;
		}

		$this->processed[ $post->ID ] = true;

		$this->sync_blocks( parse_blocks( $post->post_content ), $post );
	}

	/**
	 * Recursively scans a block array for Infobox Item instances.
	 *
	 * @param array    $blocks Block array (from parse_blocks() or innerBlocks).
	 * @param \WP_Post $post   Post object, passed through to the action.
	 */
	private function sync_blocks( array $blocks, \WP_Post $post ): void {
		foreach ( $blocks as $block ) {
			if ( self::TARGET_BLOCK === ( $block['blockName'] ?? '' ) ) {
				$this->fire_action( $block, $post );
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->sync_blocks( $block['innerBlocks'], $post );
			}
		}
	}

	/**
	 * Builds $field_data from a single Infobox Item block and fires
	 * the public action.
	 *
	 * @param array    $block Parsed block array for one infobox-item instance.
	 * @param \WP_Post $post  Post object.
	 */
	private function fire_action( array $block, \WP_Post $post ): void {
		$attrs = $block['attrs'] ?? array();

		$field_source_id    = $attrs['fieldSourceId'] ?? 0;
		$field_source_label = $attrs['fieldSourceLabel'] ?? '';

		$field_data = array(
			'label'              => (string) ( $attrs['label'] ?? '' ),
			'value'              => $this->extract_value( $block['innerHTML'] ?? '' ),
			'field_source_id'    => $field_source_id ? $field_source_id : null,
			'field_source_label' => '' !== $field_source_label ? $field_source_label : null,
		);

		/**
		 * Fires whenever an Infobox Field (lunar-blocks/infobox-item) is
		 * saved as part of a post. This is a public extension point —
		 * Lunar Blocks itself has no listener for it.
		 *
		 * @param int      $post_id    ID of the post containing this block.
		 * @param array    $field_data Field data — label, value, field_source_id, field_source_label.
		 * @param \WP_Post $post       Full post object.
		 */
		do_action( 'lunar_blocks_infobox_field_saved', $post->ID, $field_data, $post );
	}

	/**
	 * Extracts the value text from Infobox Item markup.
	 *
	 * Can't use the block's "value" attribute directly — it's sourced
	 * from rich-text/HTML, so it isn't available as a plain attrs value
	 * from parse_blocks().
	 *
	 * @param string $html Block innerHTML.
	 * @return string Value text (tags stripped), or an empty string if not found.
	 */
	private function extract_value( string $html ): string {
		if ( ! preg_match( '/<dd[^>]*class="[^"]*lunar-infobox-item__value[^"]*"[^>]*>(.*?)<\/dd>/s', $html, $matches ) ) {
			return '';
		}

		return trim( wp_strip_all_tags( $matches[1] ) );
	}
}
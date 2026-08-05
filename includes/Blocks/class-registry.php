<?php
/**
 * Discovers built blocks and registers only the ones that are active.
 *
 * Blocks are discovered by recursively scanning build/ for every
 * block.json found, at any depth, rather than through a single bulk
 * manifest call — a disabled block must not be registered at all, so
 * that it disappears from the inserter and WordPress never loads its
 * declared style/script assets.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Registry
 */
class Registry {

	/**
	 * Option name for the list of disabled block slugs.
	 *
	 * A slug's absence from this list means the block is active —
	 * new blocks are active by default the moment they're built,
	 * with no migration needed for existing installs.
	 *
	 * @var string
	 */
	private const OPTION = 'lunar_blocks_disabled_blocks';

	/**
	 * Absolute path to the build/ directory to scan.
	 *
	 * @var string
	 */
	private string $build_path;

	/**
	 * Cache of discovered blocks for the current request.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private ?array $blocks = null;

	/**
	 * Constructor.
	 *
	 * @param string $build_path Absolute path to the build/ directory.
	 */
	public function __construct( string $build_path ) {
		$this->build_path = untrailingslashit( $build_path );
	}

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		add_action( 'init', array( $this, 'register_blocks' ) );
	}

	/**
	 * Registers each discovered block that is currently active.
	 */
	public function register_blocks(): void {
		foreach ( $this->all() as $slug => $block ) {

			if ( ! $this->is_active( $slug ) ) {
				continue;
			}

			$registered = register_block_type( $block['path'] );

			$this->set_script_translations( $registered );
		}
	}

	/**
	 * Registers translations for a block's editor script handle(s),
	 * so strings wrapped in `__()` in edit.js are actually translated
	 * once a translation file for the visitor's locale exists in
	 * languages/.
	 *
	 * @param \WP_Block_Type|false $block_type Return value of
	 *        register_block_type(), or false if registration failed.
	 */
	private function set_script_translations( $block_type ): void {
		if ( ! $block_type instanceof \WP_Block_Type ) {
			return;
		}

		foreach ( $block_type->editor_script_handles as $handle ) {
			wp_set_script_translations( $handle, 'lunar-blocks', LUNAR_BLOCKS_PLUGIN_DIR . 'languages' );
		}
	}

	/**
	 * Discovers every block available in build/, active or not.
	 *
	 * Used both by register_blocks() and by Settings, which needs to
	 * list every available block along with its current state.
	 *
	 * @return array<string, array<string, mixed>> Discovered blocks,
	 *         keyed by slug, each with 'name', 'title', 'path', and 'parent'.
	 */
	public function all(): array {
		if ( null !== $this->blocks ) {
			return $this->blocks;
		}

		$this->blocks = array();

		if ( ! is_dir( $this->build_path ) ) {
			return $this->blocks;
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $this->build_path, \FilesystemIterator::SKIP_DOTS )
		);

		foreach ( $iterator as $file ) {

			if ( 'block.json' !== $file->getFilename() ) {
				continue;
			}

			$metadata = json_decode( (string) file_get_contents( $file->getPathname() ), true );

			if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
				continue;
			}

			$slug = $this->slug_from_name( $metadata['name'] );

			$this->blocks[ $slug ] = array(
				'name'   => $metadata['name'],
				'title'  => $metadata['title'] ?? $slug,
				'path'   => $file->getPath(),
				'parent' => $metadata['parent'][0] ?? null,
			);
		}

		return $this->blocks;
	}

	/**
	 * Derives a block's registry slug from its block.json "name", by
	 * stripping the "lunar-blocks/" namespace prefix.
	 *
	 * Deriving the slug from the block name (rather than its folder
	 * name) keeps it unique even though several child blocks share
	 * the folder name "item" under different parents.
	 *
	 * @param string $block_name Full block name, e.g. 'lunar-blocks/accordion-item'.
	 * @return string Slug, e.g. 'accordion-item'.
	 */
	private function slug_from_name( string $block_name ): string {
		$prefix = 'lunar-blocks/';

		if ( str_starts_with( $block_name, $prefix ) ) {
			return substr( $block_name, strlen( $prefix ) );
		}

		return $block_name;
	}

	/**
	 * Checks whether a given block slug is currently active.
	 *
	 * A child block (one with a non-null 'parent') has no independent
	 * on/off state of its own — it always follows its parent's state,
	 * since it can only ever be inserted inside its parent anyway.
	 *
	 * @param string $slug Block slug, e.g. 'accordion'.
	 */
	public function is_active( string $slug ): bool {
		$parent_slug = $this->parent_slug( $slug );

		if ( null !== $parent_slug ) {
			return $this->is_active( $parent_slug );
		}

		return ! in_array( $slug, self::get_disabled_blocks(), true );
	}

	/**
	 * Resolves a block's parent slug, if it has one.
	 *
	 * @param string $slug Block slug.
	 * @return string|null Parent's own slug, or null if this block
	 *         has no parent or its parent isn't found among the
	 *         blocks discovered by all().
	 */
	private function parent_slug( string $slug ): ?string {
		$blocks = $this->all();

		$parent_name = $blocks[ $slug ]['parent'] ?? null;

		if ( null === $parent_name ) {
			return null;
		}

		foreach ( $blocks as $candidate_slug => $candidate ) {
			if ( $candidate['name'] === $parent_name ) {
				return $candidate_slug;
			}
		}

		return null;
	}

	/**
	 * Gets every top-level (non-child) block slug — the set of blocks
	 * that get their own independent toggle in Settings. Child blocks
	 * are excluded; their state always follows their parent.
	 *
	 * @return string[]
	 */
	public function toggleable_slugs(): array {
		return array_keys(
			array_filter(
				$this->all(),
				static fn( array $block ): bool => null === $block['parent']
			)
		);
	}

	/**
	 * Gets the option name the disabled-block list is stored under.
	 */
	public static function option_name(): string {
		return self::OPTION;
	}

	/**
	 * Gets the list of currently disabled block slugs.
	 *
	 * @return string[]
	 */
	public static function get_disabled_blocks(): array {
		$disabled = get_option( self::OPTION, array() );

		return is_array( $disabled ) ? $disabled : array();
	}

	/**
	 * Saves the list of disabled block slugs.
	 *
	 * @param string[] $slugs Block slugs to store as disabled.
	 */
	public static function set_disabled_blocks( array $slugs ): void {
		$sanitized = array_values( array_unique( array_map( 'sanitize_key', $slugs ) ) );

		update_option( self::OPTION, $sanitized );
	}

	/**
	 * Checks whether the page currently being viewed contains a given
	 * block, for blocks that load extra assets only when actually
	 * needed on the front end.
	 *
	 * @param string $block_name Full block name, e.g. 'lunar-blocks/infobox'.
	 */
	public function page_has_block( string $block_name ): bool {
		if ( ! is_singular() ) {
			return false;
		}

		return has_block( $block_name, get_the_ID() );
	}
}
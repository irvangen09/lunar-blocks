<?php
/**
 * Registers RichText Formats provided by Lunar Blocks (e.g. Version/Patch Tag).
 *
 * Kept separate from Registry because formats don't use the Block API
 * (no block.json), so their asset pipeline differs: the script is only
 * needed in the editor, while the style must load in the editor and
 * on the front end alike, so the badge still renders for readers.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Formats
 */
class Formats {

	/**
	 * Absolute path to the build/ directory.
	 *
	 * @var string
	 */
	private string $build_path;

	/**
	 * URL to the build/ directory.
	 *
	 * @var string
	 */
	private string $build_url;

	/**
	 * Constructor.
	 *
	 * @param string $build_path Absolute path to the build/ directory.
	 * @param string $build_url  URL to the build/ directory.
	 */
	public function __construct( string $build_path, string $build_url ) {
		$this->build_path = untrailingslashit( $build_path );
		$this->build_url  = untrailingslashit( $build_url );
	}

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_style' ) );
	}

	/**
	 * Loads the toolbar button script and style in the Block Editor.
	 *
	 * wp-scripts names the compiled frontend stylesheet "style-index.css",
	 * not "index.css" — the latter is the editor-only stylesheet name.
	 */
	public function enqueue_editor_assets(): void {
		$asset = $this->get_asset_file( 'version-tag' );

		if ( null === $asset ) {
			return;
		}

		wp_enqueue_script(
			'lunar-blocks-version-tag',
			$this->build_url . '/version-tag/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( 'lunar-blocks-version-tag', 'lunar-blocks', LUNAR_BLOCKS_PLUGIN_DIR . 'languages' );

		wp_enqueue_style(
			'lunar-blocks-version-tag',
			$this->build_url . '/version-tag/style-index.css',
			array(),
			$asset['version']
		);
	}

	/**
	 * Loads the style only on the front end — the badge still needs to
	 * render for readers even though the toolbar button (JS) has no
	 * purpose outside the editor.
	 *
	 * Loaded conditionally, only when the current post's content
	 * actually contains this format's marker. There's no has_block()
	 * equivalent for RichText Formats, so it's checked manually against
	 * the className this format serializes into post_content.
	 */
	public function enqueue_frontend_style(): void {
		if ( ! is_singular() ) {
			return;
		}

		$post = get_post();

		if ( ! $post || ! str_contains( $post->post_content, 'lunar-version-tag' ) ) {
			return;
		}

		$asset = $this->get_asset_file( 'version-tag' );

		if ( null === $asset ) {
			return;
		}

		wp_enqueue_style(
			'lunar-blocks-version-tag',
			$this->build_url . '/version-tag/style-index.css',
			array(),
			$asset['version']
		);
	}

	/**
	 * Reads a wp-scripts-generated *.asset.php file.
	 *
	 * Fails gracefully if the entry hasn't been built yet.
	 *
	 * @param string $entry_name Entry folder name under build/.
	 * @return array{dependencies: array, version: string}|null
	 */
	private function get_asset_file( string $entry_name ): ?array {
		$path = $this->build_path . '/' . $entry_name . '/index.asset.php';

		if ( ! file_exists( $path ) ) {
			return null;
		}

		return require $path;
	}
}

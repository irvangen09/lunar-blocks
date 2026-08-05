<?php
/**
 * Global Settings admin page and its REST API.
 *
 * The page itself is a React app (src/admin/) — this class only
 * registers the menu, enqueues that app's assets on its own screen,
 * and exposes the REST routes it reads from and writes to. No HTML
 * form or table is rendered here.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Settings
 */
class Settings {

	/**
	 * Admin page slug.
	 *
	 * @var string
	 */
	private const PAGE_SLUG = 'lunar-blocks';

	/**
	 * REST namespace and route for the block toggle list.
	 *
	 * @var string
	 */
	private const REST_NAMESPACE = 'lunar-blocks/v1';

	/**
	 * Registry instance, shared with the block registration pass so
	 * both read from the same discovery cache.
	 *
	 * @var Registry
	 */
	private Registry $registry;

	/**
	 * Hook suffix returned by add_menu_page(), used to conditionally
	 * enqueue assets only on this exact admin screen.
	 *
	 * @var string
	 */
	private string $page_hook = '';

	/**
	 * Constructor.
	 *
	 * @param Registry $registry Shared block registry instance.
	 */
	public function __construct( Registry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Adds the top-level "Lunar Blocks" admin menu.
	 */
	public function register_menu(): void {
		$this->page_hook = add_menu_page(
			__( 'Lunar Blocks', 'lunar-blocks' ),
			__( 'Lunar Blocks', 'lunar-blocks' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			'dashicons-block-default'
		);
	}

	/**
	 * Renders the settings page shell. The React app owns everything
	 * inside the mount point, including its own heading.
	 */
	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		echo '<div class="wrap"><div id="lunar-blocks-settings-root"></div></div>';
	}

	/**
	 * Enqueues the settings React app only on its own admin screen.
	 *
	 * @param string $hook_suffix Current admin page hook, as passed by WordPress.
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( $hook_suffix !== $this->page_hook ) {
			return;
		}

		$asset_file = LUNAR_BLOCKS_PLUGIN_DIR . 'build/admin/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'lunar-blocks-settings',
			LUNAR_BLOCKS_PLUGIN_URL . 'build/admin/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( 'lunar-blocks-settings', 'lunar-blocks', LUNAR_BLOCKS_PLUGIN_DIR . 'languages' );

		// wp-components' own stylesheet is a separate registered
		// handle in WordPress core — required for Card/Button/
		// CheckboxControl/Notice/Spinner to render correctly, and
		// not pulled in automatically just because our script
		// depends on the wp-components *script* handle.
		wp_enqueue_style( 'wp-components' );

		$style_path = LUNAR_BLOCKS_PLUGIN_DIR . 'build/admin/style-index.css';

		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'lunar-blocks-settings',
				LUNAR_BLOCKS_PLUGIN_URL . 'build/admin/style-index.css',
				array( 'wp-components' ),
				$asset['version']
			);
		}
	}

	/**
	 * Registers the REST routes the settings app reads from and
	 * writes to.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/blocks',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_blocks' ),
					'permission_callback' => array( $this, 'permission_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_blocks' ),
					'permission_callback' => array( $this, 'permission_check' ),
					'args'                => array(
						'enabled' => array(
							'type'     => 'array',
							'items'    => array( 'type' => 'string' ),
							'required' => true,
						),
					),
				),
			)
		);
	}

	/**
	 * Permission check shared by both REST routes.
	 */
	public function permission_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * GET /lunar-blocks/v1/blocks — lists every toggleable block with
	 * its current active state and any child blocks it carries along.
	 */
	public function get_blocks(): \WP_REST_Response {
		return new \WP_REST_Response( $this->block_list() );
	}

	/**
	 * POST /lunar-blocks/v1/blocks — saves which blocks are enabled.
	 *
	 * The request carries an "enabled" allow-list (the intuitive
	 * direction for the UI), converted here to the disabled-slug deny
	 * -list Registry actually stores, since changing that storage
	 * format now would be a breaking change for existing installs.
	 *
	 * @param \WP_REST_Request $request Current REST request.
	 */
	public function update_blocks( \WP_REST_Request $request ): \WP_REST_Response {
		$enabled = array_map( 'sanitize_key', (array) $request->get_param( 'enabled' ) );

		$toggleable = $this->registry->toggleable_slugs();
		$disabled   = array_values( array_diff( $toggleable, $enabled ) );

		Registry::set_disabled_blocks( $disabled );

		// Discovery itself hasn't changed, only which slugs are
		// disabled — re-reading is enough, no need to re-scan build/.
		return new \WP_REST_Response( $this->block_list() );
	}

	/**
	 * Builds the block list payload shared by both REST callbacks.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function block_list(): array {
		$blocks     = $this->registry->all();
		$toggleable = $this->registry->toggleable_slugs();

		$items = array();

		foreach ( $toggleable as $slug ) {
			$items[] = array(
				'slug'     => $slug,
				'title'    => $blocks[ $slug ]['title'] ?? $slug,
				'enabled'  => $this->registry->is_active( $slug ),
				'children' => $this->child_titles( $slug, $blocks ),
			);
		}

		return $items;
	}

	/**
	 * Gets the display titles of a top-level block's child blocks, if
	 * any — lets the UI explain why a block like Accordion Item has
	 * no checkbox of its own.
	 *
	 * @param string                               $parent_slug Top-level block's slug.
	 * @param array<string, array<string, mixed>>   $blocks      Full result of Registry::all().
	 * @return string[] Child block titles, in discovery order.
	 */
	private function child_titles( string $parent_slug, array $blocks ): array {
		$parent_name = $blocks[ $parent_slug ]['name'] ?? null;

		if ( null === $parent_name ) {
			return array();
		}

		$titles = array();

		foreach ( $blocks as $block ) {
			if ( ( $block['parent'] ?? null ) === $parent_name ) {
				$titles[] = $block['title'];
			}
		}

		return $titles;
	}
}
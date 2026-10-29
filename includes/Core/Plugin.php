<?php

namespace LunarBlocks\Core;

use LunarBlocks\Blocks\BlockRegistry;
use LunarBlocks\Blocks\ImageSizes;
use LunarBlocks\Blocks\Toc\Toc;
use LunarBlocks\Services\DesignTokens;
use LunarBlocks\Settings\SettingsPage;
use LunarBlocks\Settings\SettingsRegistry;

class Plugin {

	public function run(): void {
		$settings = new SettingsRegistry();
		$settings->register();

		( new DesignTokens( $settings ) )->register();

		$blocks = new BlockRegistry( $settings );
		$blocks->register();

		( new Toc() )->register();
		( new ImageSizes() )->register();

		// The settings screen needs the full block list, including disabled blocks.
		if ( is_admin() ) {
			( new SettingsPage( $blocks ) )->register();
		}
	}
}

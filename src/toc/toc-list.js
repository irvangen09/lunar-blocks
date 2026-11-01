export default function List( { nodes, depth = 0 } ) {
	return (
		<ul
			className={
				'lunar-toc__list' + ( depth > 0 ? ' lunar-toc__list--sub' : '' )
			}
		>
			{ nodes.map( ( node, index ) => (
				<li className="lunar-toc__item" key={ index }>
					<span className="lunar-toc__link">
						<span
							className="lunar-toc__marker"
							aria-hidden="true"
						/>
						<span className="lunar-toc__text">
							{ node.entry.text }
						</span>
					</span>
					{ node.children.length > 0 && (
						<List nodes={ node.children } depth={ depth + 1 } />
					) }
				</li>
			) ) }
		</ul>
	);
}

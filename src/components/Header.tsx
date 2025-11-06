import React from "react";
import { Link, NavLink } from "react-router-dom";

export const Header: React.FC = () => {
	return (
		<header className="text-white fixed top-0 left-0 z-50 bg-gray-800 w-full">
			<div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
				<div className="text-xl font-bold">
					<Link to="/">ZooApp</Link>
				</div>

				<nav className="space-x-4">
					<NavLink
						to="/animals"
						className={({ isActive }) =>
							isActive ? "underline font-semibold" : "hover:underline"
						}
					>
						Животные
					</NavLink>
					<NavLink
						to="/favorites"
						className={({ isActive }) =>
							isActive ? "underline font-semibold" : "hover:underline"
						}
					>
						Избранное
					</NavLink>
					<NavLink
						to="/addNewAnimal"
						className={({ isActive }) =>
							isActive ? "underline font-semibold" : "hover:underline"
						}
					>
						Добавить
					</NavLink>
				</nav>
			</div>
		</header>
	);
};

import { type FC } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AllAnimalsLoader from "./components/AnimalsLoader";
import { AnimalCardComponent } from "./components/AnimalCard";
import { FavoritesList } from "./components/FavoritesList";
import { CreateAnimalForm } from "./components/AddNewAnimal";
import { Header } from "./components/Header";
import { MainPage } from "./components/MainPage";

interface AppProps {}

const App: FC<AppProps> = () => (
	<HashRouter>
		<Header />
		<main className="w-full mt-10">
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/animals" element={<AllAnimalsLoader />} />
				<Route path="/animals/:name" element={<AnimalCardComponent />} />
				<Route path="/favorites" element={<FavoritesList />} />
				<Route path="/addNewAnimal" element={<CreateAnimalForm />} />
			</Routes>
		</main>
	</HashRouter>
);

export default App;

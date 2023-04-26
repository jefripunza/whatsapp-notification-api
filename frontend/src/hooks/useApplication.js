import { useContext } from "react";
import ApplicationContext from "../contexts/ApplicationContext";

const useApplication = () => useContext(ApplicationContext);

export default useApplication;

import { createContext, useContext } from "react";


export const ContextData = createContext({});


export const useContextData = () => {
  return  useContext(ContextData)
}
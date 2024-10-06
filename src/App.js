import React, { useState } from "react";

import Parte1 from "./components/Parte1";
import Parte2 from "./components/Parte2";
import AFNThompson from "./Thompson";
import AFDSubconjuntos from "./Subconjuntos";
import EstadosSignificativos from "./EstadosSignificativos";
import "./styles.css";

export default function App() {
  const [regex, setRegex] = useState("");
  const [isValidRegex, setIsValidRegex] = useState(true);
  const [disabledInputs, setDisabledInputs] = useState(false);
  const [thompsonAFN, setThompsonAFN] = useState();
  const [subconjAFD, setSubconjAFD] = useState();
  const [estSigAFD, setEstSigAFD] = useState();
  let aux1, aux2;

  const handleSubmit = () => {
    setDisabledInputs(true); // Desactiva botón e input
    // Confirma que no es una cadena vacía y es una regex válida
    try {
      new RegExp(regex);
      if (!regex.trim()) {
        setIsValidRegex(false);
      } else {
        // Si no detecta error, llama a las funciones de creación de autómatas
        // con los debidos parámetros
        aux1 = AFNThompson(regex);
        setThompsonAFN(aux1); // Coloca AFN de Thompson
        aux2 = AFDSubconjuntos(aux1);
        setSubconjAFD(aux2); // Coloca AFD por Subconjuntos
        setEstSigAFD(EstadosSignificativos(aux1, aux2)); // Coloca AFD por est. sign.
      }
    } catch (e) {
      setIsValidRegex(false);
    }
    setDisabledInputs(false); // Activa botón e input
  };

  return (
    <div className="app">
      <h1>Análisis Léxico</h1>
      <input
        label="Expresión regular"
        placeholder="Ingrese una expresión regular"
        value={regex}
        onChange={(e) => {
          setRegex(e.target.value.replace(/\s+/g, ""));
          setIsValidRegex(true);
          if (estSigAFD) {
            setThompsonAFN(null);
            setSubconjAFD(null);
            setEstSigAFD(null);
          }
        }}
        disabled={disabledInputs}
        className="styled-input"
      ></input>
      <p
        className="error-message"
        style={{
          display: isValidRegex ? "none" : "block",
        }}
      >
        La expresión regular ingresada no es válida.
      </p>
      <button
        onClick={handleSubmit}
        disabled={disabledInputs}
        className="styled-button"
      >
        Construir
      </button>

      <div style={{ width: "80%" }}>
        {estSigAFD ? (
          <>
            <Parte1
              thompsonAFN={thompsonAFN}
              subconjAFD={subconjAFD}
              estSigAFD={estSigAFD}
            />
            <Parte2 AFDNoOptimo={subconjAFD} AFDOptimo={estSigAFD} />
          </>
        ) : (
          <>
            <p>
              Ingrese una expresión regular para obtener los autómatas y poder
              hacer reconocimiento de cadenas con ellos.
            </p>
            <ul>
              <li>Use el símbolo "&" como épsilon.</li>
              <li>No utilice un símbolo para la concatenación.</li>
              <li>Use solamente los símbolos para |, *, + y ?.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

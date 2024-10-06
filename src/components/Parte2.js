import React, { useState } from "react";
import Graph from "./Graph";
import "../styles.css";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AFDComponent({ AFD, cadena }) {
  const [els, setEls] = useState(AFD.getRenderedElements());
  const [reconoce, setReconoce] = useState(false);
  const [ruta, setRuta] = useState([]);
  const [disabledInputs, setDisabledInputs] = useState(false);
  let estadoSig, c, estadoActual, aux, ultAristaId, auxRuta;

  const handleRecognize = async () => {
    setDisabledInputs(true); // Desactiva botón e input
    setReconoce(false);
    // Muestra recorridos del reconocimiento o no reconocimiento
    // según la función mueve
    // Muestra si reconoce o no
    estadoActual = AFD.inicial;
    aux = JSON.parse(JSON.stringify(AFD.getRenderedElements()));
    ultAristaId = aux.findIndex(
      (e) => (e.data.source == "i") & (e.data.target == estadoActual)
    );
    aux[ultAristaId].data.lineColor = "blue";
    auxRuta = [];
    for (let i = 0; i < cadena.length; i++) {
      auxRuta.push(estadoActual);
      c = cadena[i];
      // Colorea estado actual
      aux[aux.findIndex((e) => e.data.id == estadoActual)].data.borderColor =
        "red";
      setEls(JSON.parse(JSON.stringify(aux)));
      await sleep(1000);
      // Busca estado siguiente según mueve
      estadoSig = AFD.mueve(estadoActual, c);
      // Si encuentra estado siguiente, colorea arista que los une
      if (estadoSig.length) {
        estadoSig = estadoSig[0];
        // Colorea anterior arista en rojo
        aux[ultAristaId].data.lineColor = "red";
        // Colorea arista de nueva transición en azul
        ultAristaId = aux.findIndex(
          (e) =>
            (e.data.source == estadoActual) &
            (e.data.target == estadoSig) &
            (e.data.label == c)
        );
        aux[ultAristaId].data.lineColor = "blue";
        estadoActual = estadoSig; // Se pasa al siguiente estado
      } else {
        // Si no hay posibilidad de movimiento, rompe el ciclo
        aux[ultAristaId].data.lineColor = "red"; // Colorea última arista en rojo
        setEls(JSON.parse(JSON.stringify(aux))); // Actualiza elementos
        setDisabledInputs(false); // Activa botón e input
        setRuta(auxRuta); // Coloca ruta
        return;
      }
    }
    // Colorea última arista en rojo
    aux[ultAristaId].data.lineColor = "red";
    // Colorea último estado actual en rojo
    aux[aux.findIndex((e) => e.data.id == estadoActual)].data.borderColor =
      "red";
    // Coloca ruta
    setRuta([...auxRuta, estadoActual]);
    // Actualiza elementos
    setEls(JSON.parse(JSON.stringify(aux)));
    if (
      ((estadoActual == AFD.inicial) &
        AFD.final.includes(parseInt(estadoActual))) |
      AFD.final.includes(parseInt(estadoSig))
    ) {
      // Verifica si se llegó hasta el estado final
      // tras reconocer toda la cadena con éxito
      setReconoce(true);
    }
    setDisabledInputs(false); // Activa botón e input
  };

  return (
    <>
      <button
        onClick={handleRecognize}
        disabled={disabledInputs}
        className="styled-button"
      >
        Reconocer cadena
      </button>
      <Graph elementos={els} tooltips={false} />
      {reconoce ? (
        <p>
          SÍ SE RECONOCIÓ LA CADENA.
          <br />
          {ruta.length ? "Ruta de Estados: " + ruta.join(", ") : <></>}
        </p>
      ) : (
        <p>
          NO SE HA RECONOCIDO LA CADENA.
          <br />
          {ruta.length ? "Ruta de Estados: " + ruta.join(", ") : <></>}
        </p>
      )}
    </>
  );
}

export default function Parte2({ AFDNoOptimo, AFDOptimo }) {
  const [cadena, setCadena] = useState("");

  return (
    <div className="app">
      <h1>Reconocimiento de Cadenas utilizando los AFD</h1>
      <input
        label="Cadena"
        placeholder="Ingrese una cadena"
        className="styled-input"
        value={cadena}
        onChange={(e) => setCadena(e.target.value)}
      ></input>
      <h2>AFD No Óptimo</h2>
      <AFDComponent AFD={AFDNoOptimo} cadena={cadena} />
      <h2>AFD Óptimo</h2>
      <AFDComponent AFD={AFDOptimo} cadena={cadena} />
    </div>
  );
}
